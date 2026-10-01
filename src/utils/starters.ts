import { CVData, defaultCVData, emptyExperience, emptyEducation, emptySkill, emptyLanguage } from '../types/cv';

export type StarterId = 'yazilim' | 'pazarlama' | 'satis' | 'yenimezun' | 'bos';

export const starters: {
  id: StarterId;
  label: string;
  desc: string;
  icon: string;
  apply: () => CVData;
}[] = [
  {
    id: 'yazilim',
    label: 'Yazılım / IT',
    desc: 'React, Node, bulut odaklı örnek',
    icon: '💻',
    apply: () => ({
      ...defaultCVData,
      personal: {
        ...defaultCVData.personal,
        title: 'Yazılım Mühendisi',
        summary:
          '4+ yıllık deneyime sahip full-stack yazılım mühendisi. React ve Node.js ile ölçeklenebilir ürünler geliştirdim; CI/CD ve kod kalitesi odaklı çalışıyorum.',
      },
      experiences: [
        {
          ...emptyExperience(),
          company: 'Tech Şirketi A.Ş.',
          position: 'Yazılım Mühendisi',
          startDate: '2022-03',
          current: true,
          endDate: '',
          description: 'Ürün ekibinde web uygulamaları geliştirme',
          achievements: [
            'Sayfa yükleme süresini %[X] azalttım',
            'Mikroservis mimarisine geçişte 3 servisi devreye aldım',
            'Code review sürecini standartlaştırdım',
          ],
        },
      ],
      educations: [
        {
          ...emptyEducation(),
          school: 'Örnek Üniversitesi',
          department: 'Bilgisayar Mühendisliği',
          degree: 'Lisans',
          startDate: '2016',
          endDate: '2020',
        },
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'].map((name) => ({
        ...emptySkill(),
        name,
        level: 4,
      })),
      languages: [
        { ...emptyLanguage(), name: 'Türkçe', level: 'Ana dil' },
        { ...emptyLanguage(), name: 'İngilizce', level: 'B2' },
      ],
    }),
  },
  {
    id: 'pazarlama',
    label: 'Pazarlama',
    desc: 'Dijital / growth örnek',
    icon: '📈',
    apply: () => ({
      ...defaultCVData,
      personal: {
        ...defaultCVData.personal,
        title: 'Dijital Pazarlama Uzmanı',
        summary:
          'ROI odaklı dijital pazarlama uzmanı. Performans kampanyaları, SEO ve içerik stratejisi ile büyümeyi hızlandırıyorum.',
      },
      experiences: [
        {
          ...emptyExperience(),
          company: 'Marka Ajansı',
          position: 'Dijital Pazarlama Uzmanı',
          startDate: '2021-06',
          current: true,
          description: 'Performans ve organik büyüme',
          achievements: [
            'Lead maliyetini %[X] düşürdüm',
            'Organik trafiği 2.5x artırdım',
            'Aylık 50+ kampanya optimizasyonu yürüttüm',
          ],
        },
      ],
      educations: [
        {
          ...emptyEducation(),
          school: 'Örnek Üniversitesi',
          department: 'İşletme',
          degree: 'Lisans',
          startDate: '2015',
          endDate: '2019',
        },
      ],
      skills: ['Google Analytics', 'SEO', 'Google Ads', 'Meta Ads', 'HubSpot', 'Excel'].map((name) => ({
        ...emptySkill(),
        name,
      })),
      languages: [
        { ...emptyLanguage(), name: 'Türkçe', level: 'Ana dil' },
        { ...emptyLanguage(), name: 'İngilizce', level: 'B2' },
      ],
    }),
  },
  {
    id: 'satis',
    label: 'Satış',
    desc: 'B2B / saha satış örneği',
    icon: '🤝',
    apply: () => ({
      ...defaultCVData,
      personal: {
        ...defaultCVData.personal,
        title: 'Satış Temsilcisi',
        summary:
          'Hedef odaklı satış profesyoneli. Pipeline yönetimi ve uzun vadeli müşteri ilişkileri ile ciro büyümesine katkı sağlıyorum.',
      },
      experiences: [
        {
          ...emptyExperience(),
          company: 'Satış A.Ş.',
          position: 'Satış Temsilcisi',
          startDate: '2020-01',
          current: true,
          achievements: [
            'Yıllık ciro hedefini %[X] aştım',
            '15+ yeni kurumsal müşteri kazandırdım',
            'CRM kullanımını ekip içinde yaygınlaştırdım',
          ],
        },
      ],
      educations: [
        {
          ...emptyEducation(),
          school: 'Örnek Üniversitesi',
          department: 'İktisat',
          degree: 'Lisans',
          startDate: '2014',
          endDate: '2018',
        },
      ],
      skills: ['CRM', 'Müzakere', 'Sunum', 'Excel', 'Müşteri İlişkileri'].map((name) => ({
        ...emptySkill(),
        name,
      })),
      languages: [{ ...emptyLanguage(), name: 'Türkçe', level: 'Ana dil' }],
    }),
  },
  {
    id: 'yenimezun',
    label: 'Yeni Mezun',
    desc: 'Staj + proje odaklı',
    icon: '🎓',
    apply: () => ({
      ...defaultCVData,
      personal: {
        ...defaultCVData.personal,
        title: 'Yeni Mezun Aday',
        summary:
          'Yeni mezun aday. Staj ve akademik projelerle edindiğim deneyimi, öğrenmeye açık tutumumla birleştirerek ekibe hızlı katkı sağlamayı hedefliyorum.',
      },
      experiences: [
        {
          ...emptyExperience(),
          company: 'Staj Yapılan Firma',
          position: 'Stajyer',
          startDate: '2024-06',
          endDate: '2024-09',
          current: false,
          achievements: ['Departman raporlama sürecine destek oldum', '2 mini projeyi teslim ettim'],
        },
      ],
      educations: [
        {
          ...emptyEducation(),
          school: 'Örnek Üniversitesi',
          department: 'İlgili Bölüm',
          degree: 'Lisans',
          startDate: '2020',
          endDate: '2024',
          gpa: '3.20',
        },
      ],
      skills: ['Microsoft Office', 'İletişim', 'Araştırma', 'Takım Çalışması'].map((name) => ({
        ...emptySkill(),
        name,
      })),
      languages: [
        { ...emptyLanguage(), name: 'Türkçe', level: 'Ana dil' },
        { ...emptyLanguage(), name: 'İngilizce', level: 'B1' },
      ],
      projects: [
        {
          id: crypto.randomUUID(),
          name: 'Bitirme Projesi',
          description: 'Kısa açıklama — sorun, çözüm, sonuç',
          link: '',
          technologies: '',
        },
      ],
    }),
  },
];
