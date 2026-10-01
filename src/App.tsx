import { useState, useEffect, useCallback } from 'react';
import {
  CVData,
  defaultCVData,
  defaultSections,
  defaultSectionOrder,
  SavedProfile,
  STORAGE_KEY,
  PROFILES_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_PROFILES_KEY,
} from './types/cv';
import Header from './components/Header';
import Wizard from './components/Wizard';
import Preview from './components/Preview';
import Landing from './components/Landing';
import { starters } from './utils/starters';
import PremiumGate from './components/PremiumGate';
import { initPremium, profileLimit, openGate } from './utils/premium';
import { trackOnce } from './utils/track';

function migrateData(raw: Partial<CVData>): CVData {
  return {
    ...defaultCVData,
    ...raw,
    personal: { ...defaultCVData.personal, ...(raw.personal || {}) },
    coverLetter: { ...defaultCVData.coverLetter, ...(raw.coverLetter || {}) },
    sections: { ...defaultSections, ...(raw.sections || {}) },
    sectionOrder: raw.sectionOrder?.length ? raw.sectionOrder : [...defaultSectionOrder],
    jobDescription: raw.jobDescription || '',
    density: raw.density || 'comfortable',
    experiences: raw.experiences || [],
    educations: raw.educations || [],
    skills: raw.skills || [],
    languages: raw.languages || [],
    certificates: raw.certificates || [],
    projects: raw.projects || [],
  };
}

function loadInitial(): CVData {
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY, 'elitecv-data-v2']) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return migrateData(JSON.parse(saved));
      } catch {
        /* continue */
      }
    }
  }
  return defaultCVData;
}

function loadProfiles(): SavedProfile[] {
  for (const key of [PROFILES_KEY, LEGACY_PROFILES_KEY]) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* continue */
      }
    }
  }
  return [];
}

/* SEO rehber sayfalarından gelen bağlantılar: /?role=yazilim veya /?start=1 */
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
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY, 'elitecv-data-v2']) {
    const saved = localStorage.getItem(key);
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

  useEffect(() => {
    trackOnce('app_open');
    initPremium();
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
      if (profiles.length >= profileLimit()) { openGate('profiles'); return; }
      const profile: SavedProfile = {
        id: crypto.randomUUID(),
        name: name.trim() || `CV ${new Date().toLocaleDateString('tr-TR')}`,
        savedAt: new Date().toISOString(),
        data: { ...cvData },
      };
      setProfiles((prev) => [profile, ...prev]);
    },
    [cvData, profiles]
  );

  const handleLoadProfile = useCallback(
    (id: string) => {
      const profile = profiles.find((p) => p.id === id);
      if (profile) {
        setCvData(migrateData(profile.data));
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
        setCvData(migrateData(parsed));
        setStep(0);
        alert('Yedek başarıyla yüklendi!');
      } catch {
        alert('Geçersiz JSON dosyası. Lütfen CVDoldur yedek dosyası seçin.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleApplyStarter = useCallback((data: CVData) => {
    setCvData(migrateData(data));
    setStarted(true);
    setStep(0);
  }, []);

  if (!started) {
    return (
      <>
        <Landing
          onStart={() => setStarted(true)}
          onApplyStarter={handleApplyStarter}
        />
        <PremiumGate />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {storageWarn && (
        <div className="no-print bg-amber-100 text-amber-900 text-xs px-4 py-2 text-center">
          Tarayıcınız CV&apos;nizi kaydedemiyor (depolama dolu veya kapalı, gizli sekme olabilir). Kaybetmemek için menüden &quot;Dışa Aktar&quot; ile yedek alın.
        </div>
      )}
      <Header
        onReset={() => {
          if (confirm('Tüm form verileri silinecek. Emin misiniz?')) {
            setCvData(defaultCVData);
            setStep(0);
            localStorage.removeItem(STORAGE_KEY);
          }
        }}
        onHome={() => setStarted(false)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onSaveProfile={handleSaveProfile}
        onLoadProfile={handleLoadProfile}
        onDeleteProfile={handleDeleteProfile}
        profiles={profiles}
        data={cvData}
      />
      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1600px] mx-auto w-full">
        <div className="w-full lg:w-[480px] xl:w-[540px] border-r border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-64px)] no-print">
          <Wizard data={cvData} setData={setCvData} step={step} setStep={setStep} />
        </div>
        <div className="flex-1 bg-slate-100/80 overflow-y-auto max-h-[calc(100vh-64px)] p-4 lg:p-8 print:p-0 print:max-h-none print:overflow-visible">
          <Preview data={cvData} />
        </div>
      </main>
      <PremiumGate />
    </div>
  );
}

export default App;
