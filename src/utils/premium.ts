/**
 * Premium durumu. Tarayıcıda yalnızca sunucunun imzaladığı erişim anahtarı saklanır;
 * anahtar her açılışta sunucuda doğrulanır (premium-status). Anahtar uydurulamaz.
 */
import { useSyncExternalStore } from 'react';
import { track } from './track';
import type { CVData } from '../types/cv';
import { cvFileBase } from './cvView';
import { findPlaceholders } from './quality';

const TOKEN_KEY = 'cvdoldur_access';

export type PlanId = 'week' | 'pro' | 'proplus';
export type GateFeature = 'pdf' | 'ai' | 'tailor' | 'restore' | 'pdfmenu' | 'profiles';
interface State { plan: 'free' | PlanId; exp: number; token: string; oid: string; gate: GateFeature | null; toast: string }

// Fiyat gösterimi. Gerçek tutar sunucuda (netlify/functions/_lib.mjs) belirlenir; ikisini aynı tutun.
export const PLAN_PRICES = {
  week: { label: 'Başlangıç · 7 gün', price: '₺59', desc: 'İlana özel CV ve filigransız PDF, 1 hafta' },
  pro: { label: 'Pro · 30 gün', price: '₺149', desc: 'Aktif iş arayanlar için, 30 gün' },
  proplus: { label: 'Pro+ · 30 gün', price: '₺499', desc: 'Başkaları için CV hazırlayanlar (danışman, kırtasiye, kurs)' },
} as const;

/** Kayıtlı CV profili sınırı (plana göre). Tarayıcı depolamasını da korur. */
export const PROFILE_LIMIT: Record<'free' | PlanId, number> = { free: 1, week: 3, pro: 10, proplus: 40 };

let state: State = { plan: 'free', exp: 0, token: '', oid: '', gate: null, toast: '' };
const listeners = new Set<() => void>();
const set = (p: Partial<State>) => { state = { ...state, ...p }; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const snap = () => state;

export const usePremiumState = () => useSyncExternalStore(subscribe, snap);
export const isPremiumNow = () => state.plan !== 'free' && state.exp > Date.now();
export const getToken = () => (isPremiumNow() ? state.token : '');
export const getOid = () => state.oid;
export const profileLimit = () => PROFILE_LIMIT[state.plan !== 'free' && state.exp > Date.now() ? state.plan : 'free'];
export const openGate = (f: GateFeature) => {
  if (f === 'pdf' || f === 'ai' || f === 'tailor') track('gate_' + f);
  set({ gate: f });
};
export const closeGate = () => set({ gate: null });
export const clearToast = () => set({ toast: '' });

export function activate(token: string, plan: PlanId, exp: number, toast?: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
  const oid = token.split('.')[0] || '';
  set({
    token, plan, exp, oid, gate: null,
    toast: toast ?? `Ödeme onaylandı, paketiniz ${new Date(exp).toLocaleDateString('tr-TR')} tarihine kadar aktif. Sipariş kodunuz: ${oid} (bir yere not edin; cihaz değiştirirseniz "Satın alımı geri yükle" ile kullanırsınız).`,
  });
}

/** Sipariş kodu + e-posta ile erişimi geri yükler. Başarılıysa null, değilse hata metni döner. */
export async function restoreAccess(oid: string, email: string): Promise<string | null> {
  try {
    const r = await fetch('/.netlify/functions/restore-access', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oid, email }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return d.error || 'Geri yükleme başarısız';
    activate(d.token, d.plan, d.exp, `Erişiminiz geri yüklendi (${new Date(d.exp).toLocaleDateString('tr-TR')} tarihine kadar).`);
    return null;
  } catch { return 'Sunucuya ulaşılamadı, internetinizi kontrol edin'; }
}

const isMobileLike = () =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024);

/** Telefonda PDF istenince uygulama önizleme sekmesine geçer (App.tsx dinler) */
export const PREVIEW_EVENT = 'cvdoldur:show-preview';

/** PDF dosya adı (uzantısız), ör. Ahmet-Yilmaz-Yazilim-Muhendisi-CV */
let pdfName = 'CV';
export const getPdfName = () => pdfName;

/**
 * Metinli (ATS uyumlu) PDF: tarayıcının yazdır penceresi → "PDF olarak kaydet".
 * Tarayıcılar kaydedilecek dosyaya sayfa başlığını (document.title) ad olarak verir;
 * bu yüzden yazdırma süresince başlık CV dosya adına çevrilir.
 */
export function printPdf() {
  track('pdf_print');
  closeGate();
  const prev = document.title;
  document.title = pdfName;
  const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  setTimeout(() => { window.print(); setTimeout(restore, 1500); }, 150);
}

/** PDF butonları bunu çağırır: premium ise yazdır, değilse ödeme penceresini aç. */
export function requestPdf(d?: CVData) {
  if (d) {
    pdfName = cvFileBase(d);
    const ph = findPlaceholders(d);
    if (ph.length && !window.confirm(`CV'nizde doldurulmamış [X] yer tutucusu var:\n\n• ${ph.join('\n• ')}\n\n[X] yerine kendi gerçek rakamınızı yazmanız önerilir. Yine de devam edilsin mi?`)) return;
  }
  try { window.dispatchEvent(new Event(PREVIEW_EVENT)); } catch { /* önemsiz */ }
  if (!isPremiumNow()) { openGate('pdf'); return; }
  if (isMobileLike()) openGate('pdfmenu');   // telefonda yazdır penceresi karışık: seçenek sun
  else printPdf();
}

async function verify(token: string) {
  try {
    const r = await fetch('/.netlify/functions/premium-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    });
    const d = await r.json();
    if (d.valid) { set({ token, plan: d.plan, exp: d.exp, oid: token.split('.')[0] || '' }); return true; }
  } catch { /* çevrimdışı: premium kabul edilmez */ }
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  return false;
}

/** Ödeme sonrası sunucuyu yokla (ödeme bildirimi birkaç saniye gecikebilir). */
export async function pollOrder(oid: string, maxSeconds = 600): Promise<boolean> {
  const end = Date.now() + maxSeconds * 1000;
  while (Date.now() < end) {
    try {
      const r = await fetch(`/.netlify/functions/premium-status?oid=${encodeURIComponent(oid)}`);
      const d = await r.json();
      if (d.status === 'paid' && d.token) { activate(d.token, d.plan, d.exp); return true; }
      if (d.status === 'failed' || d.status === 'amount_mismatch') return false;
    } catch { /* tekrar dene */ }
    await new Promise((res) => setTimeout(res, 3000));
  }
  return false;
}

/** Uygulama açılışında bir kez çağrılır. */
export function initPremium() {
  const params = new URLSearchParams(window.location.search);
  const oid = params.get('oid');
  if (params.get('odeme') === 'ok' && oid && window.self === window.top) {
    void pollOrder(oid, 120);
  } else if (params.get('restore') === '1') {
    openGate('restore');
  } else if (params.get('odeme') === 'fail') {
    set({ toast: 'Ödeme tamamlanmadı. Tekrar deneyebilirsiniz.' });
  }
  let saved = '';
  try { saved = localStorage.getItem(TOKEN_KEY) || ''; } catch { /* ignore */ }
  if (saved) void verify(saved);
}
