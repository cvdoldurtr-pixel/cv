import { useState, useRef, useEffect } from 'react';
import {
  FileText, RotateCcw, Home, Save, FolderOpen, Download, Upload, Trash2, X, Copy, Check, KeyRound,
  Briefcase, FileUp, MoreVertical,
} from 'lucide-react';
import { SavedProfile, CVData } from '../types/cv';
import { cvToAtsText } from '../utils/atsMatch';
import { requestPdf, openGate, profileLimit } from '../utils/premium';

interface HeaderProps {
  onReset: () => void;
  onHome: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onImportCv: () => void;
  onOpenApps: () => void;
  onSaveProfile: (name: string) => void;
  onLoadProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  profiles: SavedProfile[];
  data: CVData;
}

type Menu = 'save' | 'profiles' | 'more' | null;

export default function Header({
  onReset,
  onHome,
  onExportJSON,
  onImportJSON,
  onImportCv,
  onOpenApps,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
  profiles,
  data,
}: HeaderProps) {
  const [menu, setMenu] = useState<Menu>(null);
  const [saveName, setSaveName] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca veya Esc ile menüyü kapat
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (barRef.current && !barRef.current.contains(e.target as Node)) setMenu(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menu]);

  const toggle = (m: Menu) => setMenu((cur) => (cur === m ? null : m));

  const handleSave = () => {
    const name = saveName.trim() || data.personal.title.trim() || `CV ${new Date().toLocaleDateString('tr-TR')}`;
    onSaveProfile(name);
    setSaveName('');
    setMenu(null);
  };

  const copyAtsText = async () => {
    try {
      await navigator.clipboard.writeText(cvToAtsText(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Kopyalanamadı. "Düz metin olarak indir" seçeneğini kullanın.');
    }
  };

  const downloadAtsTxt = () => {
    const blob = new Blob([cvToAtsText(data)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.personal.fullName?.replace(/\s+/g, '_') || 'CV'}_ATS.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const BTN = 'flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 rounded-lg transition min-h-[40px]';
  const ITEM = 'w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2';

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 lg:px-8 sticky top-0 z-50 shadow-sm no-print">
      <button type="button" onClick={onHome} className="flex items-center gap-2.5 min-w-0" aria-label="Ana sayfaya dön">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-teal-500/20 shrink-0">
          C
        </div>
        <div className="text-left hidden min-[400px]:block">
          <p className="font-bold text-lg text-slate-900 leading-tight tracking-tight">
            CV<span className="text-teal-600">Doldur</span>
          </p>
          <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Yapay zeka destekli CV</p>
        </div>
      </button>

      <div ref={barRef} className="flex items-center gap-0.5 sm:gap-1">
        <button type="button" onClick={onImportCv} className={`${BTN} hover:bg-teal-50 hover:text-teal-700 hidden md:flex`} title="PDF, Word veya LinkedIn CV'nizi yükleyin">
          <FileUp size={16} />
          <span className="hidden xl:inline">CV'mi yükle</span>
        </button>

        <button type="button" onClick={onOpenApps} className={`${BTN} hover:bg-teal-50 hover:text-teal-700`} title="Başvurularım" aria-label="Başvurularım">
          <Briefcase size={16} />
          <span className="hidden lg:inline">Başvurularım</span>
        </button>

        <div className="relative">
          <button type="button" onClick={() => toggle('save')} aria-expanded={menu === 'save'} className={`${BTN} hover:bg-teal-50 hover:text-teal-700`} title="Bu CV'yi profil olarak kaydet" aria-label="Kaydet">
            <Save size={16} />
            <span className="hidden md:inline">Kaydet</span>
          </button>
          {menu === 'save' && (
            <div className="absolute right-0 top-full mt-1 w-72 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <label htmlFor="hdr-save" className="text-xs font-medium text-slate-600 mb-2 block">CV profili olarak kaydet</label>
              <input
                id="hdr-save"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={data.personal.title ? `Ör: ${data.personal.title} – ABC A.Ş.` : 'Örn: Satış CV, ABC A.Ş. ilanı'}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mb-2">{profiles.length} / {profileLimit()} profil kullanılıyor. Aynı adla kaydederseniz üzerine yazılır.</p>
              <div className="flex gap-2">
                <button type="button" onClick={handleSave} className="flex-1 px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">Kaydet</button>
                <button type="button" onClick={() => setMenu(null)} className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">İptal</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onClick={() => toggle('profiles')} aria-expanded={menu === 'profiles'} className={`${BTN} hover:bg-teal-50 hover:text-teal-700`} title="Kayıtlı CV'ler" aria-label="Kayıtlı CV profilleri">
            <FolderOpen size={16} />
            <span className="hidden md:inline">Profiller</span>
            {profiles.length > 0 && (
              <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 rounded-full font-semibold">{profiles.length}</span>
            )}
          </button>
          {menu === 'profiles' && (
            <div className="absolute right-0 top-full mt-1 w-72 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Kayıtlı CV'ler ({profiles.length}/{profileLimit()})</span>
                <button type="button" onClick={() => setMenu(null)} className="p-1 hover:bg-slate-100 rounded" aria-label="Kapat">
                  <X size={14} />
                </button>
              </div>
              {profiles.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-400 text-center">Henüz kayıtlı profil yok. Her ilana özel CV'yi ayrı adla kaydedebilirsiniz.</p>
              ) : (
                <ul className="py-1">
                  {profiles.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50">
                      <button type="button" onClick={() => { onLoadProfile(p.id); setMenu(null); }} className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{new Date(p.savedAt).toLocaleString('tr-TR')}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (confirm(`"${p.name}" silinsin mi?`)) onDeleteProfile(p.id); }}
                        aria-label={`${p.name} profilini sil`}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {profiles.length >= profileLimit() && (
                <button type="button" onClick={() => { openGate('profiles'); setMenu(null); }} className="w-full text-xs text-teal-700 font-semibold border-t border-slate-100 py-2 hover:bg-teal-50">
                  Daha fazla profil için paketleri gör →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button type="button" onClick={() => toggle('more')} aria-expanded={menu === 'more'} aria-haspopup="menu" className={`${BTN} hover:bg-slate-100`} title="Diğer işlemler" aria-label="Diğer işlemler">
            <MoreVertical size={16} />
            <span className="hidden lg:inline">Menü</span>
          </button>
          {menu === 'more' && (
            <div role="menu" className="absolute right-0 top-full mt-1 w-72 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              <button role="menuitem" type="button" onClick={() => { requestPdf(data); setMenu(null); }} className={ITEM}>
                <FileText size={14} /> PDF indir
              </button>
              <button role="menuitem" type="button" onClick={() => { onImportCv(); setMenu(null); }} className={ITEM}>
                <FileUp size={14} /> CV'mi yükle (PDF / Word / LinkedIn)
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button role="menuitem" type="button" onClick={() => { downloadAtsTxt(); setMenu(null); }} className={ITEM}>
                <FileText size={14} /> Düz metin olarak indir
              </button>
              <button role="menuitem" type="button" onClick={() => void copyAtsText()} className={ITEM}>
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Kopyalandı!' : 'Metni kopyala (iş sitesi formları için)'}
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button role="menuitem" type="button" onClick={() => { onExportJSON(); setMenu(null); }} className={ITEM}>
                <Download size={14} /> Yedek al (düzenlenebilir dosya)
              </button>
              <button role="menuitem" type="button" onClick={() => { fileRef.current?.click(); setMenu(null); }} className={ITEM}>
                <Upload size={14} /> Yedeği geri yükle
              </button>
              <p className="px-3 pb-2 text-[11px] leading-snug text-slate-500">
                Yedek dosyası işverene gönderilmez; CV'nizi başka cihazda düzenlemek içindir.
              </p>
              <div className="border-t border-slate-100 my-1" />
              <button role="menuitem" type="button" onClick={() => { openGate('restore'); setMenu(null); }} className={ITEM}>
                <KeyRound size={14} /> Satın alımı geri yükle
              </button>
              <button role="menuitem" type="button" onClick={() => { onHome(); setMenu(null); }} className={ITEM}>
                <Home size={14} /> Ana sayfa
              </button>
              <button role="menuitem" type="button" onClick={() => { setMenu(null); onReset(); }} className={`${ITEM} text-red-600 hover:bg-red-50`}>
                <RotateCcw size={14} /> Formu sıfırla
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportJSON(f);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}
