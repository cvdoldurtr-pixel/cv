import { CVData, emptySkill, emptyLanguage, emptyCertificate, emptyProject, emptyReference, LANGUAGE_LEVELS, getAISuggestions } from '../../types/cv';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

const IN = 'px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none';
const DEL = 'text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg w-9 h-9 flex items-center justify-center shrink-0';

function Head({ title, onAdd, hint }: { title: string; onAdd: () => void; hint?: string }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      </div>
      <button type="button" onClick={onAdd} className="text-sm text-teal-700 flex items-center gap-1 hover:bg-teal-50 px-2 py-1.5 rounded-lg">
        <Plus size={14} /> Ekle
      </button>
    </div>
  );
}

export default function SkillsForm({ data, setData }: Props) {
  type ListKey = 'skills' | 'languages' | 'certificates' | 'projects' | 'references';
  const add = <K extends ListKey>(key: K, item: CVData[K][number]) =>
    setData((p) => ({ ...p, [key]: [...(p[key] as CVData[K][number][]), item] }));
  const remove = (key: ListKey, id: string) =>
    setData((p) => ({ ...p, [key]: (p[key] as { id: string }[]).filter((x) => x.id !== id) }));
  const upd = (key: ListKey, id: string, field: string, value: unknown) =>
    setData((p) => ({ ...p, [key]: (p[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));

  const suggested = getAISuggestions(data.personal.title, 'skill').filter(
    (s) => !data.skills.some((k) => k.name.toLocaleLowerCase('tr-TR') === s.toLocaleLowerCase('tr-TR'))
  );

  return (
    <div className="space-y-8">
      {/* Yetenekler */}
      <section>
        <Head title="Yetenekler" hint="İlandaki teknik terimleri, gerçekten biliyorsanız aynı yazımla ekleyin" onAdd={() => add('skills', emptySkill())} />
        <div className="space-y-2">
          {data.skills.map((s) => (
            <div key={s.id} className="flex gap-2 items-center">
              <input value={s.name} onChange={(e) => upd('skills', s.id, 'name', e.target.value)} placeholder="Python, Excel, Logo Tiger..." aria-label="Yetenek adı" className={`flex-1 min-w-0 ${IN}`} />
              <select value={s.category} onChange={(e) => upd('skills', s.id, 'category', e.target.value)} aria-label="Yetenek türü" className={`${IN} bg-white px-2`}>
                <option value="technical">Teknik</option>
                <option value="soft">Sosyal</option>
              </select>
              <input type="range" min={1} max={5} value={s.level} onChange={(e) => upd('skills', s.id, 'level', Number(e.target.value))} aria-label={`${s.name || 'Yetenek'} seviyesi (1-5)`} className="w-16 sm:w-20" />
              <button type="button" onClick={() => remove('skills', s.id)} aria-label={`${s.name || 'Yetenek'} sil`} className={DEL}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {data.skills.length === 0 && <p className="text-sm text-slate-400">Henüz yetenek yok.</p>}
        </div>
        {suggested.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-slate-500 mb-1.5">Öneriler (tıklayınca eklenir):</p>
            <div className="flex flex-wrap gap-1.5">
              {suggested.slice(0, 10).map((s) => (
                <button key={s} type="button" onClick={() => add('skills', { ...emptySkill(), name: s })}
                  className="text-xs px-2 py-1 rounded-md border border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Diller */}
      <section>
        <Head title="Diller" hint="Avrupa ortak çerçevesi: A1-A2 başlangıç, B1-B2 orta, C1-C2 ileri" onAdd={() => add('languages', emptyLanguage())} />
        <div className="space-y-2">
          {data.languages.map((l) => (
            <div key={l.id} className="flex gap-2 items-center">
              <input value={l.name} onChange={(e) => upd('languages', l.id, 'name', e.target.value)} placeholder="İngilizce" aria-label="Dil" className={`flex-1 min-w-0 ${IN}`} />
              <select value={l.level} onChange={(e) => upd('languages', l.id, 'level', e.target.value)} aria-label={`${l.name || 'Dil'} seviyesi`} className={`${IN} bg-white px-2`}>
                {LANGUAGE_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
              </select>
              <button type="button" onClick={() => remove('languages', l.id)} aria-label={`${l.name || 'Dil'} sil`} className={DEL}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sertifikalar ve sınavlar */}
      <section>
        <Head title="Sertifikalar ve Sınavlar" hint="Ör. SRC, KPSS, YDS, ALES, MEB onaylı kurslar, SMMM, ISTQB" onAdd={() => add('certificates', emptyCertificate())} />
        <div className="space-y-2">
          {data.certificates.map((c) => (
            <div key={c.id} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <input value={c.name} onChange={(e) => upd('certificates', c.id, 'name', e.target.value)} placeholder="Sertifika / sınav (puan)" aria-label="Sertifika adı" className={`flex-1 min-w-[140px] ${IN}`} />
              <input value={c.issuer} onChange={(e) => upd('certificates', c.id, 'issuer', e.target.value)} placeholder="Kurum" aria-label="Veren kurum" className={`w-32 ${IN}`} />
              <input value={c.date} onChange={(e) => upd('certificates', c.id, 'date', e.target.value)} placeholder="2024" aria-label="Yıl" className={`w-20 ${IN}`} />
              <button type="button" onClick={() => remove('certificates', c.id)} aria-label={`${c.name || 'Sertifika'} sil`} className={DEL}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Projeler */}
      <section>
        <Head title="Projeler" hint="Yeni mezunlar için bitirme projesi, staj projesi, gönüllü iş" onAdd={() => add('projects', emptyProject())} />
        <div className="space-y-3">
          {data.projects.map((pr) => (
            <div key={pr.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
              <div className="flex gap-2">
                <input value={pr.name} onChange={(e) => upd('projects', pr.id, 'name', e.target.value)} placeholder="Proje adı" aria-label="Proje adı" className={`flex-1 min-w-0 ${IN}`} />
                <button type="button" onClick={() => remove('projects', pr.id)} aria-label={`${pr.name || 'Proje'} sil`} className={DEL}>
                  <Trash2 size={15} />
                </button>
              </div>
              <textarea value={pr.description} onChange={(e) => upd('projects', pr.id, 'description', e.target.value)} placeholder="Kısa açıklama: sorun, ne yaptınız, sonuç" aria-label="Proje açıklaması" rows={2} className={`w-full ${IN} resize-y`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={pr.technologies} onChange={(e) => upd('projects', pr.id, 'technologies', e.target.value)} placeholder="Araçlar / teknolojiler" aria-label="Teknolojiler" className={IN} />
                <input value={pr.link} onChange={(e) => upd('projects', pr.id, 'link', e.target.value)} placeholder="Bağlantı (opsiyonel)" aria-label="Proje bağlantısı" className={IN} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referanslar */}
      <section>
        <Head title="Referanslar" hint="Eklemeden önce kişiden izin alın" onAdd={() => add('references', emptyReference())} />
        <div className="space-y-3">
          {data.references.map((r) => (
            <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={r.name} onChange={(e) => upd('references', r.id, 'name', e.target.value)} placeholder="Ad Soyad" aria-label="Referans adı" className={IN} />
                <input value={r.title} onChange={(e) => upd('references', r.id, 'title', e.target.value)} placeholder="Unvan, Kurum" aria-label="Referans unvanı ve kurumu" className={IN} />
                <input value={r.phone} onChange={(e) => upd('references', r.id, 'phone', e.target.value)} placeholder="Telefon" inputMode="tel" aria-label="Referans telefonu" className={IN} />
                <div className="flex gap-2">
                  <input value={r.email} onChange={(e) => upd('references', r.id, 'email', e.target.value)} placeholder="E-posta" inputMode="email" aria-label="Referans e-postası" className={`flex-1 min-w-0 ${IN}`} />
                  <button type="button" onClick={() => remove('references', r.id)} aria-label={`${r.name || 'Referans'} sil`} className={DEL}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.referencesOnRequest}
              onChange={(e) => setData((p) => ({ ...p, referencesOnRequest: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            İsim yazmak yerine “Referanslar istenildiğinde verilecektir.” yaz
          </label>
        </div>
      </section>
    </div>
  );
}
