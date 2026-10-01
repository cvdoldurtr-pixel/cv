import { CVData, emptySkill, emptyLanguage, emptyCertificate, emptyProject } from '../../types/cv';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function SkillsForm({ data, setData }: Props) {
  // Skills
  const addSkill = () => setData((p) => ({ ...p, skills: [...p.skills, emptySkill()] }));
  const removeSkill = (id: string) => setData((p) => ({ ...p, skills: p.skills.filter((s) => s.id !== id) }));
  const updateSkill = (id: string, field: string, value: any) =>
    setData((p) => ({
      ...p,
      skills: p.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));

  // Languages
  const addLang = () => setData((p) => ({ ...p, languages: [...p.languages, emptyLanguage()] }));
  const removeLang = (id: string) => setData((p) => ({ ...p, languages: p.languages.filter((l) => l.id !== id) }));
  const updateLang = (id: string, field: string, value: string) =>
    setData((p) => ({
      ...p,
      languages: p.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));

  // Certificates
  const addCert = () => setData((p) => ({ ...p, certificates: [...p.certificates, emptyCertificate()] }));
  const removeCert = (id: string) => setData((p) => ({ ...p, certificates: p.certificates.filter((c) => c.id !== id) }));
  const updateCert = (id: string, field: string, value: string) =>
    setData((p) => ({
      ...p,
      certificates: p.certificates.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));

  // Projects
  const addProj = () => setData((p) => ({ ...p, projects: [...p.projects, emptyProject()] }));
  const removeProj = (id: string) => setData((p) => ({ ...p, projects: p.projects.filter((pr) => pr.id !== id) }));
  const updateProj = (id: string, field: string, value: string) =>
    setData((p) => ({
      ...p,
      projects: p.projects.map((pr) => (pr.id === id ? { ...pr, [field]: value } : pr)),
    }));

  return (
    <div className="space-y-8">
      {/* Skills */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Yetenekler</h3>
          <button onClick={addSkill} className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
            <Plus size={14} /> Ekle
          </button>
        </div>
        <div className="space-y-2">
          {data.skills.map((s) => (
            <div key={s.id} className="flex gap-2 items-center">
              <input
                value={s.name}
                onChange={(e) => updateSkill(s.id, 'name', e.target.value)}
                placeholder="Python, Excel, Liderlik..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
              <select
                value={s.category}
                onChange={(e) => updateSkill(s.id, 'category', e.target.value)}
                className="px-2 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="technical">Teknik</option>
                <option value="soft">Sosyal</option>
              </select>
              <input
                type="range"
                min={1}
                max={5}
                value={s.level}
                onChange={(e) => updateSkill(s.id, 'level', Number(e.target.value))}
                className="w-20"
              />
              <button onClick={() => removeSkill(s.id)} className="text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {data.skills.length === 0 && <p className="text-sm text-slate-400">Yetenek ekleyin</p>}
        </div>
      </section>

      {/* Languages */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Diller</h3>
          <button onClick={addLang} className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
            <Plus size={14} /> Ekle
          </button>
        </div>
        <div className="space-y-2">
          {data.languages.map((l) => (
            <div key={l.id} className="flex gap-2 items-center">
              <input
                value={l.name}
                onChange={(e) => updateLang(l.id, 'name', e.target.value)}
                placeholder="İngilizce"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
              <select
                value={l.level}
                onChange={(e) => updateLang(l.id, 'level', e.target.value)}
                className="px-2 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Ana Dili">Ana Dili</option>
                <option value="C2">C2</option>
                <option value="C1">C1</option>
                <option value="B2">B2</option>
                <option value="B1">B1</option>
                <option value="A2">A2</option>
                <option value="A1">A1</option>
              </select>
              <button onClick={() => removeLang(l.id)} className="text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Sertifikalar</h3>
          <button onClick={addCert} className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
            <Plus size={14} /> Ekle
          </button>
        </div>
        <div className="space-y-2">
          {data.certificates.map((c) => (
            <div key={c.id} className="flex gap-2 items-center flex-wrap">
              <input
                value={c.name}
                onChange={(e) => updateCert(c.id, 'name', e.target.value)}
                placeholder="Sertifika adı"
                className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
              <input
                value={c.issuer}
                onChange={(e) => updateCert(c.id, 'issuer', e.target.value)}
                placeholder="Kurum"
                className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
              <input
                value={c.date}
                onChange={(e) => updateCert(c.id, 'date', e.target.value)}
                placeholder="2024"
                className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
              <button onClick={() => removeCert(c.id)} className="text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Projeler</h3>
          <button onClick={addProj} className="text-sm text-teal-600 flex items-center gap-1 hover:underline">
            <Plus size={14} /> Ekle
          </button>
        </div>
        <div className="space-y-3">
          {data.projects.map((pr) => (
            <div key={pr.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex justify-between mb-2">
                <input
                  value={pr.name}
                  onChange={(e) => updateProj(pr.id, 'name', e.target.value)}
                  placeholder="Proje adı"
                  className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
                />
                <button onClick={() => removeProj(pr.id)} className="text-red-400 p-1 ml-2">
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={pr.description}
                onChange={(e) => updateProj(pr.id, 'description', e.target.value)}
                placeholder="Kısa açıklama"
                rows={2}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none resize-none mb-2"
              />
              <input
                value={pr.technologies}
                onChange={(e) => updateProj(pr.id, 'technologies', e.target.value)}
                placeholder="Teknolojiler (React, Node...)"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
