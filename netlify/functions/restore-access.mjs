// Satın alımı geri yükle: sipariş kodu + ödemede kullanılan e-posta eşleşirse yeni erişim anahtarı verir.
import { getStore } from '@netlify/blobs';
import { PLANS, json, getIp, signAccess, bump } from './_lib.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const { oid = '', email = '' } = await req.json().catch(() => ({}));
  const id = String(oid).trim();
  const mail = String(email).trim().toLowerCase();
  if (!/^[A-Za-z0-9]{10,80}$/.test(id) || !/^\S+@\S+\.\S+$/.test(mail)) {
    return json({ error: 'Sipariş kodu ve e-posta gerekli' }, 400);
  }

  // Deneme sınırı: IP başına saatte 8 (tahmin saldırılarına karşı)
  const rate = getStore('restore-rate');
  const rkey = `${new Date().toISOString().slice(0, 13)}-${getIp(req)}`;
  const tries = Number((await rate.get(rkey)) || 0);
  if (tries >= 8) return json({ error: 'Çok fazla deneme. Bir saat sonra tekrar deneyin.' }, 429);
  await rate.set(rkey, String(tries + 1));

  const order = await getStore('orders').get(id, { type: 'json' });
  if (!order || order.status !== 'paid' || String(order.email || '').toLowerCase() !== mail) {
    return json({ error: 'Bilgiler eşleşmedi veya ödeme bulunamadı' }, 404);
  }
  const exp = order.exp || (order.paidAt || Date.now()) + PLANS[order.plan].days * 86400000;
  if (exp < Date.now()) return json({ error: 'Bu erişimin süresi dolmuş' }, 410);
  try {
    await bump('restore_ok');
    return json({ token: signAccess(id, order.plan, exp), plan: order.plan, exp });
  } catch {
    return json({ error: 'Sunucu yapılandırması eksik' }, 503);
  }
};
