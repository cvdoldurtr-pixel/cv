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
  | 'coverLetter';

export interface SectionVisibility {
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  languages: boolean;
  certificates: boolean;
  projects: boolean;
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
  },
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  certificates: [],
  projects: [],
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

export const emptyCertificate = (): Certificate => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  date: '',
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

export interface ATSTip {
  text: string;
  points: number;
  step: number;
}

export type QualityGrade = 'excellent' | 'strong' | 'developing' | 'incomplete';

export const calculateATSScore = (data: CVData): { score: number; tips: ATSTip[]; grade: QualityGrade } => {
  let score = 40;
  const tips: ATSTip[] = [];

  if (data.personal.fullName) score += 5;
  else tips.push({ text: 'Ad Soyad eksik', points: 5, step: 0 });

  if (data.personal.email && data.personal.phone) score += 8;
  else tips.push({ text: 'E-posta ve telefon ekleyin', points: 8, step: 0 });

  if (data.personal.summary && data.personal.summary.length > 50) score += 12;
  else tips.push({ text: 'Özet eksik veya çok kısa (en az 2-3 cümle)', points: 12, step: 0 });

  if (data.experiences.length > 0) score += 15;
  else tips.push({ text: 'En az bir iş deneyimi ekleyin', points: 15, step: 1 });

  if (data.experiences.some((e) => e.achievements.some((a) => a.length > 10))) score += 10;
  else tips.push({ text: 'Ölçülebilir başarılar ekleyin (%, sayı)', points: 10, step: 1 });

  if (data.educations.length > 0) score += 8;
  else tips.push({ text: 'Eğitim bilgisi ekleyin', points: 8, step: 2 });

  if (data.skills.length >= 4) score += 8;
  else tips.push({ text: 'En az 4 yetenek ekleyin', points: 8, step: 3 });

  if (data.languages.length > 0) score += 4;
  else tips.push({ text: 'Dil bilgisi ekleyin', points: 4, step: 3 });

  if (data.personal.linkedin) score += 3;
  else tips.push({ text: 'LinkedIn linki yok', points: 3, step: 0 });

  if (data.template === 'modern' || data.template === 'classic' || data.template === 'minimal') score += 5;
  else tips.push({ text: 'Tek sütunlu şablonlar ATS için daha güvenli', points: 5, step: 5 });

  if (data.jobDescription && data.jobDescription.length > 80) score += 2;

  const final = Math.min(score, 98);
  const grade: QualityGrade =
    final >= 90 ? 'excellent' : final >= 75 ? 'strong' : final >= 55 ? 'developing' : 'incomplete';

  return { score: final, tips, grade };
};

export const STORAGE_KEY = 'cvdoldur_data';
export const PROFILES_KEY = 'cvdoldur_profiles';
export const LEGACY_STORAGE_KEY = 'elitecv_data';
export const LEGACY_PROFILES_KEY = 'elitecv_profiles';
