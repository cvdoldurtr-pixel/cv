import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Pencil, Eye } from 'lucide-react';
import {
  CVData,
  defaultCVData,
  SavedProfile,
  STORAGE_KEY,
  PROFILES_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_PROFILES_KEY,
} from './types/cv';
import Header from './components/Header';
import Landing from './components/Landing';

// Editör ve pencereler ihtiyaç anında yüklenir: ana sayfaya gelen ziyaretçi bunları indirmez
const Wizard = lazy(() => import('./components/Wizard'));
const Preview = lazy(() => import('./components/Preview'));
const ImportModal = lazy(() => import('./components/ImportModal'));
const Applications = lazy(() => import('./components/Applications'));

const Loading = () => (
  <div className="p-8 text-center text-sm text-slate-400" role="status">Yükleniyor…</div>
);
import { starters } from './utils/starters';
import PremiumGate from './components/PremiumGate';
import { initPremium, profileLimit, openGate, PREVIEW_EVENT } from './utils/premium';
import { trackOnce } from './utils/track';
import { migrateData } from './utils/migrate';
import { calculateQuality } from './utils/quality';

const LEGACY_V2 = 'elitecv-data-v2';

function loadInitial(): CVData {
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY, LEGACY_V2]) {
    let saved: string | null = null;
    try { saved = localStorage.getItem(key); } catch { /* depolama kapalı */ }
    if (saved) {
      try {
        return migrateData(JSON.parse(saved));
      } catch {
        /* continue */
      }
    }
  }
  return migrateData(defaultCVData);
}

function loadProfiles(): SavedProfile[] {
  for (const key of [PROFILES_KEY, LEGACY_PROFILES_KEY]) {
    let saved: string | null = null;
    try { saved = localStorage.getItem(key); } catch { /* depolama kapalı */ }
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) return list;
      } catch {
        /* continue */
      }
    }
  }
  return [];
}

/* SEO rehber sayfalarından gelen bağlantılar: /?role=yazilim, /?start=1, /?import=1 */
function getStarterFromQuery(): CVData | null {
  if (typeof window === 'undefined') return null;
  const role = new URLSearchParams(window.location.search).get('role');
  if (!role) return null;
  const starter = starters.find((s) => s.id === role);
  return starter ? migrateData(starter.apply()) : null;
}

function shouldAutoStart(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('start') === '1' || getStarterFromQuery() !== null;
}

/* Daha önce doldurulmuş gerçek bir CV varsa şablon onun üzerine yazılmasın */
function hasMeaningfulSavedData(): boolean {
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY, LEGACY_V2]) {
    let saved: string | null = null;
    try { saved = localStorage.getItem(key); } catch { /* depolama kapalı */ }
    if (!saved) continue;
    try {
      const d = JSON.parse(saved) as Partial<CVData>;
      const p = d.personal;
      if (p?.fullName?.trim() || p?.email?.trim() || p?.phone?.trim()) {
        return true;
      }
    } catch {
      /* continue */
    }
  }
  return false;
}

const isMeaningful = (d: CVData) =>
  !!(d.personal.fullName.trim() || d.personal.email.trim() || d.personal.phone.trim() || d.experiences.length);

function loadInitialWithQuery(): CVData {
  const fromQuery = getStarterFromQuery();
  if (fromQuery && !hasMeaningfulSavedData()) return fromQuery;
  return loadInitial();
}

const UI_KEY = 'cvdoldur_ui';
const MAX_STEP = 6;

/* Kaldığın yerden devam: sihirbazın açık olup olmadığı ve hangi adımda olduğu */
function loadUi(): { started: boolean; step: number } {
  try {
    const u = JSON.parse(localStorage.getItem(UI_KEY) || '{}');
    const step = Number.isInteger(u.step) && u.step >= 0 && u.step <= MAX_STEP ? u.step : 0;
    return { started: !!u.started, step };
  } catch {
    return { started: false, step: 0 };
  }
}

