# -*- coding: utf-8 -*-
# Yasal sayfalar. build.py sonunda çalışır. SATICI BİLGİLERİNİ BURADAN DOLDURUN, sonra: python3 build.py
import html as _h, os as _os
SELLER = {
    'unvan':   'Hüseyin OLGUN (bireysel satıcı)',
    'adres':   'Cumhuriyet Mahallesi Sondurak Caddesi Kömür Sokak No: 2, Payas / Hatay',
    'vergi':   'Vergi levhası bulunmamaktadır (bireysel satıcı)',
    'telefon': '0542 721 70 85',
    'eposta':  'cvdoldurtr@gmail.com',
}
# Web3Forms erişim anahtarı: https://web3forms.com adresinde e-postanızı girin, gelen anahtarı buraya yapıştırın.
# Web3Forms erişim anahtarı herkese açık bir anahtardır (sitede görünmesi normaldir); yalnızca form gönderimi içindir.
WEB3FORMS_KEY = 'ed417ef1-eee7-40a4-b2b8-853f6fa42017'
_ph = any('DOLDURULACAK' in v for v in SELLER.values())
_e = lambda s: _h.escape(s, quote=True)
S = {k: _e(v) for k, v in SELLER.items()}
_AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
import datetime as _d2
_n=_d2.date.today()
UPD = f'{_n.day} {_AY[_n.month-1]} {_n.year}'

def _page(slug, title, desc, body, updated=True):
    robots = 'noindex, follow' if _ph else 'index, follow'
    return f'''<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{_e(title)} | CVDoldur</title>
  <meta name="description" content="{_e(desc)}" />
  <meta name="robots" content="{robots}" />
  <link rel="canonical" href="{SITE}/{slug}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/guide.css" />
</head>
<body>
  <header class="g-topbar"><div class="g-topbar-inner">
    <a href="/" class="g-logo"><div class="g-logo-mark">C</div><div class="g-logo-text">CV<span>Doldur</span></div></a>
    <a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a>
  </div></header>
  <main class="g-article">
    <nav class="g-crumb"><a href="/">Ana Sayfa</a> / {_e(title)}</nav>
    <h1>{_e(title)}</h1>
    {('<p class="g-lede">Son güncelleme: ' + UPD + '</p>') if updated else ''}
{body}
  </main>
  <footer class="g-footer">
    <p><a href="/gizlilik-politikasi">Gizlilik</a> · <a href="/kvkk-aydinlatma-metni">KVKK</a> · <a href="/kullanim-sartlari">Kullanım Şartları</a> · <a href="/mesafeli-satis-sozlesmesi">Mesafeli Satış</a> · <a href="/iptal-ve-iade">İptal ve İade</a> · <a href="/iletisim">İletişim</a></p>
    <p>© 2026 CVDoldur. Tüm hakları saklıdır.</p>
  </footer>
</body>
</html>
'''

_seller_box = f'''<p><strong>Satıcı / Veri Sorumlusu:</strong> {S['unvan']}<br>
<strong>Adres:</strong> {S['adres']}<br>
<strong>Vergi Dairesi / No:</strong> {S['vergi']}<br>
<strong>Telefon:</strong> {S['telefon']}<br>
<strong>E-posta:</strong> {S['eposta']}</p>'''

