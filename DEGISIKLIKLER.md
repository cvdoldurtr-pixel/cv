# CVDoldur v9.0.0 — Değişiklikler

## Önceki sürümde bulunan ve düzeltilen hatalar

| Hata | Etkisi | Durum |
|---|---|---|
| **Ön yazılı PDF'te CV ile ön yazı aynı sayfaya üst üste basılıyordu** | Ön yazı ekleyip PDF alan herkes okunamaz bir PDF alıyordu | Düzeltildi: ön yazı 2. sayfada |
| **Uzun CV'de "İş Deneyimi" bölümü komple 2. sayfaya atlıyordu** | 1. sayfa yarı boş kalıyordu | Düzeltildi: maddeler sayfalar arasında doğal bölünüyor |
| Ücretsiz önizlemede filigran sayfadan taşıp PDF'i %77'ye küçültüyordu | Önizleme PDF'i dar görünüyordu | Düzeltildi |
| Ön yazıda "Saygılarımla" ve ad iki kez çıkıyordu | Profesyonel görünmüyordu | Düzeltildi |
| İngilizce CV seçeneği vardı ama başlıklar hep Türkçe çıkıyordu | İngilizce CV hazırlanamıyordu | Düzeltildi: Tasarım → CV dili |
| Hazır örneklerde dil seviyesi "Ana dil", listede "Ana Dili" | Seçim kutusu yanlış seviye gösteriyordu | Düzeltildi (eski kayıtlar da otomatik düzeltilir) |
| Klasik şablonda medeni durum yalnızca doğum tarihi varsa görünüyordu; Minimal şablonda askerlik/doğum hiç yoktu | Tutarsız şablonlar | Düzeltildi |
| Bölüm sırası yalnızca Modern şablonda çalışıyordu | | Artık tüm tek sütunlu şablonlarda çalışıyor |
| Telefonda A4 önizleme ekrandan taşıyordu | Yatay kaydırma gerekiyordu | Önizleme ekrana sığacak şekilde ölçekleniyor |
| Favicon hâlâ "E" (eski EliteCV) | | "C" yapıldı |
| Geri yükleme metni her pakette "30 gün" diyordu | 7 günlük pakette yanıltıcıydı | Düzeltildi |

## Yeni özellikler

1. **Mevcut CV'yi yükle (PDF / Word / LinkedIn)**
   - Dosya tarayıcıda okunur (sunucuya yüklenmez); metin AI ile bölümlere ayrılır, forma dolar.
   - LinkedIn: profil → "Diğer" → "PDF olarak kaydet" ile inen PDF yüklenir.
   - Ücretsiz: günde 2 içe aktarma (IP başına). Paketlerde AI hakkından 1 düşer.
   - AI kullanılamazsa (limit dolmuş, bağlantı yok) ad, e-posta, telefon, LinkedIn kural tabanlı yöntemle yine doldurulur.
   - Taranmış (fotoğraf) PDF'lerde açıklayıcı hata verir.
   - Ana sayfa: `/?import=1` bağlantısı pencereyi doğrudan açar.
2. **CV Kalite Skoru** ("CV Hazırlık" puanının yerine): içerik kalitesini ölçer.
   - Kırmızı/sarı/gri önem seviyeleri, doldurulmamış **[X]** yer tutucu kontrolü, geçersiz e-posta/telefon, özet uzunluğu, rakamlı başarı oranı.
   - Yeni mezun/öğrenci CV'leri haksız yere düşük puan almaz.
   - PDF indirmeden önce **[X]** kaldıysa uyarır.
