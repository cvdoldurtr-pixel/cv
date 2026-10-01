// Anonim kullanım sayacı: çerez yok, IP/kimlik saklanmaz; yalnızca günlük olay sayıları.
import { json, bump, EVENTS } from './_lib.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  const { e } = await req.json().catch(() => ({}));
  if (!EVENTS.includes(e)) return new Response(null, { status: 204 });
  await bump(e);
  return new Response(null, { status: 204 });
};
