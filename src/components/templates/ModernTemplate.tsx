import { CVData, SectionKey } from '../../types/cv';
import { labelsFor, tv, dateRange, personalLine, contactLine, bodyOrder, hasReferences, visibleRefs } from '../../utils/cvView';
import { densityClasses } from '../../utils/density';

export default function ModernTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const L = labelsFor(data);
  const density = data.density || 'comfortable';
  const dens = densityClasses(density);
  const gap = dens.gap;
  const textSize = dens.text;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>{children}</h2>
  );

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <H>{L.summary}</H>
            <p className={`text-slate-700 ${textSize} leading-relaxed whitespace-pre-line`}>{personal.summary}</p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={gap}>
            <H>{L.experience}</H>
            <div className={density === 'tight' ? 'space-y-2' : 'space-y-4'}>
              {experiences.map((exp) => (
                <div key={exp.id} className="avoid-break">
                  <div className="flex justify-between items-baseline gap-3">
                    <h3 className="font-semibold text-slate-900">{exp.position || L.positionPlaceholder}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{exp.company}</p>
                  {exp.description && <p className={`${textSize} text-slate-600 mt-1`}>{exp.description}</p>}
                  {exp.achievements.filter((a) => a.trim()).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {exp.achievements.filter((a) => a.trim()).map((a, i) => (
                        <li key={i} className={`${textSize} text-slate-700 flex gap-2`}>
                          <span style={{ color }}>•</span>
                          <span>{a}</span>
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
            <H>{L.education}</H>
            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="avoid-break">
                  <div className="flex justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{edu.school}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, edu.startDate, edu.endDate)}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {[tv(data, edu.degree), edu.department, edu.gpa && `${L.gpa}: ${edu.gpa}`].filter(Boolean).join(' • ')}
                  </p>
                  {edu.description && <p className={`${textSize} text-slate-600`}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      case 'skills':
        if (!sections.skills || skills.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <H>{L.skills}</H>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter((s) => s.name.trim()).map((s) => (
                <span key={s.id} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{s.name}</span>
              ))}
            </div>
          </section>
        );
      case 'languages':
        if (!sections.languages || languages.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <H>{L.languages}</H>
            <div className="space-y-1">
              {languages.map((l) => (
                <div key={l.id} className={`flex justify-between ${textSize}`}>
                  <span>{l.name}</span>
                  <span className="text-slate-500">{tv(data, l.level)}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <H>{L.certificates}</H>
            <div className="space-y-1">
              {certificates.map((c) => (
                <div key={c.id} className={`flex justify-between gap-3 ${textSize}`}>
                  <span>{c.name}{c.issuer && ` — ${c.issuer}`}</span>
                  <span className="text-slate-500 whitespace-nowrap">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 'projects':
        if (!sections.projects || projects.length === 0) return null;
        return (
          <section key={key} className={gap}>
            <H>{L.projects}</H>
            <div className="space-y-2">
              {projects.map((pr) => (
                <div key={pr.id} className="avoid-break">
                  <h3 className={`font-semibold text-slate-900 ${textSize}`}>
                    {pr.name}{pr.link && <span className="font-normal text-slate-500"> · {pr.link}</span>}
                  </h3>
                  {pr.description && <p className={`${textSize} text-slate-600`}>{pr.description}</p>}
                  {pr.technologies && <p className="text-xs text-slate-500 mt-0.5">{pr.technologies}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      case 'references':
        if (!hasReferences(data)) return null;
        return (
          <section key={key} className={`${gap} avoid-break`}>
            <H>{L.references}</H>
            {visibleRefs(data).length > 0 ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {visibleRefs(data).map((r) => (
                  <div key={r.id} className={textSize}>
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    {r.title && <p className="text-slate-600">{r.title}</p>}
                    <p className="text-xs text-slate-500">{[r.phone, r.email].filter(Boolean).join(' · ')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${textSize} text-slate-600`}>{L.onRequest}</p>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  const contact = contactLine(data);
  const extra = personalLine(data);

  return (
    <div className={`${dens.pad} text-sm leading-relaxed`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className={`flex gap-6 items-start border-b-2 pb-5 ${gap}`} style={{ borderColor: color }}>
        {personal.photo && (
          <img src={personal.photo} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{personal.fullName || L.namePlaceholder}</h1>
          {personal.title && <p className="text-base font-medium mt-0.5" style={{ color }}>{personal.title}</p>}
          {contact.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
              {contact.map((c) => <span key={c} className="break-all">{c}</span>)}
            </div>
          )}
          {extra.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
              {extra.map((c) => <span key={c}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {bodyOrder(data).map((key) => renderSection(key))}
    </div>
  );
}
