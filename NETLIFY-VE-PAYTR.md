# Yayına alma: Netlify ayarları ve PayTR kontrol listesi

## 1. Netlify ortam değişkenleri (Site settings → Environment variables)

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | Evet | AI özellikleri ve CV içe aktarma |
| `TOKEN_SECRET` | Evet | En az 16 karakter, rastgele. Erişim anahtarlarını imzalar. **Değiştirirseniz mevcut alıcıların erişimi düşer** (sipariş koduyla geri yükleyebilirler). |
| `PAYTR_MERCHANT_ID` / `PAYTR_MERCHANT_KEY` / `PAYTR_MERCHANT_SALT` | Evet | PayTR panelinden |
| `PAYTR_TEST_MODE` | Evet | Testte `1`, **canlıda `0`** |
| `SITE_URL` | Önerilir | `https://cvdoldur.com.tr` (ödeme dönüş adresleri için) |
| `ADMIN_KEY` | Önerilir | En az 12 karakter. İstatistik: `/.netlify/functions/stats?key=...` |
| `RESEND_API_KEY` + `MAIL_FROM` | İsteğe bağlı | Sipariş kodunu e-postayla göndermek için |
| `FREE_AI_DAILY_CAP` | İsteğe bağlı | Tüm ücretsiz kullanıcıların günlük toplam AI tavanı (vars. 400). İçe aktarma da bundan düşer. |
| `IMPORT_FREE_PER_DAY` | İsteğe bağlı | **Yeni.** IP başına günlük ücretsiz içe aktarma (vars. 2) |
| `IMPORT_MODEL` / `TAILOR_MODEL` | İsteğe bağlı | Varsayılan `claude-haiku-4-5-20251001` |

Yayından önce: `npm ci && npm run typecheck && npm run build && python3 kontrol.py`

## 2. PayTR görüşmesi için kontrol listesi

**Bildirim URL'si** (PayTR panelinde tanımlanacak):
`https://cvdoldur.com.tr/.netlify/functions/paytr-callback`

Sorulacaklar / teyit edilecekler:

1. **Bildirimde (callback) `payment_amount` alanı geliyor mu?** Kod önce `payment_amount`a, yoksa `total_amount`a bakar ve sipariş tutarından az ise erişim vermez. İkisi de çalışır; teyit iyi olur.
2. **`total_amount` kuruş cinsinden mi ve taksit farkı dahil mi?** (Kod: tahsil edilen ≥ sipariş tutarı ise kabul.)
3. **iFrame API** ile çalışıyoruz; ödeme sonrası `merchant_ok_url` = `https://cvdoldur.com.tr/?odeme=ok&oid=...`. Alan adının panelde tanımlı olması gerekiyor mu?
4. **`user_phone` ve `user_address`** şu an sabit (`05000000000`, `Türkiye`) gönderiliyor. PayTR gerçek telefon/adres istiyor mu? İsterse ödeme penceresine telefon alanı eklenmeli.
5. **Taksit**: `max_installment=12` gönderiliyor. 59-149 ₺ için taksit kapatılsın mı (`no_installment=1`)?
6. **Dijital hizmet / cayma hakkı**: Mesafeli satış sözleşmesi ve "anında ifa, cayma hakkı yok" onay kutusu ödeme öncesinde var; PayTR'nin istediği ek metin var mı?
7. Test kartı ile **test modunda** bir ödeme → panelde "bildirim başarılı" görünmeli → sitede paket aktif olmalı. Sonra `PAYTR_TEST_MODE=0`.
8. İade akışı: iade PayTR panelinden yapılırsa sitedeki erişim otomatik kapanmaz (erişim süreyle biter). Kabul edilebilir mi, not edin.

## 3. Yayın sonrası 5 dakikalık kontrol

- [ ] Ana sayfa açılıyor, favicon "C"
- [ ] "Mevcut CV'mi yükle" → bir PDF CV → bilgiler forma doluyor (ANTHROPIC_API_KEY doğru)
- [ ] Bir meslek rehber sayfasından "Ücretsiz CV Oluştur" → o mesleğin örneği açılıyor
- [ ] Test ödemesi → paket aktif → filigransız PDF
- [ ] Ön yazı ekleyip PDF al → ön yazı 2. sayfada
- [ ] `/.netlify/functions/stats?key=ADMIN_KEY` açılıyor, `import_ai` sayılıyor
