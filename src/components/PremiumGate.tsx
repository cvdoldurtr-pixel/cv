import { useState } from 'react';
import { X, Check, CreditCard, Shield, RefreshCw, Smartphone, FileText, KeyRound } from 'lucide-react';
import { PLAN_PRICES, closeGate, pollOrder, usePremiumState, clearToast, openGate, restoreAccess, printPdf, PROFILE_LIMIT, type PlanId } from '../utils/premium';
import { downloadImagePdf } from '../utils/pdfExport';
import { track } from '../utils/track';

const MSG = {
  pdf: { title: 'PDF indirmek için bir paket seçin', desc: 'Filigransız, yüksek kaliteli PDF. Abonelik yok, otomatik yenileme yok.' },
  ai: { title: 'Ücretsiz AI hakkınız doldu', desc: 'Bugünlük ücretsiz hakkınız bitti. Bir paketle hemen devam edin.' },
  tailor: { title: 'İlana özel CV uyarlama', desc: 'İlanı yapıştırın; özet, başarı maddeleri, ön yazı ve mülakat soruları o ilana göre hazırlansın.' },
  profiles: { title: 'Her ilana ayrı CV kaydedin', desc: 'Ücretsizde 1 CV kaydedebilirsiniz. Paketlerle daha fazlasını saklayın.' },
  restore: { title: 'Satın alımı geri yükle', desc: 'Sipariş kodunuz ve ödemede kullandığınız e-posta ile erişiminizi geri getirin.' },
  pdfmenu: { title: 'PDF nasıl indirilsin?', desc: 'Telefon için iki seçenek' },
} as const;

const FEATURES: Record<PlanId, string[]> = {
  week: [
    'İlana özel CV uyarlama (günde 8 ilana kadar)',
    'Filigransız PDF indirme, tüm şablonlar',
    `${PROFILE_LIMIT.week} CV profili kaydetme`,
    '7 gün, tek seferlik; otomatik yenileme yok',
  ],
  pro: [
    'İlana özel CV uyarlama (günde 20 ilana kadar)',
    'Filigransız PDF, tüm şablonlar, ön yazı, mülakat soruları',
    `${PROFILE_LIMIT.pro} CV profili: her ilana ayrı CV`,
    '30 gün, tek seferlik; otomatik yenileme yok',
  ],
  proplus: [
    'Başkaları için CV hazırlama ve teslim etme hakkı',
    'İlana özel CV uyarlama (günde 66 ilana kadar)',
    `${PROFILE_LIMIT.proplus} müşteri/CV profili`,
    'Kırtasiye, kariyer danışmanı, eğitim kursu için',
  ],
};

