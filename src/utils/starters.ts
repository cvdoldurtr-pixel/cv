/**
 * Meslek başlangıçları: Türkiye iş piyasasına göre örnek içerik.
 * Rakamlar bilerek [X] bırakıldı; kullanıcı kendi gerçek değerini yazmadan PDF alırken uyarılır.
 * SEO rehber sayfaları /?role=<id> ile doğrudan ilgili başlangıcı açar (role_cta.py).
 */
import { CVData, defaultCVData, emptyExperience, emptyEducation, emptySkill, emptyLanguage, emptyCertificate, emptyProject } from '../types/cv';

export type StarterId =
  | 'yazilim' | 'pazarlama' | 'satis' | 'yenimezun' | 'muhasebe' | 'ogretmen' | 'hemsire' | 'muhendis'
  | 'sofor' | 'kasiyer' | 'garson' | 'grafik' | 'ik' | 'lojistik' | 'sekreter' | 'cagri' | 'teknisyen' | 'ogrenci';

interface Spec {
  title: string;
  summary: string;
  exp: { company: string; position: string; start: string; end?: string; desc?: string; bullets: string[] };
  edu: { school: string; department: string; degree: string; start: string; end: string; gpa?: string };
  skills: string[];
  softSkills?: string[];
  english?: string;
  certs?: [string, string, string][];
  license?: string[];
  project?: { name: string; description: string; technologies?: string };
  personalExtra?: Partial<CVData['personal']>;
}

function build(s: Spec): CVData {
  return {
    ...defaultCVData,
    personal: {
      ...defaultCVData.personal,
      title: s.title,
      summary: s.summary,
      drivingLicense: s.license || [],
      ...(s.personalExtra || {}),
    },
    experiences: [
      {
        ...emptyExperience(),
        company: s.exp.company,
        position: s.exp.position,
        startDate: s.exp.start,
        endDate: s.exp.end || '',
        current: !s.exp.end,
        description: s.exp.desc || '',
        achievements: s.exp.bullets,
      },
    ],
    educations: [
      { ...emptyEducation(), school: s.edu.school, department: s.edu.department, degree: s.edu.degree, startDate: s.edu.start, endDate: s.edu.end, gpa: s.edu.gpa || '' },
    ],
    skills: [
      ...s.skills.map((name) => ({ ...emptySkill(), name, level: 4 })),
      ...(s.softSkills || []).map((name) => ({ ...emptySkill(), name, level: 4, category: 'soft' as const })),
    ],
    languages: [
      { ...emptyLanguage(), name: 'Türkçe', level: 'Ana Dili' },
      ...(s.english ? [{ ...emptyLanguage(), name: 'İngilizce', level: s.english }] : []),
    ],
    certificates: (s.certs || []).map(([name, issuer, date]) => ({ ...emptyCertificate(), name, issuer, date })),
    projects: s.project ? [{ ...emptyProject(), name: s.project.name, description: s.project.description, technologies: s.project.technologies || '' }] : [],
  };
}

const UNI = 'Örnek Üniversitesi';

