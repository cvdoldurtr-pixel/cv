import { useEffect, useRef, useState } from 'react';
import { X, Upload, FileText, ClipboardPaste, RefreshCw, CheckCircle2, AlertCircle, Linkedin } from 'lucide-react';
import { CVData } from '../types/cv';
import { extractText, parseCv, mergeImported, summarize, ImportError, MAX_IMPORT_CHARS, ImportResult } from '../utils/importCv';
import { track } from '../utils/track';

interface Props {
  open: boolean;
  current: CVData;
  hasExisting: boolean;
  onClose: () => void;
  onApply: (d: CVData) => void;
}

type Phase = 'pick' | 'busy' | 'review';

export default function ImportModal({ open, current, hasExisting, onClose, onApply }: Props) {
  const [tab, setTab] = useState<'file' | 'paste'>('file');
  const [phase, setPhase] = useState<Phase>('pick');
  const [busyMsg, setBusyMsg] = useState('');
  const [err, setErr] = useState('');
  const [paste, setPaste] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    track('import_open');
    setPhase('pick'); setErr(''); setResult(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function runText(text: string) {
    setPhase('busy'); setErr('');
    setBusyMsg('CV\'niz yapay zeka ile bölümlere ayrılıyor… (10-20 sn)');
    const r = await parseCv(text);
    setResult(r);
    setPhase('review');
  }

  async function handleFile(file: File) {
    setPhase('busy'); setErr('');
    setBusyMsg('Dosya okunuyor…');
    try {
      const text = await extractText(file);
      await runText(text);
    } catch (e) {
      setErr(e instanceof ImportError ? e.message : 'Dosya okunamadı. Farklı bir dosya deneyin veya metni yapıştırın.');
      setPhase('pick');
    }
  }

  function apply() {
    if (!result) return;
    if (hasExisting && !confirm('Mevcut CV bilgileriniz içe aktarılanlarla değiştirilecek (şablon, renk ve fotoğraf korunur). Devam edilsin mi?\n\nİpucu: Önce üst menüden "Kaydet" ile mevcut CV\'nizi profil olarak saklayabilirsiniz.')) return;
    onApply(mergeImported(current, result.data));
  }

  const summary = result ? summarize(result.data) : [];

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-3 no-print" onMouseDown={(e) => { if (e.target === e.currentTarget && phase !== 'busy') onClose(); }}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="imp-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto outline-none"
      >
        <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-5 text-white relative">
          <button onClick={onClose} disabled={phase === 'busy'} className="absolute top-4 right-4 opacity-70 hover:opacity-100 disabled:opacity-30" aria-label="Kapat">
            <X size={18} />
          </button>
          <h2 id="imp-title" className="text-lg font-bold pr-6">Mevcut CV'nizi yükleyin</h2>
          <p className="text-sm opacity-80 mt-1">PDF, Word veya LinkedIn profiliniz: bilgileriniz forma otomatik dolsun, sonra istediğiniz şablonla yenileyin.</p>
        </div>

        {phase === 'busy' && (
          <div className="p-8 text-center" role="status" aria-live="polite">
            <RefreshCw size={28} className="mx-auto text-teal-600 animate-spin mb-3" />
            <p className="text-sm text-slate-700">{busyMsg}</p>
          </div>
        )}

        {phase === 'pick' && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 mb-4" role="tablist">
              <button role="tab" aria-selected={tab === 'file'} onClick={() => setTab('file')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 ${tab === 'file' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-600'}`}>
                <Upload size={15} /> Dosya yükle
              </button>
              <button role="tab" aria-selected={tab === 'paste'} onClick={() => setTab('paste')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 ${tab === 'paste' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-600'}`}>
                <ClipboardPaste size={15} /> Metin yapıştır
              </button>
            </div>

            {tab === 'file' ? (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition ${drag ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}`}
                >
                  <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Dosya seçin veya buraya sürükleyin</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, Word (.docx) veya .txt · en fazla 10 MB</p>
                </button>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleFile(f); }} />
                <div className="mt-4 flex gap-2.5 text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
                  <Linkedin size={16} className="text-[#0a66c2] shrink-0 mt-0.5" />
                  <p><strong>LinkedIn'den aktarmak için:</strong> LinkedIn'de profilinizi açın → “Diğer / More” → “PDF olarak kaydet / Save to PDF”. İnen PDF'i buraya yükleyin.</p>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="imp-paste" className="text-xs font-semibold text-slate-600 block mb-1">CV metni veya LinkedIn profilinizden kopyaladığınız metin</label>
                <textarea id="imp-paste" value={paste} onChange={(e) => setPaste(e.target.value.slice(0, MAX_IMPORT_CHARS))} rows={9}
                  placeholder="Ahmet Yılmaz&#10;Satış Temsilcisi · ahmet@email.com · 0532 …&#10;&#10;DENEYİM&#10;…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-400">{paste.length} / {MAX_IMPORT_CHARS}</span>
                </div>
                <button onClick={() => void runText(paste)} disabled={paste.trim().length < 60}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300">
                  Bölümlere ayır
                </button>
              </>
            )}

            {err && (
              <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-2.5 flex gap-2" role="alert">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {err}
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Dosyanız sunucuya yüklenmez; metin tarayıcınızda çıkarılır. Bölümlere ayırmak için yalnızca metin, sunucumuz üzerinden yapay zeka sağlayıcısına (Anthropic) iletilir ve saklanmaz.
              Ücretsiz kullanımda günde 2 içe aktarma hakkı vardır. Ayrıntı: <a href="/gizlilik-politikasi" target="_blank" rel="noopener" className="underline">Gizlilik Politikası</a>.
            </p>
          </div>
        )}

        {phase === 'review' && result && (
          <div className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3">{result.usedAI ? 'CV\'nizden bulunanlar' : 'Kısmi aktarım'}</h3>
            {result.note && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mb-3">{result.note}</p>}
            <ul className="space-y-1.5 mb-4">
              {summary.map((s) => (
                <li key={s.label} className={`flex items-start gap-2 text-sm ${s.ok ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.ok ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />}
                  <span className="break-all">{s.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 mb-4">
              Aktardıktan sonra her adımı kontrol edin: tarihleri, dil seviyelerini ve başarı maddelerini gözden geçirin. Fotoğraf eklemek için Kişisel adımını kullanın.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setPhase('pick'); setResult(null); }} className="px-4 py-3 rounded-xl text-sm border border-slate-200 text-slate-700 hover:bg-slate-50">Geri</button>
              <button onClick={apply} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-teal-700 hover:bg-teal-800">Forma aktar ve düzenle</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