export default function PremiumGate() {
  const { gate, toast } = usePremiumState();
  const [plan, setPlan] = useState<PlanId>('pro');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [frame, setFrame] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [rOid, setROid] = useState('');
  const [rMail, setRMail] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  if (toast && !gate) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-[92vw] bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-start gap-3 no-print">
        <Check size={16} className="text-teal-400 mt-0.5 shrink-0" /> <span className="break-words select-text">{toast}</span>
        <button onClick={clearToast} aria-label="Kapat"><X size={14} /></button>
      </div>
    );
  }
  if (!gate) return null;
  const msg = MSG[gate];

  async function pay() {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Geçerli bir e-posta girin'); return; }
    if (!agree) { setErr('Devam etmek için sözleşme onayını işaretleyin'); return; }
    setBusy(true); setErr('');
    try {
      track('checkout');
      const r = await fetch('/.netlify/functions/paytr-token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan, email, name: email.split('@')[0] }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Ödeme başlatılamadı');
      setFrame(d.iframeUrl); setWaiting(true);
      pollOrder(d.oid).then((ok) => { if (!ok) { setWaiting(false); } });
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }

  async function doRestore() {
    setErr('');
    if (!rOid.trim() || !/^\S+@\S+\.\S+$/.test(rMail)) { setErr('Sipariş kodu ve geçerli bir e-posta girin'); return; }
    setBusy(true);
    const e = await restoreAccess(rOid.trim(), rMail.trim());
    if (e) setErr(e);
    setBusy(false);
  }

  async function doImagePdf() {
    setPdfBusy(true); setErr('');
    try {
      track('pdf_image');
      closeGate();
      await new Promise((res) => setTimeout(res, 150));
      await downloadImagePdf('CVDoldur-CV.pdf');
    } catch (e) { setErr((e as Error).message || 'PDF oluşturulamadı'); openGate('pdfmenu'); }
    setPdfBusy(false);
  }

  const wide = !!frame;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 no-print">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-md' : 'max-w-md'} max-h-[95vh] overflow-y-auto`}>
        <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-5 text-white relative">
          <button onClick={closeGate} className="absolute top-4 right-4 opacity-70 hover:opacity-100" aria-label="Kapat"><X size={18} /></button>
          <h2 className="text-lg font-bold pr-6">{msg.title}</h2>
          <p className="text-sm opacity-80 mt-1">{msg.desc}</p>
        </div>

        {gate === 'restore' ? (
          <div className="p-5">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Sipariş kodu</label>
            <input value={rOid} onChange={(e) => setROid(e.target.value)} placeholder="CV17…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 font-mono focus:outline-none focus:border-teal-500" />
            <label className="text-xs font-semibold text-slate-600 block mb-1">Ödemede kullandığınız e-posta</label>
            <input type="email" value={rMail} onChange={(e) => setRMail(e.target.value)} placeholder="ornek@email.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-500" />
            {err && <p className="text-red-600 text-xs mb-3">{err}</p>}
            <button onClick={doRestore} disabled={busy}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400">
              {busy ? <RefreshCw size={15} className="animate-spin" /> : <KeyRound size={15} />} Erişimi geri yükle
            </button>
            <p className="text-[11px] text-slate-500 mt-3">Sipariş kodu, ödeme sonrası ekranda gösterilen koddur (CV… ile başlar). Süre, satın alma tarihinden itibaren 30 gündür; geri yükleme süreyi uzatmaz.</p>
            <button onClick={closeGate} className="w-full text-xs text-slate-400 hover:text-slate-600 mt-2 py-1">Kapat</button>
          </div>
        ) : gate === 'pdfmenu' ? (
          <div className="p-5 space-y-3">
            <button onClick={doImagePdf} disabled={pdfBusy}
              className="w-full text-left border-2 border-teal-500 bg-teal-50 rounded-xl p-4 hover:bg-teal-100 disabled:opacity-60">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm"><Smartphone size={16} className="text-teal-700" /> Hızlı PDF (tek dokunuş)</div>
              <p className="text-xs text-slate-600 mt-1">Doğrudan telefona iner. Sayfa görüntü olarak kaydedilir; metin seçilemez. E-posta ile göndermek için uygundur.</p>
            </button>
            <button onClick={printPdf}
              className="w-full text-left border-2 border-slate-200 rounded-xl p-4 hover:bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm"><FileText size={16} className="text-slate-700" /> Metinli PDF (ATS için önerilir)</div>
              <p className="text-xs text-slate-600 mt-1">Yazdır penceresi açılır → “PDF olarak kaydet” seçin. Metin seçilebilir olduğundan iş başvuru sistemleri okuyabilir.</p>
            </button>
            {err && <p className="text-red-600 text-xs">{err}</p>}
            <button onClick={closeGate} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">Vazgeç</button>
          </div>
        ) : frame ? (
          <div>
            <iframe src={frame} title="PayTR güvenli ödeme" style={{ width: '100%', height: 560, border: 'none' }} />
            <p className="text-center text-xs text-slate-500 p-3 flex items-center justify-center gap-1">
              <Shield size={12} /> PayTR güvencesiyle · Ödeme bitince bu pencere otomatik kapanır
              {waiting && <RefreshCw size={12} className="animate-spin ml-1" />}
            </p>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['week', 'pro', 'proplus'] as const).map((k) => (
                <button key={k} onClick={() => setPlan(k)}
                  className={`relative border-2 rounded-xl p-2.5 text-left transition ${plan === k ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}>
                  {k === 'pro' && <span className="absolute -top-2 left-2 bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">POPÜLER</span>}
                  <div className="font-bold text-slate-900 text-base">{PLAN_PRICES[k].price}</div>
                  <div className="text-[11px] font-semibold text-teal-700 leading-tight">{PLAN_PRICES[k].label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight">{PLAN_PRICES[k].desc}</div>
                </button>
              ))}
            </div>
            <ul className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
              {FEATURES[plan].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-700"><Check size={12} className="text-teal-600 shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <label className="text-xs font-semibold text-slate-600 block mb-1">E-posta (makbuz ve erişim kodu için)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-500" />
            <label className="flex items-start gap-2 text-[11px] text-slate-600 mb-3 leading-snug cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
              <span>
                <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener" className="underline">Mesafeli Satış Sözleşmesi</a> ve{' '}
                <a href="/iptal-ve-iade" target="_blank" rel="noopener" className="underline">İptal ve İade Koşulları</a>'nı okudum. Dijital hizmetin ödeme sonrası hemen ifa edilmesini onaylıyorum; bu nedenle cayma hakkımın sona ereceğini biliyorum.
              </span>
            </label>
            {err && <p className="text-red-600 text-xs mb-3">{err}</p>}
            <button onClick={pay} disabled={busy || !agree}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400">
              {busy ? <><RefreshCw size={15} className="animate-spin" /> Hazırlanıyor…</> : <><CreditCard size={15} /> {PLAN_PRICES[plan].price} ile güvenle öde</>}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-3">Süre ödeme onaylandığı anda başlar; kullanılmayan süre uzatılmaz. Ödeme PayTR güvenli ödeme ekranında alınır. Kart bilgisi bizde saklanmaz. Otomatik yenileme yok.</p>
            <div className="flex items-center justify-between mt-2">
              <button onClick={closeGate} className="text-xs text-slate-400 hover:text-slate-600 py-1">Şimdi değil</button>
              <button onClick={() => { setErr(''); openGate('restore'); }} className="text-xs text-teal-700 hover:underline py-1">Daha önce satın aldım</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