PAGES = {}
PAGES['gizlilik-politikasi'] = ('Gizlilik Politikası', 'CVDoldur gizlilik politikası: hangi veriler nerede tutulur, AI özelliklerinde neler paylaşılır, ödeme verileri.', f'''
    <h2>Kısaca</h2>
    <ul>
      <li>CV bilgileriniz düzenleme sırasında <strong>tarayıcınızın yerel depolamasında (localStorage)</strong> tutulur; hesap açmanız gerekmez.</li>
      <li><strong>AI özelliklerini</strong> (özet, başarı maddesi, ön yazı, ilana özel uyarlama) kullandığınızda, yalnızca o istek için gereken alanlar (ör. unvan, deneyim ve başarı maddeleri, beceriler, yapıştırdığınız iş ilanı metni, ön yazıda ad ve şirket) sunucumuz üzerinden yapay zeka sağlayıcısına (Anthropic) gönderilir. CV'niz ve ilan metni sunucumuzda saklanmaz.</li>
      <li><strong>CV içe aktarma</strong> ("Mevcut CV'mi yükle") kullandığınızda yüklediğiniz dosya (PDF/Word) sunucumuza gönderilmez; metin tarayıcınızda çıkarılır. Yalnızca bu metin, bölümlere ayrılması için sunucumuz üzerinden yapay zeka sağlayıcısına (Anthropic) iletilir ve saklanmaz. Günlük ücretsiz kullanım sınırı için IP adresiniz kısa süreli bir sayaçta kullanılır.</li>
      <li><strong>Başvuru takibi</strong> ("Başvurularım") kayıtları yalnızca tarayıcınızda tutulur; sunucumuza gönderilmez.</li>
      <li><strong>Ödeme</strong> yaptığınızda e-posta adresiniz ve sipariş kaydınız sunucumuzda tutulur; erişim kodunuzu e-postayla göndermek için bir e-posta gönderim hizmeti kullanılabilir. Kart bilgileriniz bize ulaşmaz; ödemeyi PayTR alır.</li>
    </ul>
    <h2>Hangi veriler, neden işlenir?</h2>
    <ul>
      <li><strong>CV içeriği (ad, iletişim, deneyim, eğitim vb.):</strong> yalnızca tarayıcınızda; PDF/önizleme üretmek için. AI özelliği kullanılırsa ilgili kısım geçici olarak işlenmek üzere iletilir.</li>
      <li><strong>E-posta, sipariş numarası, plan, ödeme durumu:</strong> ödemeyi doğrulamak, erişiminizi açmak, makbuz ve destek için.</li>
      <li><strong>IP adresi:</strong> günlük ücretsiz AI hakkını sınırlamak, kötüye kullanımı önlemek ve ödeme altyapısının zorunlu kıldığı işlemler için.</li>
      <li><strong>Erişim anahtarı ve sipariş kodu:</strong> ödeme sonrası tarayıcınıza yazılan imzalı anahtar ve size verilen kod; Premium/Pro süresini doğrular ve cihaz değiştirdiğinizde erişimi geri yüklemenizi sağlar.</li>
      <li><strong>Anonim kullanım sayaçları:</strong> sitenin nasıl kullanıldığını anlamak için günlük toplam olay sayıları (ör. kaç kişi siteyi açtı) tutulur. Bu sayaçlar çerez, IP adresi veya kimlik içermez ve sizinle ilişkilendirilemez.</li>
    </ul>
    <h2>Çerezler ve yerel depolama</h2>
    <p>Reklam veya izleme çerezi kullanmıyoruz. Yerel depolama yalnızca CV taslağınızı, kayıtlı profillerinizi ve erişim anahtarınızı saklamak için kullanılır. Tarayıcı verilerini temizlediğinizde bunlar silinir; bu nedenle CV'nizi "Dışa Aktar (JSON)" ile yedeklemenizi öneririz.</p>
    <h2>Paylaşılan hizmet sağlayıcılar</h2>
    <ul>
      <li><strong>Netlify</strong> — barındırma, sunucu işlevleri ve sipariş kayıtları.</li>
      <li><strong>Anthropic</strong> — AI metin üretimi ve CV içe aktarmada metnin bölümlere ayrılması (yalnızca bu özellikler kullanıldığında).</li>
      <li><strong>E-posta gönderim hizmeti</strong> — sipariş kodunuzu e-postayla iletmek için (yalnızca e-posta adresiniz ve sipariş bilgisi).</li>
      <li><strong>Web3Forms</strong> — iletişim formuna yazdığınız ad, e-posta, mesaj ve (varsa) sipariş kodunun bize e-postayla iletilmesi için. Form yalnızca siz gönderdiğinizde çalışır.</li>
      <li><strong>PayTR</strong> — ödeme altyapısı (kart bilgisini PayTR toplar ve işler).</li>
    </ul>
    <p>Bu sağlayıcıların bir kısmı yurt dışında yer alır; ayrıntı için <a href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</a>'ne bakın. Verilerinizi reklam amacıyla satmayız veya paylaşmayız.</p>
    <h2>Saklama süresi</h2>
    <p>CV verisi sunucuda saklanmaz. Sipariş kayıtları ilgili mevzuatın öngördüğü süre boyunca; günlük AI kullanım sayaçları kısa süreli tutulur.</p>
    <h2>Haklarınız ve iletişim</h2>
    <p>KVKK m.11 kapsamındaki haklarınız için <a href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</a>'ne ve <a href="/iletisim">İletişim</a> sayfasına bakabilirsiniz.</p>
    {_seller_box}''')

