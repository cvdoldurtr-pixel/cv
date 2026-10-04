// AI'dan gelen CV JSON'unu güvenli ve sınırlı hale getirir (ai-import.mjs). Saf fonksiyon: test edilebilir.
const s = (v, n = 200) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim().slice(0, n) : '');
const a = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const pick = (v, allowed, fallback = '') => (allowed.includes(v) ? v : fallback);

const LEVELS = ['Ana Dili', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
const DEGREES = ['Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'];
const MILITARY = ['Tamamlandı', 'Muaf', 'Tecilli', 'Yapılacak'];
const MARITAL = ['Bekar', 'Evli'];
const LICENSE = ['A1', 'A2', 'A', 'B', 'BE', 'C', 'CE', 'D', 'D1', 'E', 'F', 'G', 'SRC', 'Psikoteknik'];

export function sanitizeImported(o) {
  const x = o && typeof o === 'object' ? o : {};
  const p = x.personal && typeof x.personal === 'object' ? x.personal : {};
  const lic = a(p.drivingLicense, 14)
    .map((v) => s(v, 20))
    .map((v) => (/^src/i.test(v) ? 'SRC' : /psiko/i.test(v) ? 'Psikoteknik' : v.toUpperCase()))
    .filter((v) => LICENSE.includes(v));
  return {
    language: x.language === 'en' ? 'en' : 'tr',
    personal: {
      fullName: s(p.fullName, 80),
      title: s(p.title, 100),
      email: s(p.email, 120),
      phone: s(p.phone, 30),
      city: s(p.city, 60),
      birthDate: s(p.birthDate, 20),
      maritalStatus: pick(s(p.maritalStatus, 20), MARITAL),
      militaryStatus: pick(s(p.militaryStatus, 20), MILITARY),
      linkedin: s(p.linkedin, 160),
      portfolio: s(p.portfolio, 160),
      summary: s(p.summary, 1500),
      drivingLicense: Array.from(new Set(lic)),
      // İçe aktarılan doğum tarihi/medeni durum varsayılan olarak CV'de gizli kalsın
      showBirthDate: false,
      showMaritalStatus: false,
      showMilitaryStatus: true,
    },
    experiences: a(x.experiences, 12)
      .map((e) => ({
        company: s(e?.company, 120),
        position: s(e?.position, 120),
        startDate: s(e?.startDate, 20),
        endDate: e?.current ? '' : s(e?.endDate, 20),
        current: !!e?.current,
        description: s(e?.description, 600),
        achievements: a(e?.achievements, 10).map((b) => s(b, 300)).filter(Boolean),
      }))
      .filter((e) => e.company || e.position),
    educations: a(x.educations, 8)
      .map((e) => ({
        school: s(e?.school, 140),
        department: s(e?.department, 120),
        degree: pick(s(e?.degree, 30), DEGREES, 'Lisans'),
        startDate: s(e?.startDate, 20),
        endDate: s(e?.endDate, 20),
        gpa: s(e?.gpa, 20),
        description: '',
      }))
      .filter((e) => e.school),
    skills: Array.from(new Set(a(x.skills, 40).map((v) => s(typeof v === 'string' ? v : v?.name, 50)).filter(Boolean)))
      .map((name) => ({ name, level: 3, category: 'technical' })),
    languages: a(x.languages, 10)
      .map((l) => ({ name: s(l?.name, 40), level: pick(s(l?.level, 10), LEVELS, 'B1') }))
      .filter((l) => l.name),
    certificates: a(x.certificates, 20)
      .map((c) => ({ name: s(c?.name, 140), issuer: s(c?.issuer, 100), date: s(c?.date, 20) }))
      .filter((c) => c.name),
    projects: a(x.projects, 10)
      .map((p2) => ({ name: s(p2?.name, 120), description: s(p2?.description, 500), link: s(p2?.link, 160), technologies: s(p2?.technologies, 160) }))
      .filter((p2) => p2.name),
    references: a(x.references, 6)
      .map((r) => ({ name: s(r?.name, 80), title: s(r?.title, 120), phone: s(r?.phone, 30), email: s(r?.email, 120) }))
      .filter((r) => r.name),
  };
}
