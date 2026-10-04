import { CVData, emptyExperience } from '../../types/cv';
import { Plus, Trash2, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { aiAchievements, AILimitError } from '../../utils/aiApi';
import { bulletQuality, BULLET_HINT, BulletLevel } from '../../utils/quality';

const DOT: Record<BulletLevel, string> = {
  placeholder: 'bg-red-500',
  weak: 'bg-red-400',
  ok: 'bg-amber-400',
  strong: 'bg-emerald-500',
};

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function ExperienceForm({ data, setData }: Props) {
  const [busyId, setBusyId] = useState('');
  const [errId, setErrId] = useState('');
  const suggest = async (id: string, position: string, company: string) => {
    if (!position.trim()) { setErrId(id); return; }
    setBusyId(id); setErrId('');
    try {
      const items = await aiAchievements(position, company);
      setData((prev) => ({
        ...prev,
        experiences: prev.experiences.map((x) =>
          x.id === id ? { ...x, achievements: [...x.achievements.filter((a) => a.trim()), ...items] } : x
        ),
      }));
    } catch (e) { if (!(e instanceof AILimitError)) setErrId(id); }
    setBusyId('');
  };

  const add = () => {
    setData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, emptyExperience()],
    }));
  };

  const remove = (id: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  const update = (id: string, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const updateAchievement = (id: string, index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => {
        if (e.id !== id) return e;
        const achievements = [...e.achievements];
        achievements[index] = value;
        return { ...e, achievements };
      }),
    }));
  };

  const removeAchievement = (id: string, index: number) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) =>
        e.id === id ? { ...e, achievements: e.achievements.filter((_, i) => i !== index) } : e
      ),
    }));
  };

  const move = (index: number, dir: -1 | 1) => {
    setData((prev) => {
      const list = [...prev.experiences];
      const j = index + dir;
      if (j < 0 || j >= list.length) return prev;
      [list[index], list[j]] = [list[j], list[index]];
      return { ...prev, experiences: list };
    });
  };

  const addAchievement = (id: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) =>
        e.id === id ? { ...e, achievements: [...e.achievements, ''] } : e
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {data.experiences.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="mb-4">Henüz iş deneyimi eklenmedi.</p>
          <button
            onClick={add}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition"
          >
            <Plus size={18} /> İlk Deneyimi Ekle
          </button>
        </div>
      )}

      {data.experiences.map((exp, idx) => (
        <div key={exp.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-600">Deneyim #{idx + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Yukarı taşı" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                <ChevronUp size={16} />
              </button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === data.experiences.length - 1} aria-label="Aşağı taşı" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => { if ((!exp.company && !exp.position) || confirm('Bu deneyim silinsin mi?')) remove(exp.id); }}
                aria-label="Deneyimi sil"
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Şirket *</label>
              <input
                value={exp.company}
                onChange={(e) => update(exp.id, 'company', e.target.value)}
                placeholder="Şirket Adı"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pozisyon *</label>
              <input
                value={exp.position}
                onChange={(e) => update(exp.id, 'position', e.target.value)}
                placeholder="Yazılım Geliştirici"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Başlangıç</label>
              <input
                value={exp.startDate}
                onChange={(e) => update(exp.id, 'startDate', e.target.value)}
                placeholder="03.2022"
                aria-label="Başlangıç tarihi (Ay.Yıl)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş</label>
              <div className="flex gap-2 items-center">
                <input
                  value={exp.endDate}
                  onChange={(e) => update(exp.id, 'endDate', e.target.value)}
                  placeholder="12.2024"
                  aria-label="Bitiş tarihi (Ay.Yıl)"
                  disabled={exp.current}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none disabled:bg-slate-100"
                />
                <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => update(exp.id, 'current', e.target.checked)}
                    className="rounded"
                  />
                  Devam
                </label>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Açıklama</label>
            <textarea
              value={exp.description}
              onChange={(e) => update(exp.id, 'description', e.target.value)}
              placeholder="Rolünüz ve sorumluluklarınız..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none resize-none"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Başarılar (ölçülebilir)</label>
            {exp.achievements.map((ach, i) => {
              const q = ach.trim() ? bulletQuality(ach) : null;
              return (
                <div key={i} className="mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${q ? DOT[q] : 'bg-slate-200'}`}
                      title={q ? BULLET_HINT[q] : 'Boş madde'}
                      aria-hidden
                    />
                    <input
                      value={ach}
                      onChange={(e) => updateAchievement(exp.id, i, e.target.value)}
                      placeholder="Örn: Aylık satış hedefini 6 ay üst üste %110 gerçekleştirdim"
                      aria-label={`Başarı maddesi ${i + 1}`}
                      aria-describedby={q && q !== 'strong' ? `${exp.id}-b${i}` : undefined}
                      className={`flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm focus:border-teal-500 outline-none ${q === 'placeholder' ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
                    />
                    <button type="button" onClick={() => removeAchievement(exp.id, i)} aria-label={`Başarı maddesi ${i + 1} sil`} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <X size={14} />
                    </button>
                  </div>
                  {q && q !== 'strong' && q !== 'ok' && (
                    <p id={`${exp.id}-b${i}`} className={`text-[11px] mt-0.5 ml-4 ${q === 'placeholder' ? 'text-red-600' : 'text-amber-700'}`}>{BULLET_HINT[q]}</p>
                  )}
                </div>
              );
            })}
            <p className="text-[11px] text-slate-500 mb-1 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> rakamlı, güçlü</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> iyi, rakam eklenebilir</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> zayıf / [X] doldurulmamış</span>
            </p>
            <button
              type="button"
              onClick={() => addAchievement(exp.id)}
              className="text-xs text-teal-700 hover:underline py-1"
            >
              + Başarı ekle
            </button>
            <button
              onClick={() => suggest(exp.id, exp.position, exp.company)}
              disabled={busyId === exp.id}
              className="ml-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline disabled:text-slate-400"
            >
              <Sparkles size={12} /> {busyId === exp.id ? 'Yazılıyor…' : 'AI ile başarı öner'}
            </button>
            {errId === exp.id && <p className="text-xs text-red-600 mt-1" role="alert">{exp.position.trim() ? 'AI şu an yanıt vermedi, biraz sonra tekrar deneyin.' : 'Önce pozisyon adını yazın.'}</p>}
          </div>
        </div>
      ))}

      {data.experiences.length > 0 && (
        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition"
        >
          <Plus size={18} /> Yeni Deneyim Ekle
        </button>
      )}
    </div>
  );
}
