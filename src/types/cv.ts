export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  birthDate: string;
  maritalStatus: string;
  militaryStatus: string;
  linkedin: string;
  portfolio: string;
  photo: string | null;
  summary: string;
  /** Sürücü belgesi sınıfları, ör. ['B', 'SRC'] (v9) */
  drivingLicense: string[];
  /** Ofis / Hibrit / Uzaktan (v9) */
  workPreference: string;
  /** Seyahat engeli yok vb. (v9) */
  travel: string;
  /** Hemen başlayabilir, 1 ay ihbar vb. (v9) */
  availability: string;
  /** CV'de gösterilsin mi? Modern CV'lerde varsayılan kapalı (v9) */
  showBirthDate: boolean;
  showMaritalStatus: boolean;
  showMilitaryStatus: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  school: string;
  department: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: 'technical' | 'soft';
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string;
}

export interface Reference {
  id: string;
  name: string;
  /** Unvan ve kurum, ör. "Satış Müdürü, ABC A.Ş." */
  title: string;
  phone: string;
  email: string;
}

export interface CoverLetter {
  recipient: string;
  company: string;
  position: string;
  content: string;
}

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certificates'
  | 'projects'
  | 'references'
  | 'coverLetter';

export interface SectionVisibility {
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  languages: boolean;
  certificates: boolean;
  projects: boolean;
  references: boolean;
  coverLetter: boolean;
}

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  certificates: Certificate[];
  projects: Project[];
  references: Reference[];
  /** "Referanslar istenildiğinde verilecektir" satırını göster (v9) */
  referencesOnRequest: boolean;
  coverLetter: CoverLetter;
  template: string;
  color: string;
  language: 'tr' | 'en';
  sections: SectionVisibility;
  /** Display order of body sections (v3) */
  sectionOrder: SectionKey[];
  /** Pasted job description for match analysis (v3) */
  jobDescription: string;
  /** Content density for one-page fit: comfortable | compact | tight */
  density: 'comfortable' | 'compact' | 'tight';
}

export interface SavedProfile {
  id: string;
  name: string;
  savedAt: string;
  data: CVData;
}

export const defaultSections: SectionVisibility = {
  summary: true,
  experience: true,
  education: true,
  skills: true,
  languages: true,
  certificates: true,
  projects: true,
  references: true,
  coverLetter: true,
};

export const defaultSectionOrder: SectionKey[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'certificates',
  'projects',
  'references',
];

export const defaultCVData: CVData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    city: 'İstanbul',
    birthDate: '',
    maritalStatus: '',
    militaryStatus: '',
    linkedin: '',
    portfolio: '',
    photo: null,
    summary: '',
    drivingLicense: [],
    workPreference: '',
    travel: '',
    availability: '',
    showBirthDate: false,
    showMaritalStatus: false,
    showMilitaryStatus: true,
  },
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
  references: [],
  referencesOnRequest: false,
  coverLetter: {
    recipient: '',
    company: '',
    position: '',
    content: '',
  },
  template: 'modern',
  color: '#0d9488',
  language: 'tr',
  sections: { ...defaultSections },
  sectionOrder: [...defaultSectionOrder],
  jobDescription: '',
  density: 'comfortable',
};

export const emptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  achievements: [''],
});

export const emptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  school: '',
  department: '',
  degree: 'Lisans',
  startDate: '',
  endDate: '',
  gpa: '',
  description: '',
});

export const emptySkill = (): Skill => ({
  id: crypto.randomUUID(),
  name: '',
  level: 3,
  category: 'technical',
});

export const emptyLanguage = (): Language => ({
  id: crypto.randomUUID(),
  name: '',
  level: 'B2',
});

/** Dil seviyeleri (CEFR). Eski kayıtlardaki 'Ana dil' yazımı 'Ana Dili' olarak düzeltilir. */
export const LANGUAGE_LEVELS = ['Ana Dili', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'] as const;
export const normalizeLanguageLevel = (lv: string): string =>
  /^ana\s*dil/i.test((lv || '').trim()) ? 'Ana Dili' : lv;

export const DRIVING_CLASSES = ['A1', 'A2', 'A', 'B', 'BE', 'C', 'CE', 'D', 'D1', 'E', 'F', 'G', 'SRC', 'Psikoteknik'] as const;

export const emptyCertificate = (): Certificate => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  date: '',
});

