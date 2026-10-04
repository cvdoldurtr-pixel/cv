import { CVData, SectionKey } from '../../types/cv';
import { densityClasses } from '../../utils/density';
import { labelsFor, tv, personalLine, contactLine, bodyOrder, hasReferences, visibleRefs } from '../../utils/cvView';

export default function MinimalTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');
  const L = labelsFor(data);
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">{children}</h2>
  );
  const end = (cur: boolean, e: string) => (cur ? L.present : e);
  let skillsLangDone = false;

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <p className={`text-slate-700 ${dens.text} leading-relaxed border-l-2 pl-4 whitespace-pre-line`} style={{ borderColor: color }}>
              {personal.summary}
            </p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.experienceShort}</H>
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-4 grid grid-cols-[100px_1fr] gap-4 avoid-break">
                <div className="text-xs text-slate-400 pt-0.5">
                  {exp.startDate}<br />{end(exp.current, exp.endDate)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{exp.position}</h3>
                  <p className="text-sm text-slate-500">{exp.company}</p>
                  {exp.description && <p className={`${dens.text} text-slate-600 mt-1`}>{exp.description}</p>}
                  <ul className="mt-1 space-y-0.5">
                    {exp.achievements.filter((a) => a.trim()).map((a, i) => (
                      <li key={i} className={`${dens.text} text-slate-700`}>– {a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        );
      case 'education':
        if (!sections.education || educations.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.education}</H>
            {educations.map((edu) => (
              <div key={edu.id} className="mb-3 grid grid-cols-[100px_1fr] gap-4 avoid-break">
                <div className="text-xs text-slate-400">{[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}</div>
                <div>
                  <h3 className="font-medium">{edu.school}</h3>
                  <p className="text-sm text-slate-500">{[tv(data, edu.degree), edu.department, edu.gpa && `${L.gpa}: ${edu.gpa}`].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            ))}
          </section>
        );
      case 'skills':
      case 'languages': {
        // Minimal şablonda yetenek ve diller tek blokta gösterilir (sıradaki ilk konumda)
        if (skillsLangDone) return null;
        const showS = sections.skills && skills.length > 0;
        const showL = sections.languages && languages.length > 0;
        if (!showS && !showL) return null;
        skillsLangDone = true;
        return (
          <section key="skills-languages" className={`${dens.gap} avoid-break`}>
            <H>{showS && showL ? L.skillsAndLanguages : showS ? L.skills : L.languages}</H>
            {showS && <p className={`${dens.text} text-slate-700 mb-2`}>{skills.map((s) => s.name).filter(Boolean).join('  ·  ')}</p>}
            {showL && <p className={`${dens.text} text-slate-600`}>{languages.map((l) => `${l.name} (${tv(data, l.level)})`).join('  ·  ')}</p>}
          </section>
        );
      }
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.certificates}</H>
            {certificates.map((c) => (
              <p key={c.id} className={`${dens.text} text-slate-700`}>
                {c.name}{c.issuer && ` — ${c.issuer}`} {c.date && <span className="text-slate-400">({c.date})</span>}
              </p>
            ))}
          </section>
        );
      case 'projects':
        if (!sections.projects || projects.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.projects}</H>
            {projects.map((pr) => (
              <div key={pr.id} className="mb-2 avoid-break">
                <h3 className={`font-medium ${dens.text}`}>{pr.name}{pr.link && <span className="text-slate-400 font-normal"> · {pr.link}</span>}</h3>
                {pr.description && <p className={`${dens.text} text-slate-600`}>{pr.description}</p>}
              </div>
            ))}
          </section>
        );
      case 'references':
        if (!hasReferences(data)) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.references}</H>
            {visibleRefs(data).length > 0 ? (
              visibleRefs(data).map((r) => (
                <p key={r.id} className={`${dens.text} text-slate-700`}>
                  {r.name}{r.title && `, ${r.title}`}
                  <span className="text-slate-400"> {[r.phone, r.email].filter(Boolean).join(' · ')}</span>
                </p>
              ))
            ) : (
              <p className={`${dens.text} text-slate-600`}>{L.onRequest}</p>
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
    <div className={`${dens.pad} text-sm leading-relaxed`} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="mb-8 flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-light tracking-tight text-slate-900">{personal.fullName || L.namePlaceholder}</h1>
          {personal.title && <p className="text-lg mt-1 font-light" style={{ color }}>{personal.title}</p>}
          {contact.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
              {contact.map((c) => <span key={c} className="break-all">{c}</span>)}
            </div>
          )}
          {extra.length > 0 && <p className="mt-1 text-xs text-slate-400">{extra.join('  ·  ')}</p>}
        </div>
        {personal.photo && <img src={personal.photo} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />}
      </div>

      {bodyOrder(data).map((key) => renderSection(key))}
    </div>
  );
}
