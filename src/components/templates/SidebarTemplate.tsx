import { CVData } from '../../types/cv';
import { densityClasses } from '../../utils/density';

export default function SidebarTemplate({ data }: { data: CVData }) {
  const { personal, experiences, educations, skills, languages, certificates, projects, color, sections } = data;
  const dens = densityClasses(data.density || 'comfortable');
  const sidePad = data.density === 'tight' ? 'p-4' : data.density === 'compact' ? 'p-5' : 'p-6';

  return (
    <div className="flex min-h-[297mm] text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className={`w-[35%] text-white ${sidePad}`} style={{ backgroundColor: color }}>
        {personal.photo && (
          <img
            src={personal.photo}
            alt=""
            className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30"
          />
        )}
        <h1 className="text-xl font-bold text-center leading-tight">
          {personal.fullName || 'Ad Soyad'}
        </h1>
        {personal.title && (
          <p className="text-center text-sm opacity-90 mt-1">{personal.title}</p>
        )}

        <div className="mt-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">İletişim</h3>
            <div className="space-y-1.5 opacity-95">
              {personal.email && <p className="break-all">{personal.email}</p>}
              {personal.phone && <p>{personal.phone}</p>}
              {personal.city && <p>{personal.city}</p>}
              {personal.linkedin && <p className="break-all">{personal.linkedin}</p>}
            </div>
          </div>

          {(personal.birthDate || personal.militaryStatus || personal.maritalStatus) && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">Kişisel</h3>
              <div className="space-y-1 opacity-95">
                {personal.birthDate && <p>Doğum: {personal.birthDate}</p>}
                {personal.maritalStatus && <p>{personal.maritalStatus}</p>}
                {personal.militaryStatus && <p>Askerlik: {personal.militaryStatus}</p>}
              </div>
            </div>
          )}

          {sections.skills && skills.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">Yetenekler</h3>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between mb-0.5">
                      <span>{s.name}</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${s.level * 20}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.languages && languages.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-2 opacity-80">Diller</h3>
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between opacity-95">
                  <span>{l.name}</span>
                  <span>{l.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className={`flex-1 ${sidePad} bg-white`}>
        {sections.summary && personal.summary && (
          <section className="mb-5 avoid-break">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color, borderColor: color }}>
              Profesyonel Özet
            </h2>
            <p className="text-[13px] text-slate-700 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {sections.experience && experiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>
              İş Deneyimi
            </h2>
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-4 avoid-break">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                  <span className="text-xs text-slate-500">{exp.startDate} – {exp.current ? 'Devam' : exp.endDate}</span>
                </div>
                <p className="text-sm font-medium" style={{ color }}>{exp.company}</p>
                {exp.description && <p className="text-[13px] text-slate-600 mt-1">{exp.description}</p>}
                <ul className="mt-1 space-y-0.5">
                  {exp.achievements.filter(Boolean).map((a, i) => (
                    <li key={i} className="text-[13px] text-slate-700 flex gap-1.5">
                      <span style={{ color }}>▸</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {sections.education && educations.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>
              Eğitim
            </h2>
            {educations.map((edu) => (
              <div key={edu.id} className="mb-3 avoid-break">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <span className="text-xs text-slate-500">{edu.startDate} – {edu.endDate}</span>
                </div>
                <p className="text-sm text-slate-600">{edu.degree} {edu.department && `• ${edu.department}`}</p>
                {edu.gpa && <p className="text-xs text-slate-500">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </section>
        )}

        {sections.certificates && certificates.length > 0 && (
          <section className="mb-5 avoid-break">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color, borderColor: color }}>
              Sertifikalar
            </h2>
            {certificates.map((c) => (
              <div key={c.id} className="flex justify-between text-[13px] mb-1">
                <span>{c.name} — {c.issuer}</span>
                <span className="text-slate-500">{c.date}</span>
              </div>
            ))}
          </section>
        )}

        {sections.projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color, borderColor: color }}>
              Projeler
            </h2>
            {projects.map((pr) => (
              <div key={pr.id} className="mb-2 avoid-break">
                <h3 className="font-semibold text-[13px]">{pr.name}</h3>
                {pr.description && <p className="text-[13px] text-slate-600">{pr.description}</p>}
                {pr.technologies && <p className="text-xs text-slate-500">{pr.technologies}</p>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
