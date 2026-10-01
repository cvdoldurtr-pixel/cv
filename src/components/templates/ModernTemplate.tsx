import { CVData, SectionKey, defaultSectionOrder } from '../../types/cv';

export default function ModernTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const density = data.density || 'comfortable';
  const pad = density === 'tight' ? 'p-5' : density === 'compact' ? 'p-6' : 'p-8';
  const gap = density === 'tight' ? 'mb-3' : density === 'compact' ? 'mb-4' : 'mb-5';
  const textSize = density === 'tight' ? 'text-[12px]' : 'text-[13px]';
  const order = (data.sectionOrder?.length ? data.sectionOrder : defaultSectionOrder).filter(
    (k) => k !== 'coverLetter'
  ) as SectionKey[];

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Profesyonel Özet
            </h2>
            <p className={`text-slate-700 ${textSize} leading-relaxed`}>{personal.summary}</p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={gap}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              İş Deneyimi
            </h2>
            <div className={density === 'tight' ? 'space-y-2' : 'space-y-4'}>
              {experiences.map((exp) => (
                <div key={exp.id} className="avoid-break">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-slate-900">{exp.position || 'Pozisyon'}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {exp.startDate} – {exp.current ? 'Devam' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{exp.company}</p>
                  {exp.description && <p className={`${textSize} text-slate-600 mt-1`}>{exp.description}</p>}
                  {exp.achievements.filter(Boolean).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {exp.achievements.filter(Boolean).map((a, i) => (
                        <li key={i} className={`${textSize} text-slate-700 flex gap-2`}>
                          <span style={{ color }}>•</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      case 'education':
        if (!sections.education || educations.length === 0) return null;
        return (
          <section key={key} className={gap}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Eğitim
            </h2>
            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="avoid-break">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-slate-900">{edu.school}</h3>
                    <span className="text-xs text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {edu.degree} {edu.department && `• ${edu.department}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'skills':
        if (!sections.skills || skills.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Yetenekler
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        );
      case 'languages':
        if (!sections.languages || languages.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Diller
            </h2>
            <div className="space-y-1">
              {languages.map((l) => (
                <div key={l.id} className={`flex justify-between ${textSize}`}>
                  <span>{l.name}</span>
                  <span className="text-slate-500">{l.level}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Sertifikalar
            </h2>
            <div className="space-y-1">
              {certificates.map((c) => (
                <div key={c.id} className={`flex justify-between ${textSize}`}>
                  <span>{c.name} {c.issuer && `— ${c.issuer}`}</span>
                  <span className="text-slate-500">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 'projects':
        if (!sections.projects || projects.length === 0) return null;
        return (
          <section key={key} className={gap}>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>
              Projeler
            </h2>
            <div className="space-y-2">
              {projects.map((pr) => (
                <div key={pr.id} className="avoid-break">
                  <h3 className={`font-semibold text-slate-900 ${textSize}`}>{pr.name}</h3>
                  {pr.description && <p className={`${textSize} text-slate-600`}>{pr.description}</p>}
                  {pr.technologies && <p className="text-xs text-slate-500 mt-0.5">{pr.technologies}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${pad} text-sm leading-relaxed`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className={`flex gap-6 items-start border-b-2 pb-5 ${gap}`} style={{ borderColor: color }}>
        {personal.photo && (
          <img
            src={personal.photo}
            alt=""
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {personal.fullName || 'Ad Soyad'}
          </h1>
          {personal.title && (
            <p className="text-base font-medium mt-0.5" style={{ color }}>{personal.title}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.city && <span>{personal.city}</span>}
            {personal.linkedin && <span className="truncate max-w-[180px]">{personal.linkedin}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
            {personal.birthDate && <span>Doğum: {personal.birthDate}</span>}
            {personal.maritalStatus && <span>{personal.maritalStatus}</span>}
            {personal.militaryStatus && <span>Askerlik: {personal.militaryStatus}</span>}
          </div>
        </div>
      </div>

      {order.map((key) => renderSection(key))}
    </div>
  );
}
