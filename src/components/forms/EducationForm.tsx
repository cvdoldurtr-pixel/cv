import { CVData, emptyEducation } from '../../types/cv';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function EducationForm({ data, setData }: Props) {
  const add = () => {
    setData((prev) => ({
      ...prev,
      educations: [...prev.educations, emptyEducation()],
    }));
  };

  const remove = (id: string) => {
    setData((prev) => ({
      ...prev,
      educations: prev.educations.filter((e) => e.id !== id),
    }));
  };

  const update = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      educations: prev.educations.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {data.educations.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="mb-4">Henüz eğitim bilgisi eklenmedi.</p>
          <button
            onClick={add}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition"
          >
            <Plus size={18} /> Eğitim Ekle
          </button>
        </div>
      )}

      {data.educations.map((edu, idx) => (
        <div key={edu.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-600">Eğitim #{idx + 1}</span>
            <button onClick={() => remove(edu.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Okul / Üniversite *</label>
              <input
                value={edu.school}
                onChange={(e) => update(edu.id, 'school', e.target.value)}
                placeholder="Boğaziçi Üniversitesi"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bölüm</label>
              <input
                value={edu.department}
                onChange={(e) => update(edu.id, 'department', e.target.value)}
                placeholder="Bilgisayar Mühendisliği"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Derece</label>
              <select
                value={edu.degree}
                onChange={(e) => update(edu.id, 'degree', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none bg-white"
              >
                <option value="Lise">Lise</option>
                <option value="Önlisans">Önlisans</option>
                <option value="Lisans">Lisans</option>
                <option value="Yüksek Lisans">Yüksek Lisans</option>
                <option value="Doktora">Doktora</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Başlangıç</label>
              <input
                value={edu.startDate}
                onChange={(e) => update(edu.id, 'startDate', e.target.value)}
                placeholder="2018"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş / Mezuniyet</label>
              <input
                value={edu.endDate}
                onChange={(e) => update(edu.id, 'endDate', e.target.value)}
                placeholder="2022"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">GPA (opsiyonel)</label>
              <input
                value={edu.gpa}
                onChange={(e) => update(edu.id, 'gpa', e.target.value)}
                placeholder="3.45 / 4.00"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      {data.educations.length > 0 && (
        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition"
        >
          <Plus size={18} /> Yeni Eğitim Ekle
        </button>
      )}
    </div>
  );
}
