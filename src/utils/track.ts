/** Anonim kullanım sayacı: çerez ve kimlik yok, yalnızca olay adı gider (netlify/functions/track.mjs). */
export function track(e: string) {
  try {
    const body = JSON.stringify({ e });
    const url = '/.netlify/functions/track';
    const ok = navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    if (!ok) void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch { /* önemsiz */ }
}

export function trackOnce(e: string) {
  try {
    const k = 'cvd_t_' + e;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, '1');
  } catch { /* oturum depolaması yoksa yine say */ }
  track(e);
}
