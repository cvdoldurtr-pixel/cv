import { CVData, emptyExperience } from '../../types/cv';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { aiAchievements, AILimitError } from '../../utils/aiApi';

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
            <button
              onClick={() => remove(exp.id)}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
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
                placeholder="01.2022"
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
            {exp.achievements.map((ach, i) => (
              <input
                key={i}
                value={ach}
                onChange={(e) => updateAchievement(exp.id, i, e.target.value)}
                placeholder="Örn: Satışları %25 artırdım"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none mb-2"
              />
            ))}
            <button
              onClick={() => addAchievement(exp.id)}
              className="text-xs text-teal-600 hover:underline"
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
            {errId === exp.id && <p className="text-xs text-red-600 mt-1">Önce pozisyon adını yazın veya biraz sonra tekrar deneyin.</p>}
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
