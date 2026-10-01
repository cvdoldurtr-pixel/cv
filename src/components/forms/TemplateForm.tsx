import { CVData, SectionVisibility, SectionKey, defaultSectionOrder } from '../../types/cv';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Temiz, ATS dostu, tek sütun',
    preview: (
      <div className="w-full h-full bg-white p-1.5 text-[4px] leading-tight overflow-hidden">
        <div className="border-b-2 border-teal-600 pb-1 mb-1">
          <div className="font-bold text-[5px]">Ad Soyad</div>
          <div className="text-teal-600">Pozisyon</div>
          <div className="text-slate-400">email · telefon</div>
        </div>
        <div className="font-bold text-teal-700 mb-0.5">ÖZET</div>
        <div className="bg-slate-100 h-2 rounded mb-1" />
        <div className="font-bold text-teal-700 mb-0.5">DENEYİM</div>
        <div className="bg-slate-100 h-1.5 rounded mb-0.5" />
        <div className="bg-slate-100 h-1.5 rounded w-3/4" />
      </div>
    ),
  },
  {
    id: 'classic',
    name: 'Klasik',
    desc: 'Geleneksel, kurumsal',
    preview: (
      <div className="w-full h-full bg-white p-1.5 text-[4px] leading-tight overflow-hidden">
        <div className="text-center border-b border-slate-300 pb-1 mb-1">
          <div className="font-bold text-[5px] uppercase tracking-wide">Ad Soyad</div>
          <div className="text-slate-500">Pozisyon</div>
        </div>
        <div className="font-bold border-b border-slate-200 mb-0.5">İŞ DENEYİMİ</div>
        <div className="bg-slate-100 h-1.5 rounded mb-0.5" />
        <div className="bg-slate-100 h-1.5 rounded w-4/5 mb-1" />
        <div className="font-bold border-b border-slate-200 mb-0.5">EĞİTİM</div>
        <div className="bg-slate-100 h-1.5 rounded w-2/3" />
      </div>
    ),
  },
  {
    id: 'sidebar',
    name: 'Yan Sütun',
    desc: 'Modern iki sütun (fotoğraflı)',
    preview: (
      <div className="w-full h-full bg-white flex text-[4px] leading-tight overflow-hidden">
        <div className="w-1/3 bg-teal-700 text-white p-1">
          <div className="w-4 h-4 rounded-full bg-teal-500 mx-auto mb-1" />
          <div className="font-bold text-center mb-0.5">Ad</div>
          <div className="bg-teal-600 h-1 rounded mb-0.5" />
          <div className="bg-teal-600 h-1 rounded w-3/4 mx-auto" />
        </div>
        <div className="flex-1 p-1">
          <div className="font-bold text-teal-700 mb-0.5">DENEYİM</div>
          <div className="bg-slate-100 h-1.5 rounded mb-0.5" />
          <div className="bg-slate-100 h-1.5 rounded w-3/4" />
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Sade ve şık',
    preview: (
      <div className="w-full h-full bg-white p-1.5 text-[4px] leading-tight overflow-hidden">
        <div className="mb-1">
          <div className="font-bold text-[5px]">Ad Soyad</div>
          <div className="text-slate-400">Pozisyon · Şehir</div>
        </div>
        <div className="h-px bg-slate-200 mb-1" />
        <div className="text-slate-500 mb-0.5">Deneyim</div>
        <div className="bg-slate-50 h-1.5 rounded mb-0.5" />
        <div className="bg-slate-50 h-1.5 rounded w-2/3" />
      </div>
    ),
  },
];

const colors = [
  { id: '#0f766e', name: 'Teal' },
  { id: '#1e40af', name: 'Mavi' },
  { id: '#7c3aed', name: 'Mor' },
  { id: '#be123c', name: 'Bordo' },
  { id: '#0f172a', name: 'Siyah' },
  { id: '#059669', name: 'Yeşil' },
];

const sectionLabels: { key: SectionKey; label: string }[] = [
  { key: 'summary', label: 'Profesyonel Özet' },
  { key: 'experience', label: 'İş Deneyimi' },
  { key: 'education', label: 'Eğitim' },
  { key: 'skills', label: 'Yetenekler' },
  { key: 'languages', label: 'Diller' },
  { key: 'certificates', label: 'Sertifikalar' },
  { key: 'projects', label: 'Projeler' },
  { key: 'coverLetter', label: 'Ön Yazı' },
];

const densityOptions = [
  { id: 'comfortable' as const, label: 'Rahat', desc: 'Geniş boşluk' },
  { id: 'compact' as const, label: 'Kompakt', desc: 'Dengeli' },
  { id: 'tight' as const, label: 'Sıkı', desc: 'Tek sayfa' },
];

export default function TemplateForm({ data, setData }: Props) {
  const order = data.sectionOrder?.length ? data.sectionOrder : defaultSectionOrder;

  const toggleSection = (key: keyof SectionVisibility) => {
    setData((p) => ({
      ...p,
      sections: { ...p.sections, [key]: !p.sections[key] },
    }));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setData((p) => ({ ...p, sectionOrder: next }));
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-semibold text-slate-800 mb-3">Şablon Seçin</h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setData((p) => ({ ...p, template: t.id }))}
              className={`rounded-xl border-2 text-left transition overflow-hidden ${
                data.template === t.id
                  ? 'border-teal-600 ring-2 ring-teal-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="h-20 bg-slate-50 border-b border-slate-100 relative">
                {t.preview}
                {data.template === t.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <div className="font-medium text-slate-900 text-sm">{t.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800 mb-3">Ana Renk</h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => setData((p) => ({ ...p, color: c.id }))}
              className={`w-10 h-10 rounded-full border-2 transition ${
                data.color === c.id ? 'border-slate-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.id }}
              title={c.name}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800 mb-1">Yoğunluk</h3>
        <p className="text-xs text-slate-500 mb-3">Tek sayfaya sığdırmak için sıkı modu deneyin</p>
        <div className="grid grid-cols-3 gap-2">
          {densityOptions.map((d) => (
            <button
              key={d.id}
              onClick={() => setData((p) => ({ ...p, density: d.id }))}
              className={`p-3 rounded-xl border-2 text-center transition ${
                data.density === d.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-medium text-slate-900">{d.label}</div>
              <div className="text-[10px] text-slate-500">{d.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800 mb-1">Bölüm sırası</h3>
        <p className="text-xs text-slate-500 mb-3">Yukarı / aşağı ile sırayı değiştirin (Modern şablonda uygulanır)</p>
        <div className="space-y-1.5">
          {order.filter((k) => k !== 'coverLetter').map((key, index) => {
            const label = sectionLabels.find((s) => s.key === key)?.label || key;
            return (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <span className="flex-1 text-sm text-slate-700">{label}</span>
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === order.filter((k) => k !== 'coverLetter').length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800 mb-1">Bölüm görünürlüğü</h3>
        <p className="text-xs text-slate-500 mb-3">Gizlenen bölümler önizleme ve PDF'de çıkmaz</p>
        <div className="space-y-2">
          {sectionLabels.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-150 hover:bg-slate-50 cursor-pointer transition"
            >
              <span className="text-sm text-slate-700">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={data.sections[key]}
                onClick={() => toggleSection(key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  data.sections[key] ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    data.sections[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
        <p className="font-medium mb-1">ATS İpucu</p>
        <p>
          "Modern" ve "Klasik" şablonlar ATS sistemleri için en güvenli seçeneklerdir.
          Kariyer.net ve İŞKUR için tek sütunlu şablonlar önerilir.
        </p>
      </div>
    </div>
  );
}