PAGES['kvkk-aydinlatma-metni'] = ('KVKK Aydınlatma Metni', '6698 sayılı KVKK kapsamında CVDoldur kişisel veri işleme aydınlatma metni.', f'''
    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca, veri sorumlusu olarak sizi aşağıdaki şekilde bilgilendiririz.</p>
    <h2>1. Veri sorumlusu</h2>
    {_seller_box}
    <h2>2. İşlenen veriler ve amaçlar</h2>
    <ul>
      <li><strong>Kimlik/iletişim:</strong> e-posta adresi (ödeme ve destek); AI özelliği kullanılırsa CV'de yazdığınız ad, unvan, deneyim ve beceri bilgileri (yalnızca metin üretimi için, saklanmadan).</li>
      <li><strong>İşlem güvenliği:</strong> IP adresi, sipariş numarası, ödeme durumu.</li>
      <li><strong>Müşteri işlemi:</strong> plan, ödeme tutarı ve tarihi.</li>
      <li><strong>İletişim formu:</strong> ad soyad, e-posta, mesaj içeriği ve (varsa) sipariş kodu; yalnızca talebinizi yanıtlamak için.</li>
    </ul>
    <h2>3. Hukuki sebepler</h2>
    <p>Sözleşmenin kurulması ve ifası (KVKK m.5/2-c), hukuki yükümlülüğün yerine getirilmesi (m.5/2-ç), meşru menfaat — güvenlik ve kötüye kullanımın önlenmesi (m.5/2-f).</p>
    <h2>4. Aktarım</h2>
    <p>Veriler; ödeme için PayTR'ye, barındırma için Netlify'a, AI özellikleri için Anthropic'e, iletişim formu mesajlarının iletilmesi için Web3Forms'a, sipariş kodu e-postası için e-posta gönderim hizmetine ve yasal zorunluluk halinde yetkili kurumlara aktarılabilir. Netlify ve Anthropic'in hizmet altyapısı yurt dışında bulunabildiğinden, AI özelliğini kullanmanız veya ödeme yapmanız halinde ilgili veriler yurt dışına aktarılabilir. Yurt dışı aktarım KVKK m.9 hükümlerine uygun olarak yapılır.</p>
    <h2>5. Toplama yöntemi</h2>
    <p>Veriler, sitedeki formlar, ödeme ekranı ve sunucu kayıtları aracılığıyla otomatik yolla toplanır.</p>
    <h2>6. Haklarınız (m.11)</h2>
    <p>Verinizin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içi/dışı aktarılan üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, otomatik analiz sonucuna itiraz etme ve zarar halinde giderim talep etme haklarına sahipsiniz.</p>
    <p>Başvurularınızı <a href="/iletisim">İletişim</a> sayfasındaki formdan (konu olarak "Kişisel veri (KVKK) talebi" seçerek) veya {S['eposta']} adresine yazılı olarak iletebilirsiniz. Başvurunuz, talebin niteliğine göre en geç 30 gün içinde yanıtlanır.</p>''')

