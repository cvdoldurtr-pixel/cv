import {
  CVData,
  SectionKey,
  defaultCVData,
  defaultSections,
  defaultSectionOrder,
  normalizeLanguageLevel,
} from '../types/cv';

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const id = (v: unknown): string => (typeof v === 'string' && v ? v : crypto.randomUUID());

/**
 * Eski sürüm kayıtlarını, profilleri, JSON yedekleri ve içe aktarılan CV'leri
 * güncel veri yapısına getirir. Eksik alanları doldurur, bozuk alanları temizler.
 */
export function migrateData(input: unknown): CVData {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<CVData> & Record<string, unknown>;
  const rp = (raw.personal && typeof raw.personal === 'object' ? raw.personal : {}) as Partial<CVData['personal']>;

  // v9 öncesi kayıtlarda göster/gizle anahtarı yoktu ve dolu alanlar CV'de görünüyordu.
  // Kullanıcının CV'si sessizce değişmesin diye: alan doluysa ve anahtar yoksa görünür kalır.
  const personal: CVData['personal'] = {
    ...defaultCVData.personal,
    ...rp,
    drivingLicense: arr<string>(rp.drivingLicense).filter((x) => typeof x === 'string'),
    workPreference: str(rp.workPreference),
    travel: str(rp.travel),
    availability: str(rp.availability),
    showBirthDate: typeof rp.showBirthDate === 'boolean' ? rp.showBirthDate : !!str(rp.birthDate).trim(),
    showMaritalStatus: typeof rp.showMaritalStatus === 'boolean' ? rp.showMaritalStatus : !!str(rp.maritalStatus).trim(),
    showMilitaryStatus: typeof rp.showMilitaryStatus === 'boolean' ? rp.showMilitaryStatus : true,
  };

  const validKeys = new Set<SectionKey>([...defaultSectionOrder, 'coverLetter']);
  let order = arr<SectionKey>(raw.sectionOrder).filter((k) => validKeys.has(k) && k !== 'coverLetter');
  order = Array.from(new Set(order));
  if (!order.length) order = [...defaultSectionOrder];
  for (const k of defaultSectionOrder) if (!order.includes(k)) order.push(k);

  const density = raw.density === 'compact' || raw.density === 'tight' ? raw.density : 'comfortable';

  return {
    ...defaultCVData,
    ...raw,
    personal,
    coverLetter: { ...defaultCVData.coverLetter, ...(raw.coverLetter || {}) },
    sections: { ...defaultSections, ...(raw.sections || {}) },
    sectionOrder: order,
    jobDescription: str(raw.jobDescription),
    density,
    language: raw.language === 'en' ? 'en' : 'tr',
    template: str(raw.template) || defaultCVData.template,
    color: str(raw.color) || defaultCVData.color,
    experiences: arr<CVData['experiences'][number]>(raw.experiences).map((e) => ({
      ...e,
      id: id(e?.id),
      company: str(e?.company),
      position: str(e?.position),
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
      current: !!e?.current,
      description: str(e?.description),
      achievements: arr<string>(e?.achievements).map(str),
    })),
    educations: arr<CVData['educations'][number]>(raw.educations).map((e) => ({
      ...e,
      id: id(e?.id),
      school: str(e?.school),
      department: str(e?.department),
      degree: str(e?.degree) || 'Lisans',
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
      gpa: str(e?.gpa),
      description: str(e?.description),
    })),
    skills: arr<CVData['skills'][number]>(raw.skills).map((s) => ({
      id: id(s?.id),
      name: str(s?.name),
      level: Number.isFinite(s?.level) ? Math.min(5, Math.max(1, Number(s.level))) : 3,
      category: s?.category === 'soft' ? 'soft' : 'technical',
    })),
    languages: arr<CVData['languages'][number]>(raw.languages).map((l) => ({
      id: id(l?.id),
      name: str(l?.name),
      level: normalizeLanguageLevel(str(l?.level) || 'B2'),
    })),
    certificates: arr<CVData['certificates'][number]>(raw.certificates).map((c) => ({
      id: id(c?.id),
      name: str(c?.name),
      issuer: str(c?.issuer),
      date: str(c?.date),
    })),
    projects: arr<CVData['projects'][number]>(raw.projects).map((p) => ({
      id: id(p?.id),
      name: str(p?.name),
      description: str(p?.description),
      link: str(p?.link),
      technologies: str(p?.technologies),
    })),
    references: arr<CVData['references'][number]>(raw.references).map((r) => ({
      id: id(r?.id),
      name: str(r?.name),
      title: str(r?.title),
      phone: str(r?.phone),
      email: str(r?.email),
    })),
    referencesOnRequest: !!raw.referencesOnRequest,
  };
}
