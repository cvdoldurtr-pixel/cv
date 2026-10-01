// Claude proxy: API anahtarı sunucuda kalır. Ücretsiz: IP başına günde 3 hak. Ücretli planlar: plana göre günlük hak (_lib.mjs). Ücretsiz kullanıcılar için ayrıca genel günlük tavan vardır.
import { getStore } from '@netlify/blobs';
import { json, getIp, verifyAccess, PLANS } from './_lib.mjs';

const FREE_PER_DAY = 3;
// Tüm ücretsiz kullanıcıların toplam günlük AI çağrı tavanı (maliyet kalkanı). Netlify'da FREE_AI_DAILY_CAP ile değiştirilir.
const GLOBAL_FREE_CAP = () => Number(process.env.FREE_AI_DAILY_CAP) || 400;
const clean = (s, n = 400) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return json({ error: 'AI henüz yapılandırılmadı' }, 503);

  const { type, context = {}, token } = await req.json().catch(() => ({}));
  let access = null;
  try { access = verifyAccess(token); } catch { return json({ error: 'Sunucu yapılandırması eksik' }, 503); }
  const limit = access ? PLANS[access.plan].aiPerDay : FREE_PER_DAY;
  const day = new Date().toISOString().slice(0, 10);
  const id = access ? `p-${access.oid}` : `f-${getIp(req)}`;
  const store = getStore('ai-usage');
  const key = `${day}-${id}`;
  const used = Number((await store.get(key)) || 0);
  if (used >= limit) return json({ error: 'LIMIT' }, 429);
  // Ücretsiz kullanıcılar için genel günlük tavan: kötüye kullanım maliyeti sınırlar
  const gkey = `${day}-global-free`;
  const gUsed = access ? 0 : Number((await store.get(gkey)) || 0);
  if (!access && gUsed >= GLOBAL_FREE_CAP()) return json({ error: 'BUSY' }, 429);

  const lang = context.lang === 'en' ? 'English' : 'Türkçe';
  let prompt;
  if (type === 'summary') {
    prompt = `Sen uzman bir kariyer danışmanısın. ${lang} dilinde, ATS uyumlu profesyonel CV özeti yaz.
Ünvan: ${clean(context.title) || 'belirtilmedi'}
Deneyim: ${clean(context.experience, 700) || 'belirtilmedi'}
Beceriler: ${clean(context.skills) || 'belirtilmedi'}
Kurallar: 3-4 cümle; eylem fiilleriyle başla; kişinin verdiği bilgi dışında rakam, şirket veya unvan UYDURMA; klişe sıfatlardan kaçın; ilk tekil şahıs zamiri kullanma. Sadece özet metnini yaz.`;
  } else if (type === 'achievement') {
    prompt = `"${clean(context.position, 100)}" pozisyonu${context.company ? ` (${clean(context.company, 100)})` : ''} için CV'ye yazılabilecek 4 başarı maddesi öner. ${lang}. Her madde tek satır, eylem fiiliyle başlasın. Kesin rakam uydurma; rakam gereken yere [X] yaz ki kullanıcı kendi gerçek değerini yazsın. Sadece maddeleri yaz, satır başına bir madde, numara veya tire koyma.`;
  } else if (type === 'cover') {
    prompt = `${lang} dilinde 3 kısa paragraflık profesyonel bir ön yazı yaz.
Ad: ${clean(context.name, 80) || 'Aday'}
Pozisyon: ${clean(context.position, 100)}
Şirket: ${clean(context.company, 100) || 'ilgili şirket'}
Özet: ${clean(context.summary, 500)}
"Sayın Yetkili," ile başla, "Saygılarımla," ile bitir (ad yazma). Bilgi uydurma. Sadece mektubu yaz.`;
  } else return json({ error: 'Geçersiz istek' }, 400);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: type === 'cover' ? 700 : 400, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) return json({ error: 'AI servisi şu an yanıt vermiyor' }, 502);
    const data = await r.json();
    const text = (data.content?.[0]?.text || '').trim();
    await store.set(key, String(used + 1));
    if (!access) await store.set(gkey, String(gUsed + 1));
    return json({ text, remaining: limit - used - 1 });
  } catch {
    return json({ error: 'AI servisine ulaşılamadı' }, 502);
  }
};
