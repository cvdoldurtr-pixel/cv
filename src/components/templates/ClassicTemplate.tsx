import { CVData } from '../../types/cv';
import { densityClasses } from '../../utils/density';

export default function ClassicTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');

  return (
    <div className={`${dens.pad} text-sm`} style={{ fontFamily: 'Georgia, serif' }}>
      {/* Centered Header */}
      <div className="text-center border-b pb-4 mb-6" style={{ borderColor: color }}>
        {personal.photo && (
          <img
            src={personal.photo}
            alt=""
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2"
            style={{ borderColor: color }}
          />
        )}
        <h1 className="text-3xl font-bold text-slate-900 tracking-wide uppercase">
          {personal.fullName || 'Ad Soyad'}
        </h1>
        {personal.title && (
          <p className="text-base mt-1 italic" style={{ color }}>{personal.title}</p>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.city && <span>• {personal.city}</span>}
        </div>
        {(personal.birthDate || personal.militaryStatus) && (
          <div className="text-xs text-slate-500 mt-1">
            {personal.birthDate && `Doğum: ${personal.birthDate}`}
            {personal.militaryStatus && ` | Askerlik: ${personal.militaryStatus}`}
            {personal.maritalStatus && ` | ${personal.maritalStatus}`}
          </div>
        )}
      </div>

      {sections.summary && personal.summary && (
        <section className="mb-5 avoid-break">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>
            Özet
          </h2>
          <p className="text-slate-700 leading-relaxed text-[13px]">{personal.summary}</p>
        </section>
      )}

      {sections.experience && experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1" style={{ color, borderColor: color }}>
            Deneyim
          </h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4 avoid-break">
              <div className="flex justify-between">
                <strong className="text-slate-900">{exp.position}</strong>
                <span className="text-xs text-slate-500">{exp.startDate} – {exp.current ? 'Devam' : exp.endDate}</span>
              </div>
              <p className="italic text-slate-600">{exp.company}</p>
              {exp.description && <p className="text-[13px] mt-1 text-slate-700">{exp.description}</p>}
              <ul className="mt-1 ml-4 list-disc text-[13px] text-slate-700">
                {exp.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {sections.education && educations.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1" style={{ color, borderColor: color }}>
            Eğitim
          </h2>
          {educations.map((edu) => (
            <div key={edu.id} className="mb-3 avoid-break">
              <div className="flex justify-between">
                <strong>{edu.school}</strong>
                <span className="text-xs text-slate-500">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="text-slate-600">{edu.degree} {edu.department && `• ${edu.department}`} {edu.gpa && `• ${edu.gpa}`}</p>
            </div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-2 gap-6">
        {sections.skills && skills.length > 0 && (
          <section className="avoid-break">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>
              Yetenekler
            </h2>
            <p className="text-[13px] text-slate-700">{skills.map(s => s.name).join(' • ')}</p>
          </section>
        )}
        {sections.languages && languages.length > 0 && (
          <section className="avoid-break">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>
              Diller
            </h2>
            {languages.map(l => (
              <div key={l.id} className="flex justify-between text-[13px]">
                <span>{l.name}</span><span className="text-slate-500">{l.level}</span>
              </div>
            ))}
          </section>
        )}
      </div>

      {sections.certificates && certificates.length > 0 && (
        <section className="mt-5 avoid-break">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>
            Sertifikalar
          </h2>
          {certificates.map(c => (
            <div key={c.id} className="text-[13px] flex justify-between">
              <span>{c.name} — {c.issuer}</span>
              <span className="text-slate-500">{c.date}</span>
            </div>
          ))}
        </section>
      )}

      {sections.projects && projects.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>
            Projeler
          </h2>
          {projects.map(pr => (
            <div key={pr.id} className="mb-2 avoid-break">
              <strong className="text-[13px]">{pr.name}</strong>
              {pr.description && <p className="text-[13px] text-slate-600">{pr.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
