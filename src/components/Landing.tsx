import {
  CheckCircle2, Shield, FileCheck, ArrowRight, Star, Brain,
  Target, Users, Lock, FileUp, Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import { NAV, LEGAL_LINKS } from '../utils/navData';
import { CVData } from '../types/cv';
import { starters } from '../utils/starters';

const guides = [
  { href: '/cv-nasil-hazirlanir', title: 'CV Nasıl Hazırlanır?', desc: "Adım adım profesyonel CV hazırlama rehberi" },
  { href: '/cv-sablonu-nasil-secilir', title: 'CV Şablonu Nasıl Seçilir', desc: "Ücretsiz CV şablonu seçerken dikkat edilecekler" },
  { href: '/ats-uyumlu-cv-sablonu', title: 'ATS Uyumlu CV Şablonu', desc: "ATS odaklı sade CV nasıl hazırlanır" },
  { href: '/on-yazi-nasil-yazilir', title: 'Ön Yazı Nasıl Yazılır', desc: "Dikkat çeken bir ön yazı için adım adım rehber" },
  { href: '/ingilizce-cv-ornegi', title: 'İngilizce CV Örneği', desc: "Türkçe CV'den İngilizce CV'ye geçiş rehberi" },
  { href: '/is-basvuru-e-postasi-ornegi', title: 'İş Başvuru E-postası Örneği', desc: "CV ile birlikte gönderilecek başvuru e-postası örneği" },
  { href: '/is-ilani-sitelerine-cv-yukleme', title: 'İş İlanı Sitelerine CV Yükleme', desc: "Kariyer.net, LinkedIn, Indeed ve İŞKUR için ipuçları" },
  { href: '/mulakat-sorulari-ve-cevaplari', title: 'Mülakat Soruları ve Cevapları', desc: "En sık sorulan 10 mülakat sorusu ve cevap yaklaşımı" },
  { href: '/cv-de-fotograf-hobi-referans', title: "CV'de Fotoğraf, Hobi ve Referans", desc: "CV'ye fotoğraf, hobi ve referans yazılır mı?" },
  { href: '/cv-de-bosluk-nasil-aciklanir', title: "CV'de Boşluk Nasıl Açıklanır", desc: "Kariyer arası ve iş boşluğu CV'de nasıl yazılır?" },
  { href: '/kariyer-degisikligi-cv', title: 'Kariyer Değişikliği CV', desc: "Sektör veya meslek değiştirenler için CV rehberi" },
  { href: '/cv-de-yetenekler-nasil-yazilir', title: "CV'de Yetenekler ve Beceriler Nasıl Yazılır? Örnek Liste ve Doğru Kullanım", desc: "CV'de yetenekler bölümü nasıl yazılır? Teknik ve kişisel becerileri ayırma, sev…" },
  { href: '/cv-kac-sayfa-olmali', title: 'CV Kaç Sayfa Olmalı? Tek Sayfa mı İki Sayfa mı? Deneyime Göre Rehber', desc: "CV kaç sayfa olmalı? Deneyim yılına göre tek veya iki sayfa kuralı, sığdırma yö…" },
  { href: '/cv-sablonlari', title: 'CV Şablonları 2026: Ücretsiz Profesyonel Özgeçmiş Şablonu İndir', desc: "ATS uyumlu ücretsiz CV şablonları. Klasik, modern, minimal ve iki sütunlu özgeç…" },
  { href: '/linkedin-profili-nasil-hazirlanir', title: 'LinkedIn Profili Nasıl Hazırlanır? İş Başvurusu İçin Adım Adım Rehber', desc: "İş bulmak için LinkedIn profili nasıl hazırlanır? Başlık, hakkında bölümü, dene…" },
  { href: '/ozgecmis-ornekleri', title: 'Özgeçmiş Örnekleri 2026: 50+ Meslege Özel Hazır CV Şablonu', desc: "Türkçe özgeçmiş örnekleri ve hazır CV şablonları. Mühendis, öğretmen, hemşire,…" },
  { href: '/rehberler', title: 'CV Rehberleri: Örnekler, Şablonlar ve Şehir Rehberleri', desc: "Meslek bazlı CV örnekleri, şehre özel CV rehberleri, ATS uyumlu şablonlar, ön y…" },
  { href: '/word-mu-pdf-mi-cv-formati', title: 'CV Word mü PDF mi? Hangi Formatta Göndermeli ve Nasıl Kaydedilir', desc: "CV'yi Word veya PDF olarak göndermek arasındaki farklar, ATS uyumu, dosya adı k…" },
];

const roleGuides = [
  { href: '/yazilimci-cv-ornegi', title: 'Yazılımcı CV Örneği', desc: "Yazılım mühendisleri için örnek CV ve rehber" },
  { href: '/pazarlamaci-cv-ornegi', title: 'Pazarlamacı CV Örneği', desc: "Dijital pazarlama uzmanları için örnek CV ve rehber" },
  { href: '/satis-temsilcisi-cv-ornegi', title: 'Satış Temsilcisi CV Örneği', desc: "Satış rakamlarını CV'de nasıl öne çıkarırsınız" },
  { href: '/yeni-mezun-cv-ornegi', title: 'Yeni Mezun CV Örneği', desc: "Deneyimsizken nasıl öne çıkarsınız" },
  { href: '/muhasebeci-cv-ornegi', title: 'Muhasebeci CV Örneği', desc: "Muhasebe elemanı ve uzmanı için örnek CV ve rehber" },
  { href: '/ogretmen-cv-ornegi', title: 'Öğretmen CV Örneği', desc: "Özel okul ve kurs başvuruları için öğretmen CV rehberi" },
  { href: '/hemsire-cv-ornegi', title: 'Hemşire CV Örneği', desc: "Hastane ve klinik başvuruları için hemşire CV rehberi" },
  { href: '/muhendis-cv-ornegi', title: 'Mühendis CV Örneği', desc: "Makine, inşaat, elektrik mühendisleri için CV rehberi" },
  { href: '/kasiyer-tezgahtar-cv-ornegi', title: 'Kasiyer CV Örneği', desc: "Market, mağaza ve perakende için kasiyer ve tezgâhtar CV rehberi" },
  { href: '/sofor-kurye-cv-ornegi', title: 'Şoför ve Kurye CV Örneği', desc: "Şoför, kurye ve lojistik sürücüleri için CV rehberi" },
  { href: '/garson-restoran-cv-ornegi', title: 'Garson CV Örneği', desc: "Restoran, kafe ve otel servis personeli için CV rehberi" },
  { href: '/grafik-tasarimci-cv-ornegi', title: 'Grafik Tasarımcı CV Örneği', desc: "Grafik tasarımcı ve UI/UX adayları için portföy odaklı CV rehberi" },
  { href: '/insan-kaynaklari-cv-ornegi', title: 'İnsan Kaynakları CV Örneği', desc: "İK uzmanı ve asistanı için CV rehberi" },
  { href: '/lojistik-uzman-cv-ornegi', title: 'Lojistik Uzmanı CV Örneği 2026: Tedarik Zinciri ve Depo Yönetimi Rehberi', desc: "Lojistik ve tedarik zinciri CV'si nasıl hazırlanır? WMS, ERP ve gümrük bilgisiy…" },
  { href: '/muhasebe-cv-ornegi', title: 'Muhasebe CV Örneği 2026: Mali Müşavir ve Finans Uzmanı için Kapsamlı Rehber', desc: "Muhasebe ve finans CV'si nasıl hazırlanır? SMMM, ERP sistemleri ve ATS anahtar…" },
  { href: '/sekreter-cv-ornegi', title: 'Sekreter ve Ofis Asistanı CV Örneği: Özet, Deneyim ve Beceri Yazımı', desc: "Sekreter, idari asistan ve ofis elemanı CV örneği: özet cümlesi, deneyim maddel…" },
];

const cityGuides = [
  { href: '/istanbul-cv-hazirlama', title: 'İstanbul CV Hazırlama Rehberi', desc: "İstanbul'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/ankara-cv-hazirlama', title: 'Ankara CV Hazırlama Rehberi', desc: "Ankara'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/izmir-cv-hazirlama', title: 'İzmir CV Hazırlama Rehberi', desc: "İzmir'de iş başvurusu için sektör ve CV ipuçları" },
  { href: '/bursa-cv-hazirlama', title: 'Bursa CV Hazırlama Rehberi', desc: "Bursa'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/antalya-cv-hazirlama', title: 'Antalya CV Hazırlama Rehberi', desc: "Antalya'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/konya-cv-hazirlama', title: 'Konya CV Hazırlama Rehberi', desc: "Konya'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/adana-cv-hazirlama', title: 'Adana CV Hazırlama Rehberi', desc: "Adana'da iş başvurusu için sektör ve CV ipuçları" },
  { href: '/gaziantep-cv-hazirlama', title: 'Gaziantep CV Hazırlama Rehberi', desc: "Gaziantep'te iş başvurusu için sektör ve CV ipuçları" },
  { href: '/denizli-cv-hazirlama', title: 'Denizli CV Hazırlama: Tekstil ve Turizmin Buluştuğu Şehirde İş Başvurusu', desc: "Denizli'de iş başvurusu için CV nasıl hazırlanır? Tekstil ihracatı, Pamukkale t…" },
  { href: '/diyarbakir-cv-hazirlama', title: "Diyarbakır CV Hazırlama: Güneydoğu'nun Kamu ve Tarım Merkezinde İş Başvurusu", desc: "Diyarbakır'da iş bulmak için CV nasıl hazırlanır? Kamu, tarım, inşaat ve ticare…" },
  { href: '/eskisehir-cv-hazirlama', title: 'Eskişehir CV Hazırlama: Demiryolu, Havacılık ve Üniversite Şehri İçin Rehber', desc: "Eskişehir'de iş başvurusu için CV nasıl hazırlanır? TÜLOMSAŞ, TAI ve üniversite…" },
  { href: '/hatay-cv-hazirlama', title: "Hatay CV Hazırlama: İskenderun ve Antakya'da İş Başvurusu Rehberi 2026", desc: "Hatay'da iş bulmak için CV nasıl hazırlanır? İskenderun limanı, ISDEMIR ve turi…" },
  { href: '/istanbul-anadolu-yakasi-cv-rehberi', title: 'İstanbul Anadolu Yakası CV Rehberi: Kadıköy, Ataşehir, Ümraniye, Pendik ve Tuzla', desc: "İstanbul Anadolu Yakası'nda iş başvurusu için CV nasıl hazırlanır? Kadıköy, Ata…" },
  { href: '/istanbul-avrupa-yakasi-cv-rehberi', title: 'İstanbul Avrupa Yakası CV Rehberi: Levent, Maslak, Şişli ve Beylikdüzü İş Başvurusu', desc: "İstanbul Avrupa Yakası'nda iş başvurusu için CV nasıl hazırlanır? Levent, Masla…" },
  { href: '/istanbul-yeni-mezun-is-bulma-rehberi', title: "İstanbul'da Yeni Mezun İş Bulma Rehberi: CV, Başvuru ve Mülakat Adımları", desc: "İstanbul'da yeni mezun olarak iş nasıl bulunur? Staj ve projelerle güçlü CV yaz…" },
  { href: '/kayseri-cv-hazirlama', title: "Kayseri CV Hazırlama: Anadolu'nun Sanayi Kentiyle Doğru İş Başvurusu", desc: "Kayseri'de iş başvurusu için CV nasıl hazırlanır? Mobilya, tekstil, savunma san…" },
  { href: '/kocaeli-cv-hazirlama', title: "Kocaeli CV Hazırlama: Türkiye'nin Sanayi Kalbi İzmit'te İş Başvurusu", desc: "Kocaeli'de iş bulmak için CV nasıl hazırlanır? Otomotiv, petrokimya ve lojistik…" },
  { href: '/malatya-cv-hazirlama', title: "Malatya CV Hazırlama: Kayısı Şehrinde ve Teknoloji Vadisi'nde İş Başvurusu", desc: "Malatya'da iş başvurusu için CV nasıl hazırlanır? Kayısı ihracatı, savunma sana…" },
  { href: '/manisa-cv-hazirlama', title: "Manisa CV Hazırlama: Ege'nin Sanayi Kenti Organize Sanayi Bölgesi İş Rehberi", desc: "Manisa'da iş başvurusu için CV nasıl hazırlanır? Elektronik, mobilya, tarım ve…" },
  { href: '/mersin-cv-hazirlama', title: "Mersin CV Hazırlama: Akdeniz'in Serbest Ticaret Bölgesinde İş Başvurusu", desc: "Mersin'de iş başvurusu için CV nasıl hazırlanır? Mersin Limanı, serbest ticaret…" },
  { href: '/samsun-cv-hazirlama', title: "Samsun CV Hazırlama: Karadeniz'in Sanayi Kenti İçin İş Başvurusu Rehberi", desc: "Samsun'da iş bulmak için CV nasıl hazırlanır? Tekstil, liman, tütün ve kamu sek…" },
  { href: '/sanliurfa-cv-hazirlama', title: "Şanlıurfa CV Hazırlama: GAP'ın Kalbinde Tarım ve Turizm İş Başvurusu Rehberi", desc: "Şanlıurfa'da iş bulmak için CV nasıl hazırlanır? GAP tarım projeleri, turizm ve…" },
  { href: '/trabzon-cv-hazirlama', title: "Trabzon CV Hazırlama: Karadeniz'in Liman Şehrinde İş Başvurusu Rehberi", desc: "Trabzon'da iş bulmak için CV nasıl hazırlanır? Liman, inşaat, fındık sanayii ve…" },
];

interface LandingProps {
  onStart: () => void;
  onApplyStarter?: (data: CVData) => void;
  onImport?: () => void;
}

export default function Landing({ onStart, onApplyStarter, onImport }: LandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [allStarters, setAllStarters] = useState(false);
  const features = [
    { icon: FileUp, title: 'Mevcut CV\'nizi Yükleyin', desc: 'PDF, Word veya LinkedIn profilinizi yükleyin; bilgileriniz forma otomatik dolsun. Sıfırdan yazmadan, tek tıkla yeni şablona taşıyın.' },
    { icon: Target, title: 'İlana Özel CV (ücretli paketlerde)', desc: 'İlanı yapıştırın: özet, başarı maddeleri ve ön yazı o ilana göre yeniden yazılır, olası mülakat soruları çıkarılır. Her ilana aynı CV’yi göndermeyin.' },
    { icon: Target, title: 'Ücretsiz İlan Eşleştirme', desc: 'İlan metnini yapıştırın; uyum yüzdenizi ve eksik anahtar kelimeleri görün. Tarayıcınızda hesaplanır.' },
    { icon: Brain, title: 'CV Kalite Kontrolü', desc: 'Her başarı maddesi renkle puanlanır: rakamlı mı, yeterince açık mı? Doldurulmamış [X] kalırsa PDF öncesi uyarır.' },
    { icon: Shield, title: 'Türkiye\'ye Özel Alanlar', desc: 'Askerlik, ehliyet (B, C, CE, SRC, psikoteknik), KPSS/YDS, referanslar ve fotoğraf. Doğum tarihi ve medeni durumu isterseniz gizleyin.' },
    { icon: Users, title: '18 Meslek İçin Hazır Örnek', desc: 'Muhasebe (Logo, Mikro, Luca), şoför, öğretmen, hemşire, kasiyer, garson, teknisyen ve daha fazlası: kendi bilginizle düzenleyin.' },
    { icon: Briefcase, title: 'Başvuru Takibi', desc: 'Hangi ilana hangi CV ile başvurduğunuzu, mülakat ve teklif durumunu tek yerde izleyin; takip zamanı gelince hatırlatsın.' },
    { icon: FileCheck, title: '5 Şablon + İngilizce CV', desc: 'ATS Sade, Modern, Klasik, Yan Sütun ve Minimal. Tek tıkla İngilizce başlıklar; bölüm sırası ve yoğunluk kontrolü.' },
    { icon: Lock, title: 'Şeffaf Fiyat', desc: 'Kayıt yok, otomatik yenileme yok. Önizleme ücretsiz; filigransız PDF için tek seferlik paket.' },
  ];

  const stats = [
    { value: '5', label: 'Şablon (ATS dahil)' },
    { value: '18', label: 'Meslek Örneği' },
    { value: 'PDF', label: 'Word · LinkedIn içe aktar' },
    { value: '0₺', label: 'Canlı Önizleme' },
  ];

  const faqs = [
    {
      q: 'CVDoldur ücretsiz mi?',
      a: 'CV oluşturma, tüm şablonlar, canlı önizleme, CV kalite skoru, ilan eşleştirme, başvuru takibi, günde 2 CV içe aktarma ve günde 3 AI yazım hakkı ücretsizdir. Filigransız PDF ve AI ile ilana özel CV uyarlama için paket gerekir (7 günlük ₺59, 30 günlük ₺149). Otomatik yenileme veya gizli abonelik yoktur.'
    },
    {
      q: 'Eski CV\'mi veya LinkedIn profilimi yükleyebilir miyim?',
      a: 'Evet. "Mevcut CV\'mi yükle" ile PDF, Word (.docx) veya metin yükleyin; LinkedIn için profilinizde "Diğer → PDF olarak kaydet" ile indirdiğiniz PDF\'i kullanın. Dosya tarayıcınızda okunur, sunucuya yüklenmez; yalnızca çıkarılan metin bölümlere ayrılmak üzere yapay zekaya gönderilir ve saklanmaz. Aktarımdan sonra her bölümü kontrol etmeniz önerilir. Taranmış (fotoğraf) PDF\'ler okunamaz.'
    },
    {
      q: 'İngilizce CV hazırlayabilir miyim?',
      a: 'Evet. Tasarım adımında CV dilini "English" seçtiğinizde tüm başlıklar ve sabit ifadeler (ör. askerlik, ehliyet, dil seviyesi) İngilizce yazılır. İçeriği İngilizce yazmanız gerekir; AI özellikleri de seçilen dilde yazar.'
    },
    {
      q: 'CV kalite skoru ne demek, ATS puanı mı?',
      a: 'Hayır. CV kalite skoru, CV\'nizin eksiksizliğini ve içerik kalitesini (iletişim bilgisi geçerli mi, başarılar rakamla desteklenmiş mi, doldurulmamış [X] kaldı mı vb.) ölçer. Belirli bir ilana uyumunuzu görmek için İlan adımında ilan metnini yapıştırın; anahtar kelime uyum yüzdesi ayrıca hesaplanır. Hiçbir araç belirli bir şirketin ATS sonucunu garanti edemez.'
    },
    {
      q: 'İlana özel CV ne işe yarar, neden para vermeliyim?',
      a: 'Aynı CV ile her ilana başvurmak, ilanın istediği kelimeleri ve öncelikleri kaçırmanıza neden olur. Premium ile ilan metnini yapıştırırsınız; özet, başarı maddeleri ve ön yazı o ilana göre yeniden yazılır, olası mülakat soruları hazırlanır. Yalnızca CV\'nizdeki gerçek bilgiler kullanılır ve hiçbir şey siz onaylamadan CV\'ye yazılmaz. Ücretsiz sürümde ilan eşleştirme ve uyum yüzdesi zaten vardır; ücretli kısım, bu eksikleri sizin yerinize yazmasıdır.'
    },
    {
      q: 'Cihaz değiştirirsem veya tarayıcı verilerini silersem erişimim kaybolur mu?',
      a: 'Hayır. Ödeme sonrası size bir sipariş kodu gösterilir (e-posta ayarlıysa e-postayla da gider). Menüden "Satın alımı geri yükle" bölümüne bu kodu ve ödemede kullandığınız e-postayı girerek 30 günlük erişiminizi geri getirirsiniz.'
    },
    {
      q: 'ATS uyumlu ne demek?',
      a: 'Büyük şirketlerin kullandığı Applicant Tracking System robotları CV\'nizi okuyabilir. CVDoldur tek sütunlu, standart başlıklı ve anahtar kelime dostu şablonlar sunar.'
    },
    {
      q: 'Fotoğraf ve askerlik durumu zorunlu mu?',
      a: 'Hayır, opsiyoneldir. Ancak Türkiye\'deki birçok işveren (özellikle yerli şirketler) fotoğraflı CV ve erkek adaylarda askerlik durumu bekler. İstediğiniz gibi ekleyebilir veya çıkarabilirsiniz.'
    },
    {
      q: 'Hangi formatlarda indirebilirim?',
      a: 'Filigransız A4 PDF (paketle; bilgisayarda metinli PDF, telefonda isterseniz tek dokunuşla görsel PDF).'
    },
    {
      q: 'Verilerim güvende mi?',
      a: 'CV bilgileriniz ve başvuru takip kayıtlarınız tarayıcınızda (localStorage) tutulur. AI özelliklerini kullandığınızda yalnızca ilgili alanlar (ör. unvan, deneyim özeti; CV içe aktarmada ise CV metni) AI isteği için sunucumuz üzerinden yapay zeka sağlayıcısına iletilir ve CV\'niz sunucumuzda saklanmaz. Ödeme yaptığınızda e-posta adresiniz ve sipariş kaydınız tutulur. Ayrıntılar için Gizlilik Politikası ve KVKK Aydınlatma Metni sayfalarına bakın.'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-[1180px] mx-auto h-16 lg:h-[72px] flex items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-600/30">C</div>
            <span className="font-bold text-xl tracking-tight leading-none">CV<span className="text-teal-300">Doldur</span></span>
          </a>
          <nav className="hidden lg:flex items-center self-stretch gap-1 ml-auto" aria-label="Ana menü">
            {NAV.map((c) => (
              <div key={c.id} className="relative group flex items-center self-stretch">
                <button type="button" className="px-3 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 group-hover:bg-white/10 group-hover:text-white rounded-[10px] whitespace-nowrap">{c.label} <span aria-hidden="true">▾</span></button>
                <div className="hidden group-hover:block group-focus-within:block absolute right-0 top-full z-[60]">
                  <div className="w-60 max-h-[70vh] overflow-auto bg-white text-slate-700 rounded-2xl shadow-2xl p-2">
                    {c.items.slice(0, 9).map((i) => (
                      <a key={i.href} href={i.href} className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 hover:text-teal-700">{i.label}</a>
                    ))}
                    <a href={`/rehberler#${c.id}`} className="block mt-1 px-3 py-2 text-sm font-semibold text-teal-700 border-t border-slate-200">Tümünü gör →</a>
                  </div>
                </div>
              </div>
            ))}
            <a href="#fiyatlar" className="px-3 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-[10px]">Fiyatlar</a>
            <a href="/iletisim" className="px-3 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-[10px]">İletişim</a>
          </nav>
          <button onClick={onStart} className="ml-auto lg:ml-2 px-5 py-[13px] bg-white text-teal-900 rounded-xl text-sm font-bold leading-none hover:bg-teal-50 transition shadow-lg shadow-black/20 whitespace-nowrap">
            <span className="sm:hidden">CV Oluştur</span><span className="hidden sm:inline">Ücretsiz CV Oluştur</span>
          </button>
          <button type="button" aria-label="Menü" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -mr-2">
            <span className="block w-6 h-0.5 bg-white mb-1.5" /><span className="block w-6 h-0.5 bg-white mb-1.5" /><span className="block w-6 h-0.5 bg-white" />
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full z-40 bg-slate-900 border-t border-white/10 px-4 py-3 max-h-[75vh] overflow-auto">
            {NAV.map((c) => (
              <details key={c.id} className="border-b border-white/10">
                <summary className="py-3 font-semibold cursor-pointer">{c.label}</summary>
                <div className="pb-3 pl-2 grid">
                  {c.items.slice(0, 9).map((i) => (<a key={i.href} href={i.href} className="py-1.5 text-sm text-slate-300">{i.label}</a>))}
                  <a href={`/rehberler#${c.id}`} className="py-1.5 text-sm text-teal-300 font-semibold">Tümünü gör →</a>
                </div>
              </details>
            ))}
            <a href="#fiyatlar" onClick={() => setMenuOpen(false)} className="block py-3 font-semibold border-b border-white/10">Fiyatlar</a>
            <a href="/iletisim" className="block py-3 font-semibold">İletişim</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #0d9488 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1e40af 0%, transparent 40%)'
        }} />
        

        <section className="relative max-w-6xl mx-auto px-4 pt-14 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 border border-teal-400/30 text-teal-200 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <Star size={14} className="fill-current text-amber-400" />
            Yeni · Mevcut CV'nizi yükleyin, 30 saniyede yenileyin
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            Profesyonel CV'nizi<br />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
              3 Dakikada Oluşturun
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            ATS uyumlu şablonlar, iş ilanına göre eşleştirme ve kalite kontrolü.
            Türkiye'ye özel alanlar, 18 meslek örneği, fiyatlar baştan açık.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4">
            <button
              onClick={onStart}
              className="group w-full sm:w-auto justify-center flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-semibold text-lg hover:bg-teal-400 transition shadow-xl shadow-teal-500/30 hover:-translate-y-1"
            >
              Ücretsiz CV Oluştur
              <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </button>
            {onImport && (
              <button
                onClick={onImport}
                className="w-full sm:w-auto justify-center flex items-center gap-2.5 px-7 py-4 bg-white/10 border border-white/25 text-white rounded-2xl font-semibold text-lg hover:bg-white/15 transition"
              >
                <FileUp size={20} />
                Mevcut CV'mi yükle
              </button>
            )}
          </div>
          <p className="text-sm text-slate-400 mb-14">Kayıt yok • Önizleme ücretsiz • PDF, Word veya LinkedIn PDF'i • Paketler ₺59’dan</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl py-4 px-3">
                <div className="text-2xl sm:text-3xl font-bold text-teal-300">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* Role starters */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1 text-center">Mesleğinizi seçin</h2>
          <p className="text-sm text-slate-500 text-center mb-4">Mesleğinize uygun örnekle 10 saniyede başlayın; [X] yazan yerlere kendi gerçek bilgilerinizi yazın</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(allStarters ? starters : starters.slice(0, 6)).map((s) => (
              <button
                key={s.id}
                onClick={() => onApplyStarter ? onApplyStarter(s.apply()) : onStart()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-center"
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{s.label}</span>
                <span className="text-[11px] text-slate-500">{s.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
            {!allStarters && (
              <button onClick={() => setAllStarters(true)} className="text-sm text-teal-700 font-semibold hover:underline">
                Tüm meslekleri göster ({starters.length}) ↓
              </button>
            )}
            <button onClick={onStart} className="text-sm text-teal-700 font-medium hover:underline">
              Boş formla başla →
            </button>
            {onImport && (
              <button onClick={onImport} className="text-sm text-teal-700 font-medium hover:underline">
                Mevcut CV'mi yükle →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}

      <section id="ozellikler" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Neden CVDoldur?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Türkiye iş piyasasına göre hazırlanmış, sade ve hızlı bir CV deneyimi.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-slate-900 mb-12">Nasıl Çalışır?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Yükle veya Doldur', desc: 'Mevcut CV\'nizi yükleyin ya da mesleğinize uygun örnekle adım adım doldurun.' },
              { step: '02', title: 'İlana Göre Güçlendir', desc: 'İlanı yapıştırın, eksik anahtar kelimeleri ve CV kalite skorunuzu görün.' },
              { step: '03', title: 'PDF İndir, Takip Et', desc: 'Şablon seçin, PDF\'inizi indirin; başvurularınızı tek yerden takip edin.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-teal-200 mb-3">{item.step}</div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CV Rehberleri (SEO iç bağlantıları) */}
      <section id="rehberler" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-slate-900 mb-3">
          CV Yazım Rehberleri
        </h2>
        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
          Örnek CV'ler ve adım adım rehberlerle başvurunuzu güçlendirin.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((g) => (
            <a
              key={g.href}
              href={g.href}
              className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-500 hover:shadow-md transition"
            >
              <div className="font-semibold text-slate-900 mb-1">{g.title}</div>
              <div className="text-sm text-slate-500">{g.desc}</div>
            </a>
          ))}
        </div>

        <h3 className="font-display text-2xl font-bold text-center text-slate-900 mt-14 mb-6">
          Meslek Bazlı CV Örnekleri
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleGuides.map((g) => (
            <a
              key={g.href}
              href={g.href}
              className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-teal-500 hover:shadow-md transition"
            >
              <div className="font-semibold text-slate-900 mb-1 text-sm">{g.title}</div>
              <div className="text-xs text-slate-500">{g.desc}</div>
            </a>
          ))}
        </div>

        <h3 className="font-display text-2xl font-bold text-center text-slate-900 mt-14 mb-6">
          Şehre Göre CV Rehberleri
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cityGuides.slice(0, 8).map((g) => (
            <a
              key={g.href}
              href={g.href}
              className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-teal-500 hover:shadow-md transition"
            >
              <div className="font-semibold text-slate-900 mb-1 text-sm">{g.title}</div>
              <div className="text-xs text-slate-500">{g.desc}</div>
            </a>
          ))}
        </div>
        {cityGuides.length > 8 && (
          <details className="mt-4 group">
            <summary className="list-none cursor-pointer text-center text-sm font-semibold text-teal-700 hover:underline">
              <span className="group-open:hidden">Tüm şehirleri göster ({cityGuides.length}) ↓</span>
              <span className="hidden group-open:inline">Daha az göster ↑</span>
            </summary>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 mt-4">
              {cityGuides.slice(8).map((g) => (
                <a key={g.href} href={g.href} className="block text-sm text-slate-700 hover:text-teal-700 py-1.5 border-b border-slate-100">
                  {g.title.split(':')[0]}
                </a>
              ))}
            </div>
          </details>
        )}

        <div className="mt-14 bg-gradient-to-br from-slate-900 to-teal-900 rounded-3xl p-8 text-center text-white">
          <h3 className="font-display text-2xl font-bold mb-2">CV'nizi Uzman Gözüyle Kontrol Ettirin</h3>
          <p className="text-teal-100 mb-5 max-w-xl mx-auto">İlana özel, ATS uyumlu CV incelemesi veya sıfırdan profesyonel CV yazımı.</p>
          <a href="/profesyonel-cv-hazirlama-hizmeti" className="inline-block bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition">
            Profesyonel CV Hizmeti
          </a>
        </div>
      </section>

      {/* FAQ SEO */}
      <section id="fiyatlar" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Fiyatlar</h2>
          <p className="text-slate-600">Abonelik yok, otomatik yenileme yok. Ödeme PayTR güvencesiyle, kart bilgisi bizde saklanmaz.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: 'Ücretsiz', price: '₺0', note: 'Önizleme ve düzenleme', items: ['CV oluşturma, canlı önizleme (filigranlı)', '5 şablon, CV kalite skoru', 'CV içe aktarma (günde 2)', 'İlan eşleştirme (uyum %)', 'Başvuru takibi', 'Günlük 3 AI hakkı', '1 CV profili'] },
            { name: 'Başlangıç', price: '₺59', note: '7 gün · tek seferlik', items: ['İlana özel CV uyarlama (günde 8 ilana kadar)', 'Filigransız PDF, tüm şablonlar', '3 CV profili', 'Ön yazı ve mülakat soruları'] },
            { name: 'Pro', price: '₺149', note: '30 gün · tek seferlik', best: true, items: ['İlana özel CV uyarlama (günde 20 ilana kadar)', 'Filigransız PDF, tüm şablonlar', '10 CV profili: her ilana ayrı CV', 'Ön yazı ve mülakat soruları', 'Sipariş koduyla erişimi geri yükleme'] },
            { name: 'Pro+', price: '₺499', note: '30 gün · tek seferlik', items: ['Başkaları için CV hazırlama ve teslim hakkı', 'İlana özel CV uyarlama (günde 66 ilana kadar)', '40 müşteri/CV profili', 'Kırtasiye, kariyer danışmanı, kurs için'] },
          ].map((pl) => (
            <div key={pl.name} className={`relative rounded-2xl p-6 bg-white border-2 ${pl.best ? 'border-teal-500 shadow-lg' : 'border-slate-200'}`}>
              {pl.best && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">EN POPÜLER</span>}
              <h3 className="font-semibold text-slate-900">{pl.name}</h3>
              <p className="text-4xl font-bold text-slate-900 mt-2">{pl.price}</p>
              <p className="text-xs text-slate-500 mb-4">{pl.note}</p>
              <ul className="space-y-2 mb-5">
                {pl.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 size={15} className="text-teal-600 shrink-0 mt-0.5" />{it}</li>
                ))}
              </ul>
              <button onClick={onStart} className={`w-full py-2.5 rounded-xl text-sm font-semibold ${pl.best ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                {pl.price === '₺0' ? 'Ücretsiz başla' : 'CV oluştur, sonra satın al'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 mt-5">AI hakkı adil kullanım içindir: bir ilan uyarlaması 3 hak sayılır. Planlar kişisel kullanım içindir; başkaları için CV hazırlamak yalnızca Pro+ planında serbesttir.</p>
        <p className="text-center text-xs text-slate-500 mt-6">
          Dijital hizmettir; ödeme sonrası anında ifa edilir. <a href="/mesafeli-satis-sozlesmesi" className="underline">Mesafeli Satış Sözleşmesi</a> · <a href="/iptal-ve-iade" className="underline">İptal ve İade</a> · <a href="/iletisim" className="underline">İletişim</a>
        </p>
      </section>

      <section id="sss" className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="font-display text-3xl font-bold text-center text-slate-900 mb-10">
          Sıkça Sorulan Sorular
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-medium text-slate-900 hover:bg-slate-50 list-none">
                {faq.q}
                <span className="text-teal-600 group-open:rotate-45 transition text-xl">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-10 sm:p-14 text-white text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 relative">
            Hayalinizdeki İşi Yakalamaya Hazır mısınız?
          </h2>
          <p className="text-teal-100 mb-8 text-lg max-w-lg mx-auto relative">
            Profesyonel CV'nizi 3 dakikada hazırlayın ve önizleyin.
          </p>
          <button
            onClick={onStart}
            className="relative px-8 py-4 bg-white text-teal-900 rounded-2xl font-semibold text-lg hover:bg-teal-50 transition shadow-lg"
          >
            Hemen Ücretsiz Başla
          </button>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-slate-300 pt-14 pb-7 px-4 sm:px-6">
        <div className="max-w-[1180px] mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-600/30">C</div>
              <span className="font-bold text-white text-xl tracking-tight leading-none">CV<span className="text-teal-300">Doldur</span></span>
            </a>
            <p className="text-[13px] text-slate-400 leading-relaxed my-3.5 max-w-[300px]">Türkiye için tasarlanmış, yapay zeka destekli CV oluşturucu. Önizleme ve düzenleme ücretsiz; üyelik ve otomatik yenileme yok.</p>
            <button onClick={onStart} className="px-5 py-[13px] bg-white text-teal-900 rounded-xl text-sm font-bold leading-none hover:bg-teal-50 transition shadow-lg shadow-black/20">Ücretsiz CV Oluştur</button>
          </div>
          {NAV.slice(0, 3).map((c) => (
            <div key={c.id}>
              <h4 className="text-white font-semibold text-sm mb-3">{c.label}</h4>
              {c.items.slice(0, 7).map((i) => (<a key={i.href} href={i.href} className="block text-[13px] py-1 text-slate-300 hover:text-teal-300">{i.label}</a>))}
              <a href={`/rehberler#${c.id}`} className="block text-[13px] py-1 text-teal-300 font-semibold">Tümü →</a>
            </div>
          ))}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Kurumsal</h4>
            <a href="/rehberler" className="block text-[13px] py-1 text-slate-300 hover:text-teal-300">Tüm Rehberler</a>
            <a href="/profesyonel-cv-hazirlama-hizmeti" className="block text-[13px] py-1 text-slate-300 hover:text-teal-300">Profesyonel CV Hizmeti</a>
            {LEGAL_LINKS.map((l) => (<a key={l.href} href={l.href} className="block text-[13px] py-1 text-slate-300 hover:text-teal-300">{l.label}</a>))}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-9 pt-[18px] border-t border-white/[0.12] text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-between gap-4">
          <p className="m-0 leading-relaxed text-center sm:text-left">© 2026 CVDoldur · Kişisel veriler KVKK kapsamında işlenir · Kart bilgisi sitede saklanmaz</p>
          <a href="https://www.akodijital.com" target="_blank" rel="noopener" aria-label="AKO Dijital: tasarım ve geliştirme"
            className="group inline-flex items-center gap-3 rounded-[14px] border border-amber-400/35 bg-white/[0.04] py-2.5 pl-3 pr-4 text-slate-200 no-underline transition hover:border-amber-400 hover:bg-amber-400/10 hover:shadow-[0_0_0_3px_rgba(251,191,36,.15),0_8px_24px_rgba(0,0,0,.35)] focus-visible:border-amber-400">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 transition-transform duration-700 group-hover:rotate-[360deg] motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4L12 19.5l-2.4-6.1-6.1-2.4 6.1-2.4z" /></svg>
            </span>
            <span className="flex flex-col leading-tight">
              <small className="text-[9px] font-semibold tracking-[.14em] text-amber-400">TASARIM VE GELİŞTİRME</small>
              <b className="text-[15px] font-bold text-white group-hover:underline underline-offset-4">AKO Dijital</b>
              <em className="text-[11px] not-italic text-slate-400 group-hover:underline underline-offset-4">www.akodijital.com</em>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