export const emptyReference = (): Reference => ({
  id: crypto.randomUUID(),
  name: '',
  title: '',
  phone: '',
  email: '',
});

export const emptyProject = (): Project => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  link: '',
  technologies: '',
});

export const getAISuggestions = (title: string, field: 'summary' | 'achievement' | 'skill'): string[] => {
  const t = (title || '').toLowerCase();

  if (field === 'summary') {
    if (t.includes('yazılım') || t.includes('software') || t.includes('developer') || t.includes('mühendis')) {
      return [
        '5+ yıllık deneyime sahip yazılım mühendisi. Ölçeklenebilir web uygulamaları geliştirdim, ekip liderliği yaptım ve %40 performans artışı sağlayan mimari iyileştirmeler uyguladım.',
        'Modern teknolojiler (React, Node.js, TypeScript) ile full-stack geliştirme konusunda uzman. Agile metodolojilerle 20+ başarılı proje teslim ettim.',
        'Problem çözme odaklı yazılım geliştirici. Kullanıcı deneyimini iyileştiren ve iş süreçlerini otomatikleştiren çözümler ürettim.',
      ];
    }
    if (t.includes('pazarlama') || t.includes('marketing') || t.includes('dijital')) {
      return [
        'Sonuç odaklı dijital pazarlama uzmanı. ROI odaklı kampanyalar yöneterek marka bilinirliğini %60 artırdım ve lead maliyetini %35 düşürdüm.',
        'SEO, SEM ve sosyal medya stratejileri ile büyümeyi hızlandıran pazarlama profesyoneli. Veri odaklı karar alma ve A/B test deneyimi.',
        'İçerik ve performans pazarlaması konusunda 4+ yıl deneyim. Organik trafiği 3 katına çıkaran stratejiler geliştirdim.',
      ];
    }
    if (t.includes('satış') || t.includes('sales')) {
      return [
        'Hedef odaklı satış profesyoneli. Yıllık ciroyu %45 artıran stratejiler uyguladım ve yeni müşteri kazanımında rekor kırdım.',
        'B2B satış deneyimiyle kurumsal müşterilerle uzun vadeli ilişkiler kurdum. Pipeline yönetiminde üstün başarı.',
      ];
    }
    return [
      'Deneyimli profesyonel. Sonuç odaklı çalışma tarzı ve güçlü iletişim becerileriyle ekiplere değer katıyorum.',
      'Sürekli gelişime açık, problem çözme yeteneği yüksek bir adayım. Hedeflere ulaşmak için proaktif yaklaşım sergilerim.',
      'Disiplinli ve detaycı çalışma prensipleriyle bilinen, takım çalışmasına yatkın bir profesyonel.',
    ];
  }

  if (field === 'achievement') {
    return [
      'Proje teslim sürelerini %30 kısalttım',
      'Müşteri memnuniyet skorunu 4.2\'den 4.8\'e yükselttim',
      'Yıllık maliyeti ₺180.000 azalttım',
      'Yeni süreç tasarlayarak verimliliği %25 artırdım',
      '5 kişilik ekibi başarıyla yönettim ve 3 kişiyi terfi ettirdim',
      'Anahtar performans göstergelerinde hedefi %120 aştım',
    ];
  }

  if (field === 'skill') {
    if (t.includes('yazılım') || t.includes('developer')) {
      return ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker', 'AWS', 'REST API'];
    }
    if (t.includes('pazarlama')) {
      return ['Google Analytics', 'SEO', 'Google Ads', 'Meta Ads', 'Content Marketing', 'HubSpot', 'Canva', 'A/B Testing'];
    }
    return ['Microsoft Office', 'İletişim', 'Problem Çözme', 'Takım Çalışması', 'Zaman Yönetimi', 'Liderlik', 'Analitik Düşünme'];
  }

  return [];
};

export const STORAGE_KEY = 'cvdoldur_data';
export const PROFILES_KEY = 'cvdoldur_profiles';
export const LEGACY_STORAGE_KEY = 'elitecv_data';
export const LEGACY_PROFILES_KEY = 'elitecv_profiles';
