// PayTR iFrame API — ödeme başlatır. POST { planId, email, name }
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { PLANS, json, getIp } from './_lib.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const { planId = 'pro', email = '', name = 'CV Kullanicisi' } = await req.json().catch(() => ({}));
  const plan = PLANS[planId];
  if (!plan) return json({ error: 'Geçersiz plan' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Geçerli bir e-posta girin' }, 400);

  const MID = process.env.PAYTR_MERCHANT_ID, KEY = process.env.PAYTR_MERCHANT_KEY, SALT = process.env.PAYTR_MERCHANT_SALT;
  const SITE = (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
  if (!process.env.TOKEN_SECRET) return json({ error: 'Ödeme sistemi yapılandırılmadı (TOKEN_SECRET eksik).' }, 503);
  if (!MID || !KEY || !SALT) return json({ error: 'Ödeme sistemi şu an hazırlanıyor. Lütfen kısa süre sonra tekrar deneyin.' }, 503);

  const userIp = getIp(req);
  // PayTR: merchant_oid yalnızca harf ve rakam içermeli
  const oid = 'CV' + Date.now() + crypto.randomBytes(4).toString('hex') + planId.toUpperCase();
  const amount = String(plan.amountTL * 100); // kuruş
  const basket = Buffer.from(JSON.stringify([[plan.label, plan.amountTL.toFixed(2), 1]])).toString('base64');
  const noInstallment = '0', maxInstallment = '12', currency = 'TL';
  const testMode = process.env.PAYTR_TEST_MODE === '0' ? '0' : '1';

  const hashStr = MID + userIp + oid + email + amount + basket + noInstallment + maxInstallment + currency + testMode;
  const paytrToken = crypto.createHmac('sha256', KEY).update(hashStr + SALT).digest('base64');

  const body = new URLSearchParams({
    merchant_id: MID, user_ip: userIp, merchant_oid: oid, email, payment_amount: amount,
    paytr_token: paytrToken, user_basket: basket, debug_on: testMode, no_installment: noInstallment,
    max_installment: maxInstallment, user_name: String(name).slice(0, 60), user_address: 'Türkiye',
    user_phone: '05000000000', merchant_ok_url: `${SITE}/?odeme=ok&oid=${oid}`,
    merchant_fail_url: `${SITE}/?odeme=fail`, timeout_limit: '30', currency, test_mode: testMode, lang: 'tr',
  });

  try {
    const r = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    });
    const data = await r.json();
    if (data.status !== 'success') return json({ error: 'PayTR: ' + (data.reason || 'token alınamadı') }, 400);
    await getStore('orders').setJSON(oid, { plan: planId, email, amount: Number(amount), status: 'pending', createdAt: Date.now() });
    return json({ iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`, oid });
  } catch (e) {
    return json({ error: 'PayTR servisine ulaşılamadı' }, 502);
  }
};
