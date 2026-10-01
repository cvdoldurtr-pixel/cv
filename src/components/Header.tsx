import { useState, useRef } from 'react';
import {
  FileText, RotateCcw, Home, Sparkles, Save, FolderOpen, Download, Upload, Trash2, X, Copy, Check, KeyRound,
} from 'lucide-react';
import { SavedProfile, CVData } from '../types/cv';
import { cvToAtsText } from '../utils/atsMatch';
import { requestPdf, openGate } from '../utils/premium';

interface HeaderProps {
  onReset: () => void;
  onHome: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onSaveProfile: (name: string) => void;
  onLoadProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  profiles: SavedProfile[];
  data: CVData;
}

export default function Header({
  onReset,
  onHome,
  onExportJSON,
  onImportJSON,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
  profiles,
  data,
}: HeaderProps) {
  const [showSave, setShowSave] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveProfile(saveName.trim());
      setSaveName('');
      setShowSave(false);
    }
  };

  const copyAtsText = async () => {
    const text = cvToAtsText(data);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAtsTxt = () => {
    const text = cvToAtsText(data);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.personal.fullName?.replace(/\s+/g, '_') || 'CV'}_ATS.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeMenus = () => {
    setShowSave(false);
    setShowProfiles(false);
    setShowExport(false);
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 shadow-sm no-print">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-teal-500/20">
          C
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">
            CV<span className="text-teal-600">Doldur</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Yapay zeka destekli CV</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            onClick={() => { setShowSave(!showSave); setShowProfiles(false); setShowExport(false); }}
            className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition"
            title="Bu CV'yi Kaydet"
          >
            <Save size={16} />
            <span className="hidden md:inline">Kaydet</span>
          </button>
          {showSave && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <p className="text-xs font-medium text-slate-600 mb-2">CV profili olarak kaydet</p>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Örn: Yazılım CV, Satış CV"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  Kaydet
                </button>
                <button onClick={() => setShowSave(false)} className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowProfiles(!showProfiles); setShowSave(false); setShowExport(false); }}
            className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition"
            title="Kayıtlı CV'ler"
          >
            <FolderOpen size={16} />
            <span className="hidden md:inline">Profiller</span>
            {profiles.length > 0 && (
              <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 rounded-full font-semibold">{profiles.length}</span>
            )}
          </button>
          {showProfiles && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Kayıtlı CV'ler</span>
                <button onClick={() => setShowProfiles(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={14} />
                </button>
              </div>
              {profiles.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-400 text-center">Henüz kayıtlı profil yok</p>
              ) : (
                <ul className="py-1">
                  {profiles.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 group">
                      <button
                        onClick={() => { onLoadProfile(p.id); setShowProfiles(false); }}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium text-slate-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.savedAt).toLocaleString('tr-TR')}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${p.name}" silinsin mi?`)) onDeleteProfile(p.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowExport(!showExport); setShowSave(false); setShowProfiles(false); }}
            className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Dışa aktar"
          >
            <Download size={16} />
            <span className="hidden lg:inline">Dışa Aktar</span>
          </button>
          {showExport && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              <button
                onClick={() => { requestPdf(); closeMenus(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText size={14} /> PDF indir
              </button>
              <button
                onClick={() => { onExportJSON(); closeMenus(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Download size={14} /> CV'mi yedekle (düzenlenebilir dosya)
              </button>
              <p className="px-3 pb-2 -mt-1 text-[11px] leading-snug text-slate-500">
                Bu dosya işverene göndermek için değil, CV'nizi başka cihazda veya tarayıcı temizlendikten sonra tekrar düzenlemek içindir. İşverene PDF gönderin.
              </p>
              <button
                onClick={() => { openGate('restore'); closeMenus(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
              >
                <KeyRound size={14} /> Satın alımı geri yükle
              </button>
              <button
                onClick={() => { downloadAtsTxt(); closeMenus(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText size={14} /> Düz metin olarak indir
              </button>
              <button
                onClick={() => { copyAtsText(); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Kopyalandı!' : 'Metni kopyala (iş sitesi formları için)'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
          title="Daha önce indirdiğiniz yedek dosyasını yükleyip CV'nizi tekrar düzenleyin"
        >
          <Upload size={16} />
          <span className="hidden lg:inline">Yedeği geri yükle</span>
        </button>
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

        <button
          onClick={onHome}
          className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Ana Sayfa</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Sıfırla</span>
        </button>
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-100">
          <Sparkles size={12} />
          Akıllı Öneri + İlan Eşleştirme
        </div>
      </div>
    </header>
  );
}