PAGES['kullanim-sartlari'] = ('Kullanım Şartları', 'CVDoldur kullanım şartları: hizmetin kapsamı, AI içerik sorumluluğu, ücretli planlar ve sınırlamalar.', f'''
    <h2>1. Hizmet</h2>
    <p>CVDoldur, kullanıcıların tarayıcıda CV hazırlamasını sağlayan bir araçtır. Önizleme ücretsizdir; filigransız PDF çıktısı ve gelişmiş AI kullanımı ücretli planlarla sunulur.</p>
    <h2>2. Planlar</h2>
    <ul>
      <li><strong>Başlangıç (7 gün):</strong> ilana özel CV uyarlama, filigransız PDF, tüm şablonlar, günlük 24 AI hakkı (bir ilan uyarlaması 3 hak), 3 CV profili.</li>
      <li><strong>Pro (30 gün):</strong> Başlangıç'ın tümü, günlük 60 AI hakkı, 10 CV profili.</li>
      <li><strong>Pro+ (30 gün):</strong> Pro'nun tümü, günlük 200 AI hakkı, 40 profil ve başkaları için CV hazırlayıp teslim etme hakkı.</li>
    </ul>
    <p>Planlar otomatik yenilenmez; süre bitince erişim kapanır. Güncel fiyatlar ödeme ekranında gösterilir. AI hakları adil kullanım içindir; günlük hak her gün yenilenir. Paket süresi ödemenin onaylandığı anda başlar ve paket kullanılmasa da sürenin sonunda sona erer; kullanılmayan süre uzatılmaz.</p>
    <h2>2.1 Kişisel ve ticari kullanım</h2>
    <p>Başlangıç ve Pro planlar kişisel kullanım içindir. Başkaları için ücretli CV hazırlamak (kırtasiye, danışmanlık, kurs vb.) yalnızca Pro+ planında serbesttir; müşteriye teslim edilen CV'lerdeki bilgilerin sorumluluğu hizmeti verene aittir.</p>
    <h2>3. AI içerikleri</h2>
    <p>AI tarafından üretilen metinler öneridir; doğruluğunu ve size uygunluğunu kontrol etmek sizin sorumluluğunuzdadır. Gerçeğe aykırı bilgi, unvan veya rakam eklemeyin. Bir işe alım veya mülakat sonucu garanti edilmez; ATS uyumu, işverenin kullandığı sisteme göre değişebilir.</p>
    <h2>4. Kabul edilebilir kullanım</h2>
    <p>Hizmeti hukuka aykırı amaçlarla, otomatik toplu isteklerle, güvenlik önlemlerini aşmak için veya başkasının bilgileriyle izinsiz kullanamazsınız. Aksi halde erişim sınırlandırılabilir.</p>
    <h2>5. Fikri mülkiyet</h2>
    <p>CV içeriğiniz size aittir. Site tasarımı, şablonlar ve yazılım CVDoldur'a aittir.</p>
    <h2>6. Sorumluluk sınırı</h2>
    <p>Hizmet "olduğu gibi" sunulur; kesintisiz veya hatasız olacağı garanti edilmez. Verilerinizin tarayıcı depolamasında tutulduğunu unutmayın; düzenli yedek almanız önerilir. Yasaların izin verdiği ölçüde sorumluluğumuz ödediğiniz tutarla sınırlıdır.</p>
    <h2>7. Değişiklik ve iletişim</h2>
    <p>Şartlar güncellenebilir; güncel sürüm bu sayfada yayımlanır. Sorularınız için <a href="/iletisim">İletişim</a>.</p>''')

