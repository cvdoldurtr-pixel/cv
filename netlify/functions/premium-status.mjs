// Ödeme sonrası tarayıcı burayı yoklar: ödendiyse imzalı erişim anahtarı verir.
// GET ?oid=...   veya   POST { token }  (mevcut anahtarı doğrular)
import { getStore } from '@netlify/blobs';
import { PLANS, json, signAccess, verifyAccess } from './_lib.mjs';

export default async (req) => {
  if (req.method === 'POST') {
    const { token } = await req.json().catch(() => ({}));
    let v = null;
    try { v = verifyAccess(token); } catch { return json({ valid: false, error: 'config' }, 503); }
    return json(v ? { valid: true, plan: v.plan, exp: v.exp } : { valid: false });
  }
  const oid = new URL(req.url).searchParams.get('oid') || '';
  if (!/^[A-Za-z0-9]{10,80}$/.test(oid)) return json({ status: 'unknown' }, 400);
  const order = await getStore('orders').get(oid, { type: 'json' });
  if (!order) return json({ status: 'unknown' });
  if (order.status !== 'paid') return json({ status: order.status });
  const exp = order.exp || (order.paidAt || Date.now()) + PLANS[order.plan].days * 86400000;
  try { return json({ status: 'paid', plan: order.plan, exp, token: signAccess(oid, order.plan, exp) }); }
  catch { return json({ status: 'error', error: 'Sunucu yapılandırması eksik' }, 503); }
};
