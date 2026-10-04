import { CVData, SectionKey } from '../../types/cv';
import { densityClasses } from '../../utils/density';
import { labelsFor, tv, dateRange, personalLine, contactLine, bodyOrder, hasReferences, visibleRefs } from '../../utils/cvView';

/** İki sütunlu, fotoğraflı tasarım. Yan sütun: iletişim, kişisel, yetenek, dil. Ana sütun: bölüm sırasına uyar. */
export default function SidebarTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');
  const L = labelsFor(data);
  const sidePad = data.density === 'tight' ? 'p-4' : data.density === 'compact' ? 'p-5' : 'p-6';
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color, borderColor: color }}>{children}</h2>
  );
  const contact = contactLine(data);
  const extra = personalLine(data);

  const main = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.summary}</H>
            <p className={`${dens.text} text-slate-700 leading-relaxed whitespace-pre-line`}>{personal.summary}</p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.experience}</H>
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-3 avoid-break">
                <div className="flex justify-between items-baseline gap-3">
                  <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <p className="text-sm font-medium" style={{ color }}>{exp.company}</p>
                {exp.description && <p className={`${dens.text} text-slate-600 mt-1`}>{exp.description}</p>}
                <ul className="mt-1 space-y-0.5">
                  {exp.achievements.filter((a) => a.trim()).map((a, i) => (
                    <li key={i} className={`${dens.text} text-slate-700 flex gap-1.5`}>
                      <span style={{ color }}>▸</span> <span>{a}</span>
                    </li>
                  ))}
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
                  <h3 className="font-semibold">{edu.school}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{dateRange(data, edu.startDate, edu.endDate)}</span>
                </div>
                <p className="text-sm text-slate-600">{[tv(data, edu.degree), edu.department].filter(Boolean).join(' • ')}</p>
                {edu.gpa && <p className="text-xs text-slate-500">{L.gpa}: {edu.gpa}</p>}
              </div>
            ))}
          </section>
        );
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.certificates}</H>
            {certificates.map((c) => (
              <div key={c.id} className={`flex justify-between gap-3 ${dens.text} mb-1`}>
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
                <h3 className={`font-semibold ${dens.text}`}>{pr.name}{pr.link && <span className="font-normal text-slate-500"> · {pr.link}</span>}</h3>
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {visibleRefs(data).map((r) => (
                  <div key={r.id} className={dens.text}>
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    {r.title && <p className="text-slate-600">{r.title}</p>}
                    <p className="text-xs text-slate-500">{[r.phone, r.email].filter(Boolean).join(' · ')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${dens.text} text-slate-600`}>{L.onRequest}</p>
            )}
          </section>
        );
      default:
        return null; // yetenek ve diller yan sütunda
    }
  };

  return (
    <div className="flex min-h-[297mm] text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className={`w-[35%] text-white ${sidePad}`} style={{ backgroundColor: color }}>
        {personal.photo && (
          <img src={personal.photo} alt="" className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30" />
        )}
        <h1 className="text-xl font-bold text-center leading-tight">{personal.fullName || L.namePlaceholder}</h1>
        {personal.title && <p className="text-center text-sm opacity-90 mt-1">{personal.title}</p>}

        <div className="mt-6 space-y-4 text-xs">
          {contact.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">{L.contact}</h3>
              <div className="space-y-1.5 opacity-95">
                {contact.map((c) => <p key={c} className="break-all">{c}</p>)}
              </div>
            </div>
          )}

          {extra.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">{L.personalInfo}</h3>
              <div className="space-y-1 opacity-95">
                {extra.map((c) => <p key={c}>{c}</p>)}
              </div>
            </div>
          )}

          {sections.skills && skills.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">{L.skills}</h3>
              <div className="space-y-1.5">
                {skills.filter((s) => s.name.trim()).map((s) => (
                  <div key={s.id}>
                    <div className="mb-0.5">{s.name}</div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${s.level * 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.languages && languages.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">{L.languages}</h3>
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between gap-2 opacity-95">
                  <span>{l.name}</span>
                  <span>{tv(data, l.level)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 ${sidePad} bg-white min-w-0`}>
        {bodyOrder(data).map((key) => main(key))}
      </div>
    </div>
  );
}
