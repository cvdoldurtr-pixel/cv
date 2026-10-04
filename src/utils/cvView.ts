/**
 * Şablonların ortak kullandığı metinler ve yardımcılar.
 * CV dili (Türkçe / English) burada belirlenir; tüm şablon başlıkları buradan gelir.
 */
import { CVData, SectionKey } from '../types/cv';

const TR = {
  summary: 'Profesyonel Özet',
  summaryShort: 'Özet',
  experience: 'İş Deneyimi',
  experienceShort: 'Deneyim',
  education: 'Eğitim',
  skills: 'Yetenekler',
  languages: 'Diller',
  skillsAndLanguages: 'Yetenekler & Diller',
  certificates: 'Sertifikalar',
  projects: 'Projeler',
  references: 'Referanslar',
  contact: 'İletişim',
  personalInfo: 'Kişisel',
  present: 'Devam',
  birth: 'Doğum',
  military: 'Askerlik',
  license: 'Ehliyet',
  work: 'Çalışma',
  namePlaceholder: 'Ad Soyad',
  positionPlaceholder: 'Pozisyon',
  gpa: 'Not ort.',
  onRequest: 'Referanslar istenildiğinde verilecektir.',
  coverPosition: 'Pozisyon',
  coverClosing: 'Saygılarımla,',
  coverPlaceholder: 'Ön yazı metnini Ön Yazı adımında yazın…',
  dateLocale: 'tr-TR',
};

const EN: typeof TR = {
  summary: 'Professional Summary',
  summaryShort: 'Summary',
  experience: 'Work Experience',
  experienceShort: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  skillsAndLanguages: 'Skills & Languages',
  certificates: 'Certifications',
  projects: 'Projects',
  references: 'References',
  contact: 'Contact',
  personalInfo: 'Personal',
  present: 'Present',
  birth: 'Date of birth',
  military: 'Military service',
  license: 'Driving licence',
  work: 'Work',
  namePlaceholder: 'Full Name',
  positionPlaceholder: 'Position',
  gpa: 'GPA',
  onRequest: 'References available upon request.',
  coverPosition: 'Position',
  coverClosing: 'Sincerely,',
  coverPlaceholder: 'Write your cover letter in the Cover Letter step…',
  dateLocale: 'en-GB',
};

export type Labels = typeof TR;
export const labelsFor = (d: Pick<CVData, 'language'>): Labels => (d.language === 'en' ? EN : TR);

/** Formda Türkçe seçilen değerlerin İngilizce CV'deki karşılıkları */
const VALUE_EN: Record<string, string> = {
  'Ana Dili': 'Native',
  'Ana dil': 'Native',
  Bekar: 'Single',
  Evli: 'Married',
  Tamamlandı: 'Completed',
  Muaf: 'Exempt',
  Tecilli: 'Postponed',
  Yapılacak: 'Not yet completed',
  Lise: 'High School',
  Önlisans: 'Associate Degree',
  Lisans: "Bachelor's Degree",
  'Yüksek Lisans': "Master's Degree",
  Doktora: 'PhD',
  Ofis: 'On-site',
  Hibrit: 'Hybrid',
  Uzaktan: 'Remote',
  'Ofis / Hibrit / Uzaktan': 'On-site / Hybrid / Remote',
  'Seyahat engeli yok': 'Available to travel',
  'Hemen başlayabilir': 'Available immediately',
  '2 hafta içinde başlayabilir': 'Available within 2 weeks',
  '1 ay içinde başlayabilir': 'Available within 1 month',
};
export const tv = (d: Pick<CVData, 'language'>, v: string): string =>
  d.language === 'en' ? VALUE_EN[v] || v : v;

export function dateRange(d: CVData, start: string, end: string, current?: boolean): string {
  const L = labelsFor(d);
  const e = current ? L.present : end;
  if (start && e) return `${start} – ${e}`;
  return start || e || '';
}

/** Ad-soyadın altında gösterilecek kişisel satır (gizlilik anahtarlarına uyar) */
export function personalLine(d: CVData): string[] {
  const p = d.personal;
  const L = labelsFor(d);
  const out: string[] = [];
  if (p.showBirthDate && p.birthDate.trim()) out.push(`${L.birth}: ${p.birthDate.trim()}`);
  if (p.showMaritalStatus && p.maritalStatus.trim()) out.push(tv(d, p.maritalStatus));
  if (p.showMilitaryStatus && p.militaryStatus.trim()) out.push(`${L.military}: ${tv(d, p.militaryStatus)}`);
  if (p.drivingLicense.length) out.push(`${L.license}: ${p.drivingLicense.join(', ')}`);
  if (p.workPreference.trim()) out.push(`${L.work}: ${tv(d, p.workPreference)}`);
  if (p.travel.trim()) out.push(tv(d, p.travel));
  if (p.availability.trim()) out.push(tv(d, p.availability));
  return out;
}

/** İletişim satırı: e-posta, telefon, şehir, LinkedIn, portfolyo */
export function contactLine(d: CVData): string[] {
  const p = d.personal;
  return [p.email, p.phone, p.city, p.linkedin, p.portfolio].map((x) => (x || '').trim()).filter(Boolean);
}

export function bodyOrder(d: CVData): SectionKey[] {
  return d.sectionOrder.filter((k) => k !== 'coverLetter');
}

export const hasReferences = (d: CVData) =>
  d.sections.references && (d.references.some((r) => r.name.trim()) || d.referencesOnRequest);

export const visibleRefs = (d: CVData) => d.references.filter((r) => r.name.trim());

/** Dosya adı: Ahmet-Yilmaz-Yazilim-Muhendisi-CV */
export function cvFileBase(d: CVData): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U' };
  const slug = (s: string) =>
    s
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => map[c] || c)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const name = slug(d.personal.fullName || '');
  const title = slug(d.personal.title || '').slice(0, 40);
  return [name, title, 'CV'].filter(Boolean).join('-') || 'CV';
}
