// Yönetici paneli: /.netlify/functions/stats?key=ADMIN_KEY  (son 14 gün, olay sayıları + basit dönüşüm)
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { EVENTS } from './_lib.mjs';

const eq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export default async (req) => {
  const ADMIN = process.env.ADMIN_KEY;
  const key = new URL(req.url).searchParams.get('key') || '';
  if (!ADMIN || ADMIN.length < 12 || !eq(key, ADMIN)) return new Response('Yetkisiz', { status: 401 });

  const store = getStore('stats');
  const days = [];
  for (let i = 0; i < 14; i++) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const rows = await Promise.all(days.map(async (d) => ({ d, c: (await store.get(d, { type: 'json' })) || {} })));
  const evs = [...EVENTS];
  const sum = (e) => rows.reduce((s, r) => s + (r.c[e] || 0), 0);
  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + '%' : '-');

  const th = evs.map((e) => `<th>${e}</th>`).join('');
  const body = rows.map((r) => `<tr><td>${r.d}</td>${evs.map((e) => `<td>${r.c[e] || 0}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>CVDoldur istatistik</title>
<style>body{font:14px system-ui;margin:24px}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:4px 8px;text-align:right}th{background:#f4f4f4}td:first-child{text-align:left}</style>
<h2>Son 14 gün</h2>
<p>Ziyaret → başlama: <b>${pct(sum('start'), sum('app_open'))}</b> · Başlama → ödeme ekranı: <b>${pct(sum('checkout'), sum('start'))}</b> · Ödeme ekranı → ödeme: <b>${pct(sum('paid'), sum('checkout'))}</b></p>
<table><tr><th>gün</th>${th}</tr>${body}</table>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
};
