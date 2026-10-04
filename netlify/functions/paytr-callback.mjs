// PayTR bildirim URL'si (PayTR panelinde tanımlanır). Ödemeyi doğrular ve kaydeder.
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { PLANS, bump, sendMail, paidAmountOk } from './_lib.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const KEY = process.env.PAYTR_MERCHANT_KEY, SALT = process.env.PAYTR_MERCHANT_SALT;
  if (!KEY || !SALT) return new Response('not configured', { status: 503 });
  const p = new URLSearchParams(await req.text());
  const oid = p.get('merchant_oid') || '', status = p.get('status') || '', total = p.get('total_amount') || '', hash = p.get('hash') || '';

  const expected = crypto.createHmac('sha256', KEY).update(oid + SALT + status + total).digest('base64');
  if (hash !== expected) return new Response('bad hash', { status: 400 });

  const store = getStore('orders');
  const order = await store.get(oid, { type: 'json' });
  if (order && order.status !== 'paid') {
    const success = status === 'success';
    // Ek güvenlik: başarılı bildirimde tahsil edilen tutar sipariş tutarını karşılamalı
    const amountOk = !success || paidAmountOk(order, p);
    const ok = success && amountOk;
    const paidAt = Date.now();
    await store.setJSON(oid, {
      ...order,
      status: ok ? 'paid' : success ? 'amount_mismatch' : 'failed',
      total,
      paymentAmount: p.get('payment_amount') || '',
      testMode: p.get('test_mode') || '',
      paidAt,
    });
    if (success && !amountOk) await bump('paid_mismatch');
    if (ok) {
      await bump('paid');
      const plan = PLANS[order.plan];
      const until = new Date(paidAt + plan.days * 86400000).toLocaleDateString('tr-TR');
      const site = (process.env.SITE_URL || '').replace(/\/$/, '');
      await sendMail({
        to: order.email,
        subject: 'CVDoldur erişim kodunuz',
        html: `<p>Teşekkürler! <b>${plan.label}</b> erişiminiz aktif (son gün: ${until}).</p>
<p><b>Sipariş kodunuz:</b> <code>${oid}</code></p>
<p>Tarayıcı verilerini sildiyseniz veya başka cihazdan devam edecekseniz, sitede "Satın alımı geri yükle" bölümüne bu kodu ve ödemede kullandığınız e-postayı girin: <a href="${site}/?restore=1">${site}/?restore=1</a></p>
<p>Bu kodu kimseyle paylaşmayın.</p>`,
      });
    }
  }
  // PayTR sadece düz "OK" bekler; aksi halde bildirimi tekrar tekrar gönderir.
  return new Response('OK', { status: 200 });
};