PAGES['mesafeli-satis-sozlesmesi'] = ('Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme', 'CVDoldur mesafeli satış sözleşmesi ve ön bilgilendirme formu: dijital içerik, ödeme, cayma hakkı.', f'''
    <h2>1. Taraflar</h2>
    <p><strong>Satıcı:</strong> {S['unvan']} — {S['adres']} — Vergi: {S['vergi']} — Tel: {S['telefon']} — E-posta: {S['eposta']}</p>
    <p><strong>Alıcı:</strong> Ödeme ekranında e-posta adresini girerek sipariş veren kişi.</p>
    <h2>2. Konu</h2>
    <p>Alıcının, cvdoldur.com.tr üzerinden satın aldığı dijital hizmetin (Başlangıç 7 günlük, Pro veya Pro+ 30 günlük erişim) satışı ve ifasına ilişkin tarafların hak ve yükümlülükleri.</p>
    <h2>3. Ürün ve fiyat</h2>
    <ul>
      <li><strong>Başlangıç — 7 gün:</strong> 59 TL (ilana özel CV uyarlama, filigransız PDF, tüm şablonlar, günlük 24 AI hakkı, 3 profil).</li>
      <li><strong>Pro — 30 gün:</strong> 149 TL (Başlangıç'ın tümü, günlük 60 AI hakkı, 10 profil).</li>
      <li><strong>Pro+ — 30 gün:</strong> 499 TL (Pro'nun tümü, günlük 200 AI hakkı, 40 profil, başkaları için CV hazırlama hakkı).</li>
    </ul>
    <p>Gösterilen fiyatlar ödenecek toplam tutardır; ödeme ekranında ek ücret yoktur. Ödeme, PayTR güvenli ödeme sayfasında kredi/banka kartıyla yapılır.</p>
    <h2>4. İfa (teslimat)</h2>
    <p>Ürün dijitaldir; ödeme onaylandığında erişim anahtarı otomatik tanımlanır ve süre o andan başlar; kullanılmasa da süre sonunda sona erer. Sipariş kodunuz ekranda gösterilir; tarayıcı verisi silinirse sipariş kodu ve e-posta ile erişim geri yüklenebilir (süre uzamaz). Fiziksel teslimat ve kargo yoktur.</p>
    <h2>5. Cayma hakkı</h2>
    <p>Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca, elektronik ortamda anında ifa edilen ve tüketiciye teslim edilen dijital içeriklerde, ifaya tüketicinin onayıyla başlanmışsa cayma hakkı kullanılamaz. Alıcı, ödeme öncesinde bu konuda onay verir. Onay verilmeyen siparişler tamamlanmaz.</p>
    <h2>6. Teknik sorun ve iade</h2>
    <p>Ödeme alındığı halde erişim açılmaz veya hizmet teknik nedenle kullanılamazsa alıcı {S['eposta']} adresine sipariş numarasıyla başvurabilir; sorun giderilemezse ücret iade edilir. Ayrıntılar için <a href="/iptal-ve-iade">İptal ve İade</a>.</p>
    <h2>7. Uyuşmazlık</h2>
    <p>Uyuşmazlıklarda Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dahilinde tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.</p>''')

PAGES['iptal-ve-iade'] = ('İptal ve İade Koşulları', 'CVDoldur iptal ve iade koşulları: dijital içerik, teknik sorun halinde iade, otomatik yenileme yoktur.', f'''
    <h2>Genel</h2>
    <ul>
      <li>Planlar tek seferliktir, <strong>otomatik yenilenmez</strong>; iptal için bir işlem gerekmez.</li>
      <li>Süre, ödemenin onaylandığı anda başlar. Kullanılmayan veya kısmen kullanılan süre için iade yapılmaz ve süre uzatılmaz.</li>
      <li>Dijital içerik anında ifa edildiği için, onayınız alındıktan sonra cayma hakkı kullanılamaz (bkz. <a href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a>).</li>
    </ul>
    <h2>İade edilen durumlar</h2>
    <ul>
      <li>Ödeme alındığı halde erişimin açılmaması ve sorunun çözülememesi (önce "Satın alımı geri yükle" bölümünü deneyin).</li>
      <li>Aynı sipariş için mükerrer çekim.</li>
      <li>Hizmetin teknik nedenle kullanılamaması ve tarafımızca giderilememesi.</li>
    </ul>
    <h2>Nasıl başvurulur?</h2>
    <p>{S['eposta']} adresine sipariş numaranız ve ödemede kullandığınız e-posta ile yazın. Onaylanan iadeler, ödemenin yapıldığı karta ödeme kuruluşu üzerinden yapılır; bankanıza göre yansıma süresi değişebilir.</p>''')

