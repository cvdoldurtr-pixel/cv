// Ortak yardımcılar: fiyatlar, imzalı token, IP
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

// FİYATLAR (TL). Değiştirmek için burayı ve src/utils/premium.ts içindeki PLAN_PRICES'ı güncelleyin.
// aiPerDay = günlük AI hakkı (bir ilan uyarlaması 3 hak). Üst sınırlar maliyeti korur ("adil kullanım").
export const PLANS = {
  week:  { label: 'CVDoldur Başlangıç 7 Gün',          amountTL: 59,  days: 7,  aiPerDay: 24 },
  pro:   { label: 'CVDoldur Pro 30 Gün',               amountTL: 149, days: 30, aiPerDay: 60 },
  proplus: { label: 'CVDoldur Pro+ 30 Gün',    amountTL: 499, days: 30, aiPerDay: 200 },
};

/**
 * PayTR bildirimindeki tutar, siparişin tutarını karşılıyor mu? (kuruş)
 * payment_amount: sipariş tutarı; total_amount: müşteriden çekilen toplam (taksit farkı dahil, >= sipariş tutarı).
 * Sipariş oluşturulurken kaydedilen tutar esas alınır; yoksa plan fiyatı.
 */
export function paidAmountOk(order, params) {
  const expected = Number(order?.amount) || (PLANS[order?.plan] ? PLANS[order.plan].amountTL * 100 : NaN);
  if (!Number.isFinite(expected) || expected <= 0) return false;
  const pay = Number(params.get('payment_amount'));
  const total = Number(params.get('total_amount'));
  const paid = Number.isFinite(pay) && pay > 0 ? pay : total;
  return Number.isFinite(paid) && paid >= expected;
}

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export const getIp = (req) =>
  (req.headers.get('x-nf-client-connection-ip') ||
   (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
   '127.0.0.1');

// Erişim anahtarı imzası için ayrı, zorunlu bir gizli anahtar (PayTR anahtarından bağımsız). Yoksa hata verir (fail-closed).
const secret = () => {
  const v = process.env.TOKEN_SECRET;
  if (!v || v.length < 16) throw new Error('TOKEN_SECRET tanımlı değil veya çok kısa (en az 16 karakter)');
  return v;
};

// Ödeme sonrası sunucunun verdiği imzalı erişim anahtarı: oid.plan.exp.imza
export function signAccess(oid, plan, exp) {
  const body = `${oid}.${plan}.${exp}`;
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('hex').slice(0, 32);
  return `${body}.${sig}`;
}

export function verifyAccess(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [oid, plan, exp, sig] = parts;
  const good = crypto.createHmac('sha256', secret()).update(`${oid}.${plan}.${exp}`).digest('hex').slice(0, 32);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  if (!PLANS[plan] || Number(exp) < Date.now()) return null;
  return { oid, plan, exp: Number(exp) };
}

// ---- Anonim sayaç (track.mjs / stats.mjs) ----
export const EVENTS = [
  'app_open', 'start', 'gate_pdf', 'gate_ai', 'gate_tailor', 'checkout', 'paid',
  'pdf_print', 'pdf_image', 'tailor_core', 'tailor_bullets', 'tailor_extra', 'ai_use', 'restore_ok',
  'import_open', 'import_ok', 'import_ai', 'apps_open', 'paid_mismatch',
];
export async function bump(event) {
  try {
    if (!EVENTS.includes(event)) return;
    const store = getStore('stats');
    const day = new Date().toISOString().slice(0, 10);
    const cur = (await store.get(day, { type: 'json' })) || {};
    cur[event] = (cur[event] || 0) + 1;
    await store.setJSON(day, cur);
  } catch { /* sayaç hatası asla işlemi bozmasın */ }
}

// ---- E-posta (isteğe bağlı): RESEND_API_KEY ve MAIL_FROM tanımlıysa gönderir ----
export async function sendMail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return r.ok;
  } catch { return false; }
}
