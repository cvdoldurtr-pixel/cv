import { CVData } from '../../types/cv';
import { densityClasses } from '../../utils/density';

export default function MinimalTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');

  return (
    <div className={`${dens.pad} text-sm leading-relaxed`} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-slate-900">
          {personal.fullName || 'Ad Soyad'}
        </h1>
        {personal.title && (
          <p className="text-lg mt-1 font-light" style={{ color }}>{personal.title}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.city && <span>{personal.city}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>

      {sections.summary && personal.summary && (
        <section className="mb-6 avoid-break">
          <p className="text-slate-700 text-[13px] leading-relaxed border-l-2 pl-4" style={{ borderColor: color }}>
            {personal.summary}
          </p>
        </section>
      )}

      {sections.experience && experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Deneyim</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4 grid grid-cols-[100px_1fr] gap-4 avoid-break">
              <div className="text-xs text-slate-400 pt-0.5">
                {exp.startDate}<br />{exp.current ? 'Devam' : exp.endDate}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{exp.position}</h3>
                <p className="text-sm text-slate-500">{exp.company}</p>
                {exp.description && <p className="text-[13px] text-slate-600 mt-1">{exp.description}</p>}
                <ul className="mt-1 space-y-0.5">
                  {exp.achievements.filter(Boolean).map((a, i) => (
                    <li key={i} className="text-[13px] text-slate-700">– {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      )}

      {sections.education && educations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Eğitim</h2>
          {educations.map((edu) => (
            <div key={edu.id} className="mb-3 grid grid-cols-[100px_1fr] gap-4 avoid-break">
              <div className="text-xs text-slate-400">{edu.startDate} – {edu.endDate}</div>
              <div>
                <h3 className="font-medium">{edu.school}</h3>
                <p className="text-sm text-slate-500">{edu.degree} {edu.department}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {((sections.skills && skills.length > 0) || (sections.languages && languages.length > 0)) && (
        <section className="mb-6 avoid-break">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Yetenekler & Diller</h2>
          {sections.skills && skills.length > 0 && (
            <p className="text-[13px] text-slate-700 mb-2">
              {skills.map(s => s.name).join('  ·  ')}
            </p>
          )}
          {sections.languages && languages.length > 0 && (
            <p className="text-[13px] text-slate-600">
              {languages.map(l => `${l.name} (${l.level})`).join('  ·  ')}
            </p>
          )}
        </section>
      )}

      {sections.certificates && certificates.length > 0 && (
        <section className="mb-6 avoid-break">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Sertifikalar</h2>
          {certificates.map(c => (
            <p key={c.id} className="text-[13px] text-slate-700">
              {c.name} — {c.issuer} <span className="text-slate-400">({c.date})</span>
            </p>
          ))}
        </section>
      )}

      {sections.projects && projects.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Projeler</h2>
          {projects.map(pr => (
            <div key={pr.id} className="mb-2 avoid-break">
              <h3 className="font-medium text-[13px]">{pr.name}</h3>
              {pr.description && <p className="text-[13px] text-slate-600">{pr.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
