import { CVData, SectionKey } from '../../types/cv';
import { densityClasses } from '../../utils/density';
import { labelsFor, tv, dateRange, personalLine, contactLine, bodyOrder, hasReferences, visibleRefs } from '../../utils/cvView';

export default function ClassicTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');
  const L = labelsFor(data);
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-sm font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color, borderColor: color }}>{children}</h2>
  );

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.summaryShort}</H>
            <p className={`text-slate-700 leading-relaxed ${dens.text} whitespace-pre-line`}>{personal.summary}</p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.experienceShort}</H>
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-3 avoid-break">
                <div className="flex justify-between gap-3">
                  <strong className="text-slate-900">{exp.position}</strong>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <p className="italic text-slate-600">{exp.company}</p>
                {exp.description && <p className={`${dens.text} mt-1 text-slate-700`}>{exp.description}</p>}
                <ul className={`mt-1 ml-4 list-disc ${dens.text} text-slate-700`}>
                  {exp.achievements.filter((a) => a.trim()).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
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
              <div key={edu.id} className="mb-2 avoid-break">
                <div className="flex justify-between gap-3">
                  <strong>{edu.school}</strong>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, edu.startDate, edu.endDate)}</span>
                </div>
                <p className="text-slate-600">{[tv(data, edu.degree), edu.department, edu.gpa && `${L.gpa}: ${edu.gpa}`].filter(Boolean).join(' • ')}</p>
              </div>
            ))}
          </section>
        );
      case 'skills':
        if (!sections.skills || skills.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.skills}</H>
            <p className={`${dens.text} text-slate-700`}>{skills.map((s) => s.name).filter(Boolean).join(' • ')}</p>
          </section>
        );
      case 'languages':
        if (!sections.languages || languages.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.languages}</H>
            <p className={`${dens.text} text-slate-700`}>{languages.map((l) => `${l.name} (${tv(data, l.level)})`).join(' • ')}</p>
          </section>
        );
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.certificates}</H>
            {certificates.map((c) => (
              <div key={c.id} className={`${dens.text} flex justify-between gap-3`}>
                <span>{c.name}{c.issuer && ` — ${c.issuer}`}</span>
                <span className="text-slate-500 whitespace-nowrap">{c.date}</span>
              </div>
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
                <strong className={dens.text}>{pr.name}</strong>
                {pr.link && <span className="text-xs text-slate-500"> · {pr.link}</span>}
                {pr.description && <p className={`${dens.text} text-slate-600`}>{pr.description}</p>}
                {pr.technologies && <p className="text-xs text-slate-500">{pr.technologies}</p>}
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
                  <strong>{r.name}</strong>{r.title && `, ${r.title}`}
                  {(r.phone || r.email) && <span className="text-slate-500"> — {[r.phone, r.email].filter(Boolean).join(' · ')}</span>}
                </p>
              ))
            ) : (
              <p className={`${dens.text} text-slate-700`}>{L.onRequest}</p>
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
    <div className={`${dens.pad} text-sm`} style={{ fontFamily: 'Georgia, serif' }}>
      <div className={`text-center border-b pb-4 ${dens.gap}`} style={{ borderColor: color }}>
        {personal.photo && (
          <img src={personal.photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" style={{ borderColor: color }} />
        )}
        <h1 className="text-3xl font-bold text-slate-900 tracking-wide uppercase">{personal.fullName || L.namePlaceholder}</h1>
        {personal.title && <p className="text-base mt-1 italic" style={{ color }}>{personal.title}</p>}
        {contact.length > 0 && (
          <p className="mt-3 text-xs text-slate-600 break-words">{contact.join('  •  ')}</p>
        )}
        {extra.length > 0 && <p className="text-xs text-slate-500 mt-1">{extra.join('  |  ')}</p>}
      </div>

      {bodyOrder(data).map((key) => renderSection(key))}
    </div>
  );
}