3. **Başarı maddesi göstergesi**: her maddenin yanında yeşil (rakamlı), sarı (iyi), kırmızı (zayıf / [X]) nokta ve ipucu. Maddeler tek tek silinebilir, deneyimler yukarı/aşağı taşınabilir.
4. **Türkiye'ye özel alanlar**: sürücü belgesi (A, B, C, CE, D, E, SRC, Psikoteknik…), çalışma tercihi (ofis/hibrit/uzaktan), seyahat, işe başlama zamanı, **referanslar** ("istenildiğinde verilecektir" seçeneğiyle), "Sertifikalar ve Sınavlar" (KPSS, YDS, ALES…).
5. **Doğum tarihi / medeni durum / askerlik için "CV'de göster" anahtarı**. Yeni CV'lerde doğum tarihi ve medeni durum varsayılan olarak gizli. **Eski kullanıcıların CV'si değişmez**: dolu alanlar görünür kalır.
6. **5. şablon: ATS Sade**: tek sütun, standart başlıklar, ikon/çubuk yok. Büyük şirketler için önerilir.
7. **İngilizce CV**: tüm başlıklar ve sabit ifadeler (askerlik, ehliyet, dil seviyesi, derece) İngilizceye çevrilir.
8. **18 meslek başlangıcı** (önceden 4): muhasebe (Logo, Mikro, Luca, ETA), şoför (SRC, psikoteknik), öğretmen (formasyon, KPSS), hemşire, mühendis, kasiyer, garson, grafik, İK, lojistik, sekreter, müşteri hizmetleri, teknisyen, öğrenci…
   - 17 meslek rehber sayfasındaki "Ücretsiz CV Oluştur" butonu artık o mesleğin örneğini açıyor (`role_cta.py`, `build.py` sonunda otomatik çalışır).
9. **Başvurularım (başvuru takibi)**: şirket, pozisyon, ilan linki, tarih, not, durum (Kaydedildi → Başvuruldu → Mülakat → Teklif / Olumsuz), hangi CV profiliyle başvurulduğu. 7 günü geçen başvurularda takip e-postası hatırlatması. Yalnızca tarayıcıda saklanır.
10. **PDF dosya adı otomatik**: `Ahmet-Yilmaz-Yazilim-Muhendisi-CV.pdf`
11. **Telefon deneyimi**: Düzenle / Önizle sekmesi (skor rozetiyle), ekrana sığan önizleme, sabit İleri/Geri çubuğu, sadeleştirilmiş başlık menüsü.
12. **Profiller**: aynı adla kaydedince üzerine yazar (hak harcamaz), kullanım "3/10" gibi gösterilir.
13. **Erişilebilirlik**: form etiketleri `htmlFor/id`, hata mesajları `aria-describedby`, ikon butonlarına `aria-label`, menüler Esc/dışarı tıklama ile kapanır, adımlar klavyeyle gezilebilir.

## Güvenlik ve altyapı

- **PayTR bildiriminde tutar doğrulaması**: hash doğrulamasına ek olarak, tahsil edilen tutar sipariş tutarından azsa erişim verilmez (`amount_mismatch`, istatistikte `paid_mismatch`). Sipariş tutarı artık sipariş kaydında saklanıyor.
- Güvenlik başlıkları: HSTS, Permissions-Policy, CSP'ye `base-uri` ve `object-src` eklendi (iletişim formu ve PayTR iframe'i etkilenmez).
- Kullanılmayan `framer-motion` kaldırıldı. `fflate` güvenlik açığı olmayan 0.8.3 sürümünde.
- Editör ve pencereler ihtiyaç anında yükleniyor: ana sayfanın ilk JS'i **114 KB → 107 KB** (gzip), özellikler artmasına rağmen.
- Gizlilik Politikası'na CV içe aktarma ve başvuru takibi maddeleri eklendi (`legal.py` + `public/gizlilik-politikasi.html`).
- Yeni istatistik olayları: `import_open`, `import_ok`, `import_ai`, `apps_open`, `paid_mismatch`.

## Test edilenler (hepsi geçti)

- `npm ci` → `npm run typecheck` → `npm run build` temiz.
- Tarayıcıda 51 uçtan uca senaryo: ana sayfa, 18 meslek, kalite skoru, e-posta doğrulama, göster/gizle anahtarları, [X] uyarısı, ücretsiz PDF kapısı, İngilizce + 5 şablon, ön yazı, başvuru takibi (yenileme sonrası kalıcılık), PDF ve Word içe aktarma (Türkçe karakter, madde işaretleri), limit dolunca yedek ayrıştırıcı, eski sürüm verisinin geçişi, mobilde taşma yok.
- 9 yazdırma senaryosu: tek sayfa, ön yazılı 2 sayfa (üst üste binme yok), uzun CV, telefonda yazdırma; PDF'te seçilebilir metin (ATS okur) doğrulandı.
- Sunucu fonksiyonları: ai-import (limit, IP ayrımı, hata durumunda hak düşmemesi, bozuk AI yanıtı), PayTR callback (doğru/eksik tutar, sahte hash, başarısız ödeme), token imzası.
