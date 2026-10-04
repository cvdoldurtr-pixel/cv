import { CVData, SectionKey } from '../../types/cv';
import { densityClasses } from '../../utils/density';
import { labelsFor, tv, dateRange, personalLine, contactLine, bodyOrder, hasReferences, visibleRefs } from '../../utils/cvView';

/**
 * ATS Sade: robotların en kolay okuduğu düzen.
 * Tek sütun, standart başlıklar, tablo/ikon/çubuk yok, tarih sağda düz metin,
 * yetenekler virgülle ayrılmış metin. Renk yalnızca ince çizgide kullanılır.
 */
export default function AtsTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');
  const L = labelsFor(data);
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-900 border-b mb-1.5 pb-0.5" style={{ borderColor: color }}>{children}</h2>
  );
  const T = dens.text;

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!sections.summary || !personal.summary) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.summary}</H>
            <p className={`${T} text-slate-800 whitespace-pre-line`}>{personal.summary}</p>
          </section>
        );
      case 'experience':
        if (!sections.experience || experiences.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.experience}</H>
            {experiences.map((e) => (
              <div key={e.id} className="mb-2.5 avoid-break">
                <p className={`${T} text-slate-900`}>
                  <strong>{e.position}</strong>{e.company && <>, {e.company}</>}
                  <span className="float-right text-slate-700">{dateRange(data, e.startDate, e.endDate, e.current)}</span>
                </p>
                {e.description && <p className={`${T} text-slate-800`}>{e.description}</p>}
                <ul className={`${T} text-slate-800 list-disc ml-5`}>
                  {e.achievements.filter((a) => a.trim()).map((a, i) => <li key={i}>{a}</li>)}
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
            {educations.map((e) => (
              <p key={e.id} className={`${T} text-slate-800 mb-1 avoid-break`}>
                <strong>{e.school}</strong>{[tv(data, e.degree), e.department].filter(Boolean).length > 0 && <>, {[tv(data, e.degree), e.department].filter(Boolean).join(', ')}</>}
                {e.gpa && <>, {L.gpa}: {e.gpa}</>}
                <span className="float-right text-slate-700">{dateRange(data, e.startDate, e.endDate)}</span>
              </p>
            ))}
          </section>
        );
      case 'skills':
        if (!sections.skills || skills.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.skills}</H>
            <p className={`${T} text-slate-800`}>{skills.map((s) => s.name).filter(Boolean).join(', ')}</p>
          </section>
        );
      case 'languages':
        if (!sections.languages || languages.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.languages}</H>
            <p className={`${T} text-slate-800`}>{languages.map((l) => `${l.name} (${tv(data, l.level)})`).join(', ')}</p>
          </section>
        );
      case 'certificates':
        if (!sections.certificates || certificates.length === 0) return null;
        return (
          <section key={key} className={`${dens.gap} avoid-break`}>
            <H>{L.certificates}</H>
            {certificates.map((c) => (
              <p key={c.id} className={`${T} text-slate-800`}>
                {c.name}{c.issuer && `, ${c.issuer}`}{c.date && <span className="float-right text-slate-700">{c.date}</span>}
              </p>
            ))}
          </section>
        );
      case 'projects':
        if (!sections.projects || projects.length === 0) return null;
        return (
          <section key={key} className={dens.gap}>
            <H>{L.projects}</H>
            {projects.map((p) => (
              <div key={p.id} className="mb-1.5 avoid-break">
                <p className={`${T} text-slate-900`}><strong>{p.name}</strong>{p.link && <> — {p.link}</>}</p>
                {p.description && <p className={`${T} text-slate-800`}>{p.description}</p>}
                {p.technologies && <p className={`${T} text-slate-700`}>{p.technologies}</p>}
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
                <p key={r.id} className={`${T} text-slate-800`}>
                  {r.name}{r.title && `, ${r.title}`}{(r.phone || r.email) && ` — ${[r.phone, r.email].filter(Boolean).join(', ')}`}
                </p>
              ))
            ) : (
              <p className={`${T} text-slate-800`}>{L.onRequest}</p>
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
    <div className={`${dens.pad} text-sm leading-snug`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className={`${dens.gap} flex items-start gap-4`}>
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-bold text-slate-900">{personal.fullName || L.namePlaceholder}</h1>
          {personal.title && <p className="text-[14px] text-slate-800">{personal.title}</p>}
          {contact.length > 0 && <p className="text-[12px] text-slate-800 mt-1 break-words">{contact.join(' | ')}</p>}
          {extra.length > 0 && <p className="text-[12px] text-slate-700">{extra.join(' | ')}</p>}
        </div>
        {personal.photo && <img src={personal.photo} alt="" className="w-20 h-24 object-cover flex-shrink-0" />}
      </div>
      {bodyOrder(data).map((k) => renderSection(k))}
    </div>
  );
}