PAGES['iletisim'] = ('İletişim', 'CVDoldur iletişim formu: destek, iade ve KVKK başvuruları için bize yazın.', f'''
    <p class="g-contact-intro">Destek, sipariş ve iade soruları için formu doldurun; iş günlerinde genellikle 1-2 gün içinde dönüş yapıyoruz.</p>
    <form class="g-form" id="g-contact" action="https://api.web3forms.com/submit" method="POST" novalidate>
      <input type="hidden" name="access_key" value="{WEB3FORMS_KEY}">
      <input type="hidden" name="subject" value="CVDoldur iletişim formu">
      <input type="hidden" name="from_name" value="CVDoldur">
      <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none">
      <div class="g-form-row">
        <label>Ad Soyad<input type="text" name="name" required autocomplete="name"></label>
        <label>E-posta<input type="email" name="email" required autocomplete="email"></label>
      </div>
      <div class="g-form-row">
        <label>Konu<select name="topic"><option>Destek</option><option>Sipariş / ödeme</option><option>İade</option><option>Kişisel veri (KVKK) talebi</option><option>Diğer</option></select></label>
        <label><span>Sipariş kodu <em>(varsa)</em></span><input type="text" name="order" autocomplete="off" placeholder="CV ile başlayan kod"></label>
      </div>
      <label>Mesajınız<textarea name="message" rows="6" required></textarea></label>
      <p class="g-form-note">Sipariş kodu, ödeme sonrası ekranda ve e-postada gösterilen koddur; ödeme ile ilgili bir sorunuz yoksa boş bırakabilirsiniz. Mesajınız yalnızca size yanıt vermek için kullanılır ve form hizmeti (Web3Forms) üzerinden bize iletilir. Ayrıntılar: <a href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</a>.</p>
      <button type="submit" class="g-cta-btn">Mesajı Gönder</button>
      <p class="g-form-status" id="g-contact-status" role="status" aria-live="polite"></p>
    </form>
    <script>
    (function(){{
      var f=document.getElementById('g-contact'),st=document.getElementById('g-contact-status'),btn=f.querySelector('button');
      f.addEventListener('submit',function(e){{
        e.preventDefault(); st.className='g-form-status';
        if(!f.checkValidity()){{f.reportValidity();return}}
        btn.disabled=true; btn.textContent='Gönderiliyor…';
        fetch(f.action,{{method:'POST',headers:{{'Content-Type':'application/json',Accept:'application/json'}},body:JSON.stringify(Object.fromEntries(new FormData(f)))}})
          .then(function(r){{return r.json()}})
          .then(function(d){{ if(d.success){{f.reset();st.textContent='Mesajınız alındı, teşekkürler. En kısa sürede dönüş yapacağız.';st.className='g-form-status ok'}} else throw 0 }})
          .catch(function(){{st.textContent='Mesaj gönderilemedi. Lütfen biraz sonra tekrar deneyin.';st.className='g-form-status err'}})
          .finally(function(){{btn.disabled=false;btn.textContent='Mesajı Gönder'}});
      }});
    }})();
    </script>
    <h2>Satıcı bilgileri</h2>
    {_seller_box}''', False)

for slug, v in PAGES.items():
    t, d, b = v[:3]
    open(f'{PUB}/{slug}.html', 'w', encoding='utf-8').write(_page(slug, t, d, b, v[3] if len(v) > 3 else True))

# _redirects ve sitemap'e ekle (tekrar çalıştırmada çoğaltmaz)
_rp = PUB + '/_redirects'
_r = open(_rp, encoding='utf-8').read()
_add = ''.join(f'/{s}    /{s}.html    200\n' for s in PAGES if f'/{s} ' not in _r)
if _add:
    _r = _r.replace('# Uygulama (SPA) yedek yönlendirmesi', _add + '\n# Uygulama (SPA) yedek yönlendirmesi')
    open(_rp, 'w', encoding='utf-8').write(_r)
_sp = PUB + '/sitemap.xml'
_s = open(_sp, encoding='utf-8').read()
if not _ph:
    _u = ''.join(f'  <url>\n    <loc>{SITE}/{s}</loc>\n    <lastmod>{TODAY}</lastmod>\n  </url>\n' for s in PAGES if f'{SITE}/{s}<' not in _s)
    _s = _s.replace('</urlset>', _u + '</urlset>'); open(_sp, 'w', encoding='utf-8').write(_s)
print('legal pages:', len(PAGES), '| satıcı bilgisi eksik' if _ph else '| tamam')