function App() {
  const [started, setStarted] = useState<boolean>(
    () => shouldAutoStart() || (loadUi().started && hasMeaningfulSavedData())
  );
  const [cvData, setCvData] = useState<CVData>(loadInitialWithQuery);
  const [step, setStep] = useState(() =>
    getStarterFromQuery() && !hasMeaningfulSavedData() ? 0 : loadUi().step
  );
  const [storageWarn, setStorageWarn] = useState(false);
  const [profiles, setProfiles] = useState<SavedProfile[]>(loadProfiles);
  const [importOpen, setImportOpen] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('import') === '1'
  );
  const [appsOpen, setAppsOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState('');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    trackOnce('app_open');
    initPremium();
    // Editör parçalarını boşta önceden indir: "CV Oluştur"a basınca beklemesin
    const prefetch = () => { void import('./components/Wizard'); void import('./components/Preview'); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(prefetch); else setTimeout(prefetch, 1500);
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData)); setStorageWarn(false); }
    catch { setStorageWarn(true); }
  }, [cvData]);

  useEffect(() => {
    try { localStorage.setItem(UI_KEY, JSON.stringify({ started, step })); } catch { /* önemsiz */ }
  }, [started, step]);

  useEffect(() => {
    if (started) trackOnce('start');
  }, [started]);

  /* Telefonda PDF istenince önizleme sekmesine geç (görsel PDF için önizleme görünür olmalı) */
  useEffect(() => {
    const show = () => setMobileView('preview');
    window.addEventListener(PREVIEW_EVENT, show);
    return () => window.removeEventListener(PREVIEW_EVENT, show);
  }, []);

  /* Geri/ileri tuşu: siteden çıkmak yerine önceki adıma (veya ana sayfaya) dön; veri korunur */
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = e.state as { cv?: boolean; step?: number } | null;
      if (s && s.cv && typeof s.step === 'number') {
        setStarted(true);
        setStep(s.step);
      } else {
        setStarted(false);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!started) return;
    const st = window.history.state as { cv?: boolean; step?: number } | null;
    if (!st || !st.cv || st.step !== step) {
      window.history.pushState({ cv: true, step }, '', window.location.pathname);
    }
  }, [started, step]);

  useEffect(() => {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch { /* depolama dolu veya kapalı */ }
  }, [profiles]);

  const handleSaveProfile = useCallback(
    (name: string) => {
      const trimmed = name.trim() || `CV ${new Date().toLocaleDateString('tr-TR')}`;
      const existing = profiles.find((p) => p.name.toLocaleLowerCase('tr-TR') === trimmed.toLocaleLowerCase('tr-TR'));
      if (existing) {
        // Aynı adlı profil varsa üzerine yaz (hak harcamaz)
        if (!confirm(`"${trimmed}" adlı profil zaten var. Üzerine yazılsın mı?`)) return;
        setProfiles((prev) => prev.map((p) => (p.id === existing.id ? { ...p, savedAt: new Date().toISOString(), data: { ...cvData } } : p)));
        setActiveProfile(trimmed);
        return;
      }
      if (profiles.length >= profileLimit()) { openGate('profiles'); return; }
      const profile: SavedProfile = {
        id: crypto.randomUUID(),
        name: trimmed,
        savedAt: new Date().toISOString(),
        data: { ...cvData },
      };
      setProfiles((prev) => [profile, ...prev]);
      setActiveProfile(trimmed);
    },
    [cvData, profiles]
  );

  const handleLoadProfile = useCallback(
    (id: string) => {
      const profile = profiles.find((p) => p.id === id);
      if (profile) {
        setCvData(migrateData(profile.data));
        setActiveProfile(profile.name);
        setStep(0);
      }
    },
    [profiles]
  );

  const handleDeleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cvdoldur-yedek-${cvData.personal.fullName?.replace(/\s+/g, '_') || 'cv'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cvData]);

  const handleImportJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed || typeof parsed !== 'object' || !('personal' in parsed)) throw new Error('bad');
        setCvData(migrateData(parsed));
        setStep(0);
        alert('Yedek başarıyla yüklendi!');
      } catch {
        alert('Geçersiz dosya. Lütfen CVDoldur yedek dosyası (.json) seçin. PDF veya Word CV için "CV\'mi yükle" seçeneğini kullanın.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleApplyStarter = useCallback((data: CVData) => {
    setCvData(migrateData(data));
    setStarted(true);
    setStep(0);
    setActiveProfile('');
  }, []);

  const handleImported = useCallback((data: CVData) => {
    setCvData(data);
    setImportOpen(false);
    setStarted(true);
    setStep(0);
    setMobileView('edit');
    setActiveProfile('');
  }, []);

  const closeImport = useCallback(() => setImportOpen(false), []);
  const closeApps = useCallback(() => setAppsOpen(false), []);

  const importModal = importOpen ? (
    <Suspense fallback={null}>
      <ImportModal
        open={importOpen}
        current={cvData}
        hasExisting={isMeaningful(cvData)}
        onClose={closeImport}
        onApply={handleImported}
      />
    </Suspense>
  ) : null;

  if (!started) {
    return (
      <>
        <Landing
          onStart={() => setStarted(true)}
          onApplyStarter={handleApplyStarter}
          onImport={() => setImportOpen(true)}
        />
        {importModal}
        <PremiumGate />
      </>
    );
  }

  const quality = calculateQuality(cvData);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {storageWarn && (
        <div className="no-print bg-amber-100 text-amber-900 text-xs px-4 py-2 text-center" role="alert">
          Tarayıcınız CV&apos;nizi kaydedemiyor (depolama dolu veya kapalı, gizli sekme olabilir). Kaybetmemek için menüden &quot;Dışa Aktar&quot; ile yedek alın.
        </div>
      )}
      <Header
        onReset={() => {
          if (confirm('Tüm form verileri silinecek. Emin misiniz?')) {
            setCvData(migrateData(defaultCVData));
            setStep(0);
            setActiveProfile('');
            try { localStorage.removeItem(STORAGE_KEY); } catch { /* önemsiz */ }
          }
        }}
        onHome={() => setStarted(false)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onImportCv={() => setImportOpen(true)}
        onOpenApps={() => setAppsOpen(true)}
        onSaveProfile={handleSaveProfile}
        onLoadProfile={handleLoadProfile}
        onDeleteProfile={handleDeleteProfile}
        profiles={profiles}
        data={cvData}
      />

      {/* Telefon/tablet: Düzenle / Önizle */}
      <div className="lg:hidden sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3 py-2 no-print">
        <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-xl p-1" role="tablist" aria-label="Görünüm">
          <button role="tab" aria-selected={mobileView === 'edit'} onClick={() => setMobileView('edit')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium ${mobileView === 'edit' ? 'bg-white shadow text-teal-800' : 'text-slate-600'}`}>
            <Pencil size={15} /> Düzenle
          </button>
          <button role="tab" aria-selected={mobileView === 'preview'} onClick={() => setMobileView('preview')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium ${mobileView === 'preview' ? 'bg-white shadow text-teal-800' : 'text-slate-600'}`}>
            <Eye size={15} /> Önizle
            <span className={`text-[11px] font-bold px-1.5 rounded-full ${quality.score >= 80 ? 'bg-emerald-100 text-emerald-700' : quality.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
              {quality.score}
            </span>
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1600px] mx-auto w-full">
        <div
          className={`w-full lg:w-[480px] xl:w-[540px] border-r border-slate-200 bg-white shadow-sm overflow-hidden flex-col lg:max-h-[calc(100vh-64px)] no-print ${
            mobileView === 'edit' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <Suspense fallback={<Loading />}>
            <Wizard data={cvData} setData={setCvData} step={step} setStep={setStep} />
          </Suspense>
        </div>
        <div
          className={`flex-1 bg-slate-100/80 overflow-y-auto lg:max-h-[calc(100vh-64px)] p-3 sm:p-4 lg:p-8 print:block print:p-0 print:max-h-none print:overflow-visible ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <Suspense fallback={<Loading />}>
            <Preview data={cvData} />
          </Suspense>
        </div>
      </main>
      {importModal}
      {appsOpen && (
        <Suspense fallback={null}>
          <Applications
            open={appsOpen}
            onClose={closeApps}
            defaults={{ company: cvData.coverLetter.company, position: cvData.coverLetter.position || cvData.personal.title, cvName: activeProfile }}
          />
        </Suspense>
      )}
      <PremiumGate />
    </div>
  );
}

export default App;
