import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Trash2, ExternalLink, Briefcase, BellRing } from 'lucide-react';
import { track } from '../utils/track';

export type AppStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
export interface JobApplication {
  id: string;
  company: string;
  position: string;
  link: string;
  date: string; // YYYY-MM-DD
  status: AppStatus;
  note: string;
  cvName: string;
  updatedAt: number;
}

export const APPS_KEY = 'cvdoldur_apps';

const STATUS: { id: AppStatus; label: string; cls: string }[] = [
  { id: 'saved', label: 'Kaydedildi', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'applied', label: 'Başvuruldu', cls: 'bg-blue-50 text-blue-800 border-blue-100' },
  { id: 'interview', label: 'Mülakat', cls: 'bg-amber-50 text-amber-800 border-amber-100' },
  { id: 'offer', label: 'Teklif', cls: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
  { id: 'rejected', label: 'Olumsuz', cls: 'bg-rose-50 text-rose-700 border-rose-100' },
];
const statusOf = (id: AppStatus) => STATUS.find((s) => s.id === id) || STATUS[0];

export function loadApps(): JobApplication[] {
  try {
    const v = JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (d: string) => Math.floor((Date.now() - new Date(d + 'T00:00:00').getTime()) / 86400000);
const safeUrl = (u: string) => {
  const t = u.trim();
  if (!t) return '';
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try { return new URL(withProto).protocol.startsWith('http') ? withProto : ''; } catch { return ''; }
};

interface Props {
  open: boolean;
  onClose: () => void;
  defaults: { company: string; position: string; cvName: string };
}

export default function Applications({ open, onClose, defaults }: Props) {
  const [apps, setApps] = useState<JobApplication[]>(loadApps);
  const [filter, setFilter] = useState<AppStatus | 'all'>('all');
  const [form, setForm] = useState({ company: '', position: '', link: '', status: 'applied' as AppStatus, date: today(), note: '' });
  const [adding, setAdding] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(APPS_KEY, JSON.stringify(apps)); setSaveErr(false); } catch { setSaveErr(true); }
  }, [apps]);

  useEffect(() => {
    if (!open) return;
    track('apps_open');
    setApps(loadApps());
    setForm((f) => ({ ...f, company: defaults.company, position: defaults.position }));
    setAdding(loadApps().length === 0);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, defaults.company, defaults.position]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    STATUS.forEach((s) => (c[s.id] = apps.filter((a) => a.status === s.id).length));
    return c;
  }, [apps]);

  if (!open) return null;

  const list = apps
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const add = () => {
    if (!form.company.trim() && !form.position.trim()) return;
    const item: JobApplication = {
      id: crypto.randomUUID(),
      company: form.company.trim().slice(0, 120),
      position: form.position.trim().slice(0, 120),
      link: form.link.trim().slice(0, 400),
      date: form.date || today(),
      status: form.status,
      note: form.note.trim().slice(0, 600),
      cvName: defaults.cvName,
      updatedAt: Date.now(),
    };
    setApps((p) => [item, ...p]);
    setForm({ company: '', position: '', link: '', status: 'applied', date: today(), note: '' });
    setAdding(false);
  };

  const patch = (id: string, p: Partial<JobApplication>) =>
    setApps((list) => list.map((a) => (a.id === id ? { ...a, ...p, updatedAt: Date.now() } : a)));

  const IN = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-3 no-print" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="apps-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col outline-none">
        <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-5 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 opacity-70 hover:opacity-100" aria-label="Kapat"><X size={18} /></button>
          <h2 id="apps-title" className="text-lg font-bold pr-6 flex items-center gap-2"><Briefcase size={18} /> Başvurularım</h2>
          <p className="text-sm opacity-80 mt-1">Hangi ilana hangi CV ile başvurduğunuzu ve sürecin nerede olduğunu takip edin. Kayıtlar yalnızca bu tarayıcıda tutulur.</p>
        </div>

        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-1.5">
          {[{ id: 'all' as const, label: 'Tümü' }, ...STATUS].map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} aria-pressed={filter === s.id}
              className={`text-xs px-2.5 py-1.5 rounded-lg border ${filter === s.id ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'}`}>
              {s.label} <span className="opacity-70">{counts[s.id] || 0}</span>
            </button>
          ))}
          {!adding && (
            <button onClick={() => setAdding(true)} className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center gap-1">
              <Plus size={13} /> Başvuru ekle
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {saveErr && <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2">Tarayıcı depolaması dolu veya kapalı; kayıtlar kalıcı olmayabilir.</p>}

          {adding && (
            <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ap-co" className="text-[11px] font-semibold text-slate-600">Şirket</label>
                  <input id="ap-co" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={IN} placeholder="Şirket adı" />
                </div>
                <div>
                  <label htmlFor="ap-pos" className="text-[11px] font-semibold text-slate-600">Pozisyon</label>
                  <input id="ap-pos" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={IN} placeholder="Pozisyon" />
                </div>
                <div>
                  <label htmlFor="ap-link" className="text-[11px] font-semibold text-slate-600">İlan bağlantısı (opsiyonel)</label>
                  <input id="ap-link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={IN} placeholder="kariyer.net/…" inputMode="url" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="ap-st" className="text-[11px] font-semibold text-slate-600">Durum</label>
                    <select id="ap-st" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppStatus })} className={IN + ' bg-white'}>
                      {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ap-date" className="text-[11px] font-semibold text-slate-600">Tarih</label>
                    <input id="ap-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={IN} />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="ap-note" className="text-[11px] font-semibold text-slate-600">Not (opsiyonel)</label>
                <input id="ap-note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={IN} placeholder="Ör. İK: Ayşe Hanım, maaş beklentisi soruldu" />
              </div>
              <div className="flex gap-2 justify-end">
                {apps.length > 0 && <button onClick={() => setAdding(false)} className="text-sm px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">Vazgeç</button>}
                <button onClick={add} disabled={!form.company.trim() && !form.position.trim()} className="text-sm px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:bg-slate-300">Kaydet</button>
              </div>
              {defaults.cvName && <p className="text-[11px] text-slate-500">Bu başvuruya “{defaults.cvName}” CV'si bağlanacak.</p>}
            </div>
          )}

          {list.length === 0 && !adding && (
            <p className="text-sm text-slate-500 text-center py-6">Bu filtrede başvuru yok.</p>
          )}

          {list.map((a) => {
            const st = statusOf(a.status);
            const follow = a.status === 'applied' && daysSince(a.date) >= 7;
            const url = safeUrl(a.link);
            return (
              <div key={a.id} className="border border-slate-200 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{a.position || 'Pozisyon'}{a.company && <span className="font-normal text-slate-600"> · {a.company}</span>}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(a.date + 'T00:00:00').toLocaleDateString('tr-TR')}{a.cvName && ` · CV: ${a.cvName}`}
                    </p>
                    {a.note && <p className="text-xs text-slate-600 mt-1 break-words">{a.note}</p>}
                    {follow && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 rounded-md px-2 py-1 mt-1.5 inline-flex items-center gap-1">
                        <BellRing size={11} /> {daysSince(a.date)} gün oldu: kısa bir takip e-postası gönderebilirsiniz.{' '}
                        <a href="/is-basvuru-e-postasi-ornegi" target="_blank" rel="noopener" className="underline">Örnek</a>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="İlanı aç" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><ExternalLink size={15} /></a>
                    )}
                    <button onClick={() => confirm('Bu başvuru silinsin mi?') && setApps((l) => l.filter((x) => x.id !== a.id))} aria-label="Başvuruyu sil" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label="Durumu değiştir">
                  {STATUS.map((s) => (
                    <button key={s.id} onClick={() => patch(a.id, { status: s.id })} aria-pressed={a.status === s.id}
                      className={`text-[11px] px-2 py-1 rounded-md border ${a.status === s.id ? s.cls + ' font-semibold' : 'border-slate-100 text-slate-400 hover:text-slate-700'}`}>
                      {s.label}
                    </button>
                  ))}
                  <span className={`sr-only`}>Şu anki durum: {st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