export const starters: { id: StarterId; label: string; desc: string; icon: string; apply: () => CVData }[] = [
  {
    id: 'yazilim', label: 'Yazılım / IT', desc: 'Web, mobil, backend', icon: '💻',
    apply: () => build({
      title: 'Yazılım Geliştirici',
      summary: '[X] yıllık deneyime sahip full-stack yazılım geliştirici. React ve Node.js ile kullanıcıya dönük web uygulamaları geliştiriyor, test ve kod incelemesiyle kaliteyi koruyorum.',
      exp: { company: 'Teknoloji A.Ş.', position: 'Yazılım Geliştirici', start: '03.2022', desc: 'Ürün ekibinde web uygulaması geliştirme', bullets: ['Sayfa yükleme süresini %[X] azalttım', '[X] yeni özelliği uçtan uca geliştirip canlıya aldım', 'Kod inceleme sürecini standartlaştırarak hata oranını düşürdüm'] },
      edu: { school: UNI, department: 'Bilgisayar Mühendisliği', degree: 'Lisans', start: '2017', end: '2021' },
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'REST API'],
      softSkills: ['Takım çalışması'],
      english: 'B2',
      personalExtra: { workPreference: 'Ofis / Hibrit / Uzaktan' },
    }),
  },
  {
    id: 'muhasebe', label: 'Muhasebe / Finans', desc: 'Logo, Mikro, Luca', icon: '📊',
    apply: () => build({
      title: 'Muhasebe Uzmanı',
      summary: 'Genel muhasebe, KDV ve muhtasar beyannameleri ile e-fatura/e-defter süreçlerinde [X] yıllık deneyim. Ay sonu kapanışlarını zamanında ve hatasız tamamlamaya odaklanırım.',
      exp: { company: 'Ticaret Ltd. Şti.', position: 'Muhasebe Uzmanı', start: '01.2021', desc: 'Genel muhasebe ve vergi beyannameleri', bullets: ['Aylık [X] adet fatura ve masraf kaydını Logo Tiger\'da işledim', 'KDV, muhtasar ve SGK bildirgelerini zamanında verdim', 'Banka ve cari mutabakatlarını aylık olarak tamamladım'] },
      edu: { school: UNI, department: 'İşletme', degree: 'Lisans', start: '2015', end: '2019' },
      skills: ['Logo Tiger', 'Mikro', 'Luca', 'ETA', 'e-Fatura / e-Defter', 'KDV ve Muhtasar Beyanname', 'İleri Excel'],
      certs: [['SMMM Staj Başlangıç Sınavı', 'TÜRMOB', '']],
      english: 'B1',
    }),
  },
  {
    id: 'satis', label: 'Satış', desc: 'Saha / B2B / mağaza', icon: '🤝',
    apply: () => build({
      title: 'Satış Temsilcisi',
      summary: 'Hedef odaklı satış temsilcisi. Portföy yönetimi, yeni müşteri kazanımı ve uzun vadeli müşteri ilişkileriyle ciro büyümesine katkı sağlıyorum.',
      exp: { company: 'Satış A.Ş.', position: 'Saha Satış Temsilcisi', start: '01.2020', bullets: ['Yıllık satış hedefini %[X] oranında gerçekleştirdim', '[X] yeni kurumsal müşteri kazandırdım', 'CRM kullanımını ekip içinde yaygınlaştırdım'] },
      edu: { school: UNI, department: 'İktisat', degree: 'Lisans', start: '2014', end: '2018' },
      skills: ['B2B Satış', 'CRM', 'Müzakere', 'Sunum', 'Excel', 'Portföy Yönetimi'],
      license: ['B'],
      personalExtra: { travel: 'Seyahat engeli yok' },
    }),
  },
  {
    id: 'yenimezun', label: 'Yeni Mezun', desc: 'Staj + proje odaklı', icon: '🎓',
    apply: () => build({
      title: 'Yeni Mezun',
      summary: 'Yeni mezun. Staj ve akademik projelerle edindiğim deneyimi, öğrenmeye açık tutumumla birleştirerek ekibe hızlı katkı sağlamayı hedefliyorum.',
      exp: { company: 'Staj Yapılan Firma', position: 'Stajyer', start: '06.2024', end: '09.2024', bullets: ['Departmanın haftalık raporlarını hazırlamaya destek oldum', '[X] kişilik ekiple bir iç süreç iyileştirme projesinde çalıştım'] },
      edu: { school: UNI, department: 'İlgili Bölüm', degree: 'Lisans', start: '2020', end: '2024', gpa: '3.20 / 4.00' },
      skills: ['Microsoft Office', 'Araştırma', 'Raporlama'],
      softSkills: ['İletişim', 'Takım çalışması'],
      english: 'B1',
      project: { name: 'Bitirme Projesi', description: 'Sorun, sizin çözümünüz ve sonuç (1-2 cümle)' },
      personalExtra: { availability: 'Hemen başlayabilir' },
    }),
  },
  {
    id: 'pazarlama', label: 'Pazarlama', desc: 'Dijital / sosyal medya', icon: '📈',
    apply: () => build({
      title: 'Dijital Pazarlama Uzmanı',
      summary: 'Veri odaklı dijital pazarlama uzmanı. Performans reklamları, SEO ve içerik stratejisiyle marka bilinirliğini ve dönüşümleri artırmaya odaklanırım.',
      exp: { company: 'Marka Ajansı', position: 'Dijital Pazarlama Uzmanı', start: '06.2021', bullets: ['Meta ve Google reklamlarında müşteri edinme maliyetini %[X] düşürdüm', 'Organik trafiği [X] ayda %[X] artırdım', 'Aylık içerik takvimini planlayıp [X] marka hesabını yönettim'] },
      edu: { school: UNI, department: 'İşletme', degree: 'Lisans', start: '2015', end: '2019' },
      skills: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEO', 'İçerik Pazarlaması', 'Canva'],
      english: 'B2',
    }),
  },
  {
    id: 'ogretmen', label: 'Öğretmen', desc: 'Özel okul / dershane', icon: '📚',
    apply: () => build({
      title: 'İngilizce Öğretmeni',
      summary: 'Pedagojik formasyon sahibi, [X] yıllık deneyimli öğretmen. Öğrenci seviyesine göre farklılaştırılmış ders planlarıyla başarıyı ve derse katılımı artırmaya odaklanırım.',
      exp: { company: 'Özel Örnek Koleji', position: 'İngilizce Öğretmeni', start: '09.2020', desc: 'Ortaokul 5-8. sınıflar', bullets: ['[X] şubede haftalık [X] saat ders verdim', 'Öğrencilerin dönem sonu sınav ortalamasını [X] puan yükselttim', 'Veli toplantıları ve bireysel gelişim raporlarını düzenli yürüttüm'] },
      edu: { school: UNI, department: 'İngiliz Dili Eğitimi', degree: 'Lisans', start: '2015', end: '2019' },
      skills: ['Ders Planlama', 'Ölçme ve Değerlendirme', 'Sınıf Yönetimi', 'EBA / Dijital Eğitim Araçları'],
      english: 'C1',
      certs: [['Pedagojik Formasyon', UNI, '2019'], ['KPSS (puan türü ve puan)', 'ÖSYM', '2024']],
    }),
  },
  {
    id: 'hemsire', label: 'Hemşire / Sağlık', desc: 'Hastane / klinik', icon: '🩺',
    apply: () => build({
      title: 'Hemşire',
      summary: 'Yoğun bakım ve servis deneyimli hemşire. Hasta güvenliği, enfeksiyon kontrolü ve ekip içi iletişime önem veririm.',
      exp: { company: 'Özel Örnek Hastanesi', position: 'Servis Hemşiresi', start: '02.2021', desc: 'Dahiliye servisi, [X] yataklı', bullets: ['Vardiya başına ortalama [X] hastanın bakım planını yürüttüm', 'İlaç uygulama hatalarını önlemek için çift kontrol uygulamasına katkı verdim', 'Yeni başlayan [X] hemşirenin oryantasyonunda görev aldım'] },
      edu: { school: UNI, department: 'Hemşirelik', degree: 'Lisans', start: '2016', end: '2020' },
      skills: ['Hasta Bakımı', 'İlaç Uygulama', 'Enfeksiyon Kontrolü', 'Hastane Bilgi Yönetim Sistemi (HBYS)', 'Yoğun Bakım'],
      certs: [['Temel Yaşam Desteği (TYD)', 'Sağlık Bakanlığı onaylı', ''], ['Yoğun Bakım Hemşireliği Sertifikası', '', '']],
    }),
  },
  {
    id: 'muhendis', label: 'Mühendis', desc: 'Makine, inşaat, elektrik', icon: '⚙️',
    apply: () => build({
      title: 'Makine Mühendisi',
      summary: 'Üretim ve bakım süreçlerinde [X] yıllık deneyime sahip makine mühendisi. Verimlilik, iş güvenliği ve maliyet odaklı iyileştirmeler yaparım.',
      exp: { company: 'Sanayi A.Ş.', position: 'Üretim Mühendisi', start: '04.2021', desc: 'OSB\'de metal işleme fabrikası', bullets: ['Hat duruş süresini %[X] azalttım', 'Yalın üretim (5S, Kaizen) çalışmalarına liderlik ettim', 'Yıllık [X] TL maliyet düşüşü sağlayan tedarikçi değişikliğini yönettim'] },
      edu: { school: UNI, department: 'Makine Mühendisliği', degree: 'Lisans', start: '2015', end: '2020' },
      skills: ['AutoCAD', 'SolidWorks', 'SAP PP', 'Yalın Üretim', 'ISO 9001', 'İş Sağlığı ve Güvenliği'],
      english: 'B2',
      license: ['B'],
    }),
  },
  {
    id: 'sofor', label: 'Şoför / Kurye', desc: 'Ehliyet, SRC, psikoteknik', icon: '🚚',
    apply: () => build({
      title: 'Şoför',
      summary: 'Şehir içi ve şehirlerarası dağıtımda [X] yıllık deneyimli, kazasız sürüş geçmişine sahip şoför. Zamanında teslimat ve araç bakımına özen gösteririm.',
      exp: { company: 'Lojistik Ltd. Şti.', position: 'Dağıtım Şoförü', start: '05.2019', bullets: ['Günde ortalama [X] noktaya zamanında teslimat yaptım', '[X] yıl boyunca kazasız ve cezasız sürüş', 'Araç günlük kontrol ve bakım takibini düzenli yaptım'] },
      edu: { school: 'Örnek Meslek Lisesi', department: '', degree: 'Lise', start: '2010', end: '2014' },
      skills: ['Şehir içi dağıtım', 'Rota planlama', 'Navigasyon / harita uygulamaları', 'Araç bakımı', 'İrsaliye ve teslim tutanağı'],
      license: ['B', 'C', 'CE', 'SRC', 'Psikoteknik'],
      certs: [['SRC 4 (Yurtiçi Eşya Taşımacılığı)', 'UDHB', ''], ['Psikoteknik Belgesi', '', '']],
      personalExtra: { availability: 'Hemen başlayabilir', militaryStatus: 'Tamamlandı' },
    }),
  },
  {
    id: 'kasiyer', label: 'Kasiyer / Mağaza', desc: 'Market, perakende', icon: '🛒',
    apply: () => build({
      title: 'Kasiyer',
      summary: 'Perakende sektöründe güler yüzlü ve hızlı hizmet anlayışıyla çalışan kasiyer. Kasa açılış-kapanış ve stok düzeninde titizimdir.',
      exp: { company: 'Örnek Market Zinciri', position: 'Kasiyer', start: '03.2022', bullets: ['Vardiya başına ortalama [X] müşteriye hizmet verdim', 'Kasa farkı vermeden gün sonu kapanışlarını yaptım', 'Raf düzeni ve son kullanma tarihi kontrollerine destek oldum'] },
      edu: { school: 'Örnek Anadolu Lisesi', department: '', degree: 'Lise', start: '2016', end: '2020' },
      skills: ['Kasa işlemleri', 'POS cihazı', 'Müşteri hizmetleri', 'Stok ve raf düzeni'],
      softSkills: ['Güler yüzlü iletişim'],
      personalExtra: { availability: 'Hemen başlayabilir' },
    }),
  },
  {
    id: 'garson', label: 'Garson / Turizm', desc: 'Restoran, otel, kafe', icon: '🍽️',
    apply: () => build({
      title: 'Garson',
      summary: 'Restoran ve otel servisinde [X] yıllık deneyimli garson. Yoğun saatlerde hızlı ve düzenli servis, misafir memnuniyeti ve hijyen kurallarına önem veririm.',
      exp: { company: 'Örnek Otel', position: 'Garson', start: '05.2021', desc: 'A la carte restoran', bullets: ['Yoğun sezonda vardiya başına [X] masaya servis verdim', 'Misafir değerlendirmelerinde ekip olarak [X] puan aldık', 'Yeni başlayan garsonlara servis düzenini öğrettim'] },
      edu: { school: 'Örnek Turizm Meslek Lisesi', department: 'Yiyecek İçecek Hizmetleri', degree: 'Lise', start: '2015', end: '2019' },
      skills: ['Servis düzeni', 'POS / adisyon sistemi', 'Hijyen kuralları', 'Menü bilgisi'],
      english: 'A2',
      certs: [['Hijyen Eğitimi Belgesi', '', '']],
    }),
  },
  {
    id: 'grafik', label: 'Grafik Tasarım', desc: 'Portföy odaklı', icon: '🎨',
    apply: () => build({
      title: 'Grafik Tasarımcı',
      summary: 'Marka kimliği, sosyal medya ve basılı işlerde deneyimli grafik tasarımcı. Brief\'i doğru anlayıp zamanında, marka diline uygun tasarım üretirim.',
      exp: { company: 'Kreatif Ajans', position: 'Grafik Tasarımcı', start: '09.2021', bullets: ['[X] markanın kurumsal kimlik ve sosyal medya tasarımlarını hazırladım', 'Ayda ortalama [X] tasarım teslim ettim', 'Basım öncesi dosya hazırlığında hata kaynaklı tekrar baskıları önledim'] },
      edu: { school: UNI, department: 'Grafik Tasarımı', degree: 'Lisans', start: '2016', end: '2020' },
      skills: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Kurumsal Kimlik', 'Baskı Öncesi Hazırlık'],
      english: 'B1',
    }),
  },
  {
    id: 'ik', label: 'İnsan Kaynakları', desc: 'İşe alım, bordro', icon: '👥',
    apply: () => build({
      title: 'İnsan Kaynakları Uzmanı',
      summary: 'İşe alım, özlük ve bordro süreçlerinde deneyimli İK uzmanı. Aday deneyimini ve çalışan bağlılığını artıran süreçler kurarım.',
      exp: { company: 'Holding A.Ş.', position: 'İK Uzmanı', start: '02.2021', bullets: ['Yılda [X] pozisyon için uçtan uca işe alım yürüttüm', 'Pozisyon kapanma süresini [X] günden [X] güne indirdim', 'SGK giriş-çıkış ve özlük dosyalarını eksiksiz yönettim'] },
      edu: { school: UNI, department: 'Çalışma Ekonomisi ve Endüstri İlişkileri', degree: 'Lisans', start: '2015', end: '2019' },
      skills: ['İşe Alım', 'Mülakat Teknikleri', 'Bordro', 'SGK İşlemleri', 'İş Hukuku', 'Excel'],
      english: 'B2',
    }),
  },
  {
    id: 'lojistik', label: 'Lojistik / Depo', desc: 'WMS, sevkiyat', icon: '📦',
    apply: () => build({
      title: 'Lojistik Uzmanı',
      summary: 'Depo, sevkiyat ve tedarik zinciri operasyonlarında deneyimli lojistik uzmanı. Stok doğruluğu ve zamanında teslimatı artırmaya odaklanırım.',
      exp: { company: 'Lojistik A.Ş.', position: 'Lojistik Uzmanı', start: '03.2020', bullets: ['Stok sayım doğruluğunu %[X] seviyesine çıkardım', 'Günlük [X] sevkiyatın planlamasını yönettim', 'Taşıma maliyetlerini rota optimizasyonuyla %[X] azalttım'] },
      edu: { school: UNI, department: 'Uluslararası Ticaret ve Lojistik', degree: 'Lisans', start: '2014', end: '2018' },
      skills: ['WMS', 'SAP MM', 'Sevkiyat Planlama', 'Gümrük Mevzuatı', 'Stok Yönetimi', 'Excel'],
      english: 'B1',
      license: ['B'],
    }),
  },
  {
    id: 'sekreter', label: 'Sekreter / Ofis', desc: 'İdari asistan', icon: '🗂️',
    apply: () => build({
      title: 'Yönetici Asistanı',
      summary: 'Ajanda, yazışma ve ofis yönetiminde deneyimli yönetici asistanı. Düzenli, gizliliğe önem veren ve çoklu işi aynı anda yürütebilen biriyim.',
      exp: { company: 'Örnek Hukuk Bürosu', position: 'Yönetici Asistanı', start: '01.2021', bullets: ['[X] yöneticinin ajanda ve toplantı planlamasını yürüttüm', 'Resmi yazışmaları ve evrak arşivini düzenledim', 'Ofis satın alma süreçlerinde maliyet takibi yaptım'] },
      edu: { school: UNI, department: 'Büro Yönetimi ve Yönetici Asistanlığı', degree: 'Önlisans', start: '2017', end: '2019' },
      skills: ['Microsoft Office', 'Resmi Yazışma', 'Ajanda Yönetimi', 'Arşivleme', 'On Parmak Klavye'],
      english: 'B1',
    }),
  },
  {
    id: 'cagri', label: 'Müşteri Hizmetleri', desc: 'Çağrı merkezi', icon: '🎧',
    apply: () => build({
      title: 'Müşteri Temsilcisi',
      summary: 'Çağrı merkezi ve canlı destek kanallarında deneyimli müşteri temsilcisi. Sorunu ilk temasta çözmeye ve müşteri memnuniyetine odaklanırım.',
      exp: { company: 'Örnek Çağrı Merkezi', position: 'Müşteri Temsilcisi', start: '06.2022', bullets: ['Günde ortalama [X] çağrı ve canlı destek talebi karşıladım', 'Müşteri memnuniyet puanım ekip ortalamasının üzerinde ([X]/5) oldu', 'Sık sorulan sorular için ekip içi bilgi notları hazırladım'] },
      edu: { school: 'Örnek Anadolu Lisesi', department: '', degree: 'Lise', start: '2016', end: '2020' },
      skills: ['CRM', 'Çağrı karşılama', 'Canlı destek', 'Şikâyet yönetimi', 'On Parmak Klavye'],
      softSkills: ['Diksiyon', 'Empati'],
    }),
  },
  {
    id: 'teknisyen', label: 'Teknisyen / Usta', desc: 'Elektrik, bakım', icon: '🔧',
    apply: () => build({
      title: 'Elektrik Teknisyeni',
      summary: 'Endüstriyel bakım ve elektrik tesisatında deneyimli teknisyen. Arızaya hızlı müdahale, iş güvenliği kurallarına uyum ve düzenli bakım kaydı tutarım.',
      exp: { company: 'Fabrika A.Ş.', position: 'Bakım Teknisyeni', start: '07.2019', bullets: ['Planlı bakım takvimine uyarak arıza kaynaklı duruşları azalttım', 'Ayda ortalama [X] arıza kaydını kapattım', 'Pano ve motor bakımlarında iş güvenliği talimatlarına tam uyum sağladım'] },
      edu: { school: 'Örnek Mesleki ve Teknik Anadolu Lisesi', department: 'Elektrik-Elektronik Teknolojisi', degree: 'Lise', start: '2013', end: '2017' },
      skills: ['Elektrik tesisatı', 'PLC (temel)', 'Pano montajı', 'Arıza tespiti', 'Ölçü aletleri'],
      certs: [['Ustalık Belgesi', 'MEB', ''], ['İş Sağlığı ve Güvenliği Eğitimi', '', '']],
      license: ['B'],
      personalExtra: { militaryStatus: 'Tamamlandı' },
    }),
  },
  {
    id: 'ogrenci', label: 'Öğrenci / Stajyer', desc: 'Staj ve yarı zamanlı', icon: '🧑‍🎓',
    apply: () => ({
      ...build({
        title: 'Stajyer Adayı',
        summary: 'Örnek Üniversitesi [Bölüm] [X]. sınıf öğrencisi. Derslerde ve kulüp çalışmalarında edindiğim becerileri staj sürecinde gerçek işe dönüştürmek istiyorum.',
        exp: { company: 'Öğrenci Kulübü / Gönüllü Çalışma', position: 'Etkinlik Ekibi Üyesi', start: '10.2023', bullets: ['[X] kişilik etkinliğin organizasyonunda görev aldım'] },
        edu: { school: UNI, department: 'Bölümünüz', degree: 'Lisans', start: '2022', end: 'Devam ediyor', gpa: '' },
        skills: ['Microsoft Office', 'Araştırma'],
        softSkills: ['Takım çalışması', 'İletişim'],
        english: 'B1',
        project: { name: 'Dönem Projesi', description: 'Ne yaptınız ve ne öğrendiniz (1-2 cümle)' },
        personalExtra: { availability: 'Hemen başlayabilir' },
      }),
    }),
  },
];
