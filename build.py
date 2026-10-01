# -*- coding: utf-8 -*-
import re, os, json, html
from pathlib import Path
ROOT=str(Path(__file__).resolve().parent)
PUB=ROOT+'/public'
SITE='https://cvdoldur.com.tr'
import datetime as _dt
TODAY=_dt.date.today().isoformat()

# ====== PARA KAZANMA AYARLARI (buradan değiştirin, sonra `python3 build.py`) ======
ORDER_REVIEW = 'mailto:cvdoldurtr@gmail.com?subject=CV%20Inceleme%20Paketi'   # Shopier/iyzico linki gelince değiştir
ORDER_FULL   = 'mailto:cvdoldurtr@gmail.com?subject=Sifirdan%20Profesyonel%20CV'
PRICE_REVIEW = '149'
PRICE_FULL   = '349'
# =================================================================================

import sys; sys.path.insert(0,ROOT)
from extra import EXTRA
from extra2 import ROLES, MULAKAT
from extra3 import ROLES2, GUIDES
ROLES=ROLES+ROLES2
def esc(s): return html.escape(s, quote=True)

ALL = {}  # slug -> (title, desc, group)

def head(slug,title,desc,kw,faq=None,crumb=''):
    faq_ld=''
    if faq:
        faq_ld='<script type="application/ld+json">\n  '+json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]},ensure_ascii=False)+'\n  </script>\n  '
    art=json.dumps({"@context":"https://schema.org","@type":"Article","headline":title,"description":desc,"inLanguage":"tr","author":{"@type":"Organization","name":"CVDoldur"},"publisher":{"@type":"Organization","name":"CVDoldur"},"datePublished":TODAY,"dateModified":TODAY,"mainEntityOfPage":f"{SITE}/{slug}"},ensure_ascii=False)
    bc=json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":SITE+"/"},{"@type":"ListItem","position":2,"name":crumb,"item":f"{SITE}/{slug}"}]},ensure_ascii=False)
    return f'''<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)} | CVDoldur</title>
  <meta name="description" content="{esc(desc)}" />
  <meta name="keywords" content="{esc(kw)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="{SITE}/{slug}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="tr_TR" />
  <meta property="og:url" content="{SITE}/{slug}" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(desc)}" />
  <meta property="og:site_name" content="CVDoldur" />
  <meta property="og:image" content="{SITE}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="{SITE}/og-image.png" />
  <script type="application/ld+json">
  {art}
  </script>
  <script type="application/ld+json">
  {bc}
  </script>
  {faq_ld}<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/guide.css" />
</head>
<body>
  <header class="g-topbar">
    <div class="g-topbar-inner">
      <a href="/" class="g-logo">
        <div class="g-logo-mark">C</div>
        <div class="g-logo-text">CV<span>Doldur</span></div>
      </a>
      <a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a>
    </div>
  </header>
'''

def ul(items,cls=''):
    c=f' class="{cls}"' if cls else ''
    return f'<ul{c}>'+''.join(f'<li>{i}</li>' for i in items)+'</ul>'

def related(slugs):
    cards=''.join(f'''
      <a class="g-related-card" href="/{s}">
        <div class="g-rc-title">{esc(ALL[s][0])}</div>
        <div class="g-rc-desc">{esc(ALL[s][1])}</div>
      </a>''' for s in slugs)
    return f'''  <section class="g-related">
    <h2>İlgili Rehberler</h2>
    <div class="g-related-grid">{cards}
    </div>
  </section>
'''

def tail(cta_h,cta_p,cta_href,slug_related):
    return related(slug_related)+f'''
  <section class="g-final-cta">
    <div class="g-final-cta-box">
      <h2>{esc(cta_h)}</h2>
      <p>{esc(cta_p)}</p>
      <a href="{cta_href}" class="g-cta-btn">Hemen Ücretsiz Başla</a>
      <p style="margin-top:14px;font-size:14px">CV'nizi bir uzmana kontrol ettirmek ister misiniz? <a href="/profesyonel-cv-hazirlama-hizmeti" style="text-decoration:underline">Profesyonel CV hazırlama ve inceleme hizmeti</a></p>
    </div>
  </section>

  <footer class="g-footer">
    <div class="g-footer-logo">
      <div class="g-footer-logo-mark">C</div>
      <span class="g-footer-logo-text">CV<span style="color:#5eead4">Doldur</span></span>
    </div>
    <p>Türkiye için tasarlandı • ATS odaklı şablonlar • Otomatik yenileme yok</p>
    <p><a href="/gizlilik-politikasi">Gizlilik</a> · <a href="/kvkk-aydinlatma-metni">KVKK</a> · <a href="/kullanim-sartlari">Kullanım Şartları</a> · <a href="/mesafeli-satis-sozlesmesi">Mesafeli Satış</a> · <a href="/iptal-ve-iade">İptal ve İade</a> · <a href="/iletisim">İletişim</a></p>
    <p>© 2026 CVDoldur. Tüm hakları saklıdır. · <a href="/">Ücretsiz CV oluştur</a></p>
  </footer>
</body>
</html>
'''

def hero(crumb,h1,lede):
    return f'''
  <section class="g-hero">
    <p class="g-breadcrumb"><a href="/">Ana Sayfa</a> / {esc(crumb)}</p>
    <h1>{esc(h1)}</h1>
    <p class="g-lede">{lede}</p>
  </section>

  <article class="g-article">
'''

def faq_html(faq):
    return '    <h2>Sık Sorulan Sorular</h2>\n'+''.join(f'    <h3>{esc(q)}</h3>\n    <p>{a}</p>\n' for q,a in faq)

CITIES=[]  # filled below
# ---------------- Şehir verisi ----------------
C=[
dict(slug='istanbul-cv-hazirlama',name='İstanbul',loc="İstanbul'da",
 kw='istanbul cv hazırlama, istanbul iş başvurusu cv, istanbul cv örneği, istanbul iş ilanları',
 intro="Türkiye'nin en kalabalık şehri İstanbul'da bir ilana yüzlerce başvuru gelebilir. Bu yüzden CV'niz önce bir tarama sisteminden, sonra da kısa bir göz atışta işe alım uzmanından geçmek zorunda.",
 sectors=["<strong>Finans ve bankacılık:</strong> Levent, Maslak ve Ataşehir çevresinde yoğunlaşır; sertifika ve mevzuat bilgisi öne çıkar.","<strong>E-ticaret ve teknoloji:</strong> yazılım, ürün, veri ve dijital pazarlama pozisyonları; portföy ve ölçülebilir sonuç aranır.","<strong>Lojistik ve liman:</strong> Tuzla, Pendik ve Ambarlı çevresi; vardiya ve ehliyet/belge bilgisi önemlidir.","<strong>Tekstil, hazır giyim ve perakende:</strong> üretimden mağaza yönetimine kadar geniş bir alan.","<strong>Turizm ve hizmet:</strong> otel, restoran ve etkinlik; yabancı dil belirgin avantajdır."],
 tips=["İkamet ettiğiniz ilçeyi yazın. İşverenler İstanbul'da ulaşım süresini gerçekçi bir kriter olarak değerlendirir; Avrupa veya Anadolu yakası tercihiniz varsa özetin sonunda belirtebilirsiniz.","İlan başlığındaki unvanı ve anahtar kelimeleri CV'nize doğal biçimde yerleştirin; yoğun başvuru alan ilanlarda ilk eleme yazılımla yapılır.","İngilizce seviyenizi net yazın (ör. B2). Çok uluslu şirketlerde CV'nin İngilizce sürümü de istenebilir: <a href=\"/ingilizce-cv-ornegi\">İngilizce CV örneği</a>.","Tek sayfa hedefleyin; yalnızca uzun deneyimi olanlar iki sayfaya çıksın."],
 sites="Kariyer.net, LinkedIn, Indeed ve İŞKUR üzerinden ilan takibi yapılır. Büyük şirketlerin kariyer sayfalarına doğrudan başvurmak da genellikle daha az kalabalık bir yol sağlar.",
 faq=[("İstanbul'da iş başvurusu için CV'ye fotoğraf konmalı mı?","Türkiye'de fotoğraf hâlâ yaygın ve kabul görür; ancak zorunlu değildir. Koyacaksanız düzgün, sade ve güncel bir portre kullanın. Yurt dışı bağlantılı şirketlere İngilizce CV gönderirken fotoğraf çoğunlukla çıkarılır."),("İstanbul'da hangi CV şablonu daha uygun?","Yoğun başvuru nedeniyle sade ve ATS uyumlu bir tek sütun düzeni en güvenlisidir. Yaratıcı roller için portföy bağlantısıyla desteklenmiş modern bir şablon seçilebilir."),("Yakın semtleri belirtmek avantaj mı?","Kesin bir kural değildir ama işveren için ulaşım sorusunu baştan cevaplar. Genel olarak yalnızca ilçe ve şehir yazmak yeterlidir, açık adres gerekmez.")]),
dict(slug='ankara-cv-hazirlama',name='Ankara',loc="Ankara'da",
 kw='ankara cv hazırlama, ankara iş başvurusu cv, ankara cv örneği, ankara iş ilanları',
 intro="Ankara'da iş piyasası kamu kurumları, savunma ve yazılım sektörü ile üniversite çevresi etrafında şekillenir. Başvuru türüne göre CV'nizin vurgusu değişmelidir.",
 sectors=["<strong>Kamu ve kamuya bağlı kurumlar:</strong> resmi ilanlar çoğunlukla ayrı başvuru sistemleri üzerinden yürür; CV yerine form ağırlıklı olabilir.","<strong>Savunma sanayii ve Ar-Ge:</strong> proje, patent ve teknik yetkinlik odaklı CV beklenir.","<strong>Teknoloji ve teknokentler:</strong> ODTÜ Teknokent ve Bilkent Cyberpark gibi bölgelerde yazılım ve mühendislik ilanları bulunur.","<strong>Sanayi:</strong> Ostim ve Sincan gibi organize bölgelerde üretim, bakım ve satın alma pozisyonları.","<strong>Sağlık ve eğitim:</strong> hastaneler, özel okullar ve üniversiteler."],
 tips=["Kamu dışı başvurularda bile KPSS veya kamu deneyimi varsa ayrı bir satırda açıkça yazın.","Ar-Ge ve savunma ilanlarında proje bazlı deneyimi (rol, teknoloji, süre) yazın; gizli bilgileri paylaşmayın.","Akademik geçmişiniz varsa yayın ve projeleri kısa bir bölüm olarak ekleyin, ancak özel sektöre başvururken bunu sonuçlarla dengeleyin.","Askerlik durumunu belirtin; Türkiye'ye özel alanlar Ankara'daki çoğu ilanda beklenir."],
 sites="Özel sektör için Kariyer.net, LinkedIn ve İŞKUR; kamu ilanları için resmi kariyer ve ilan portalları takip edilir. Teknokent şirketlerinin kendi kariyer sayfaları da güçlü bir kaynaktır.",
 faq=[("Ankara'da kamu ve özel sektör CV'si aynı olur mu?","Hayır. Özel sektör CV'si sonuç odaklı ve kısa olmalıdır; kamu başvurularında ise ilanın istediği belge ve form düzeni belirleyicidir."),("Yeni mezunlar Ankara'da nasıl öne çıkar?","Staj, bitirme projesi ve topluluk çalışmalarını sonuçlarıyla yazın. Bunun için <a href=\"/yeni-mezun-cv-ornegi\">yeni mezun CV örneğine</a> bakabilirsiniz."),("Teknokent başvurusunda GitHub bağlantısı şart mı?","Yazılım pozisyonlarında şart değil ama güçlü bir avantajdır. Yalnızca düzenli ve okunabilir projeleri paylaşın.")]),
dict(slug='izmir-cv-hazirlama',name='İzmir',loc="İzmir'de",
 kw='izmir cv hazırlama, izmir iş başvurusu cv, izmir cv örneği, izmir iş ilanları',
 intro="İzmir; liman ve ihracat, sanayi bölgeleri, teknoloji ve turizmin bir arada bulunduğu dengeli bir iş piyasasına sahip. Sektörünüzü CV'nin ilk üç satırında belli etmeniz gerekir.",
 sectors=["<strong>Dış ticaret ve lojistik:</strong> liman, gümrük ve ihracat operasyonları; yabancı dil ve evrak deneyimi aranır.","<strong>Sanayi:</strong> Kemalpaşa OSB, Aliağa ve Menemen çevresinde üretim, kalite ve bakım pozisyonları.","<strong>Teknoloji:</strong> İzmir Yüksek Teknoloji Enstitüsü çevresindeki teknopark ve yazılım şirketleri.","<strong>Turizm ve hizmet:</strong> Çeşme ve Alaçatı gibi bölgelerde sezonluk ve sürekli işler.","<strong>Perakende ve gıda:</strong> yerel ve ulusal zincirler."],
 tips=["İhracat, ithalat, gümrük ve lojistik deneyimini kullandığınız sistem ve evrak türleriyle yazın.","Sanayi pozisyonlarında ISO standartları, kalite araçları ve ERP bilgisini beceriler bölümüne ekleyin.","Sezonluk işlerde tarih aralığı ve esnekliğinizi açıkça belirtin.","Yabancı dil sertifikanız yoksa seviyeyi kendinize göre dürüstçe yazın; mülakatta test edilebilir."],
 sites="Kariyer.net, LinkedIn, Indeed ve İŞKUR temel kaynaklardır. Organize sanayi bölgelerindeki firmaların kendi web sitelerindeki 'insan kaynakları' formları da doğrudan başvuru için kullanılır.",
 faq=[("İzmir'de yabancı dil CV'de ne kadar önemli?","Dış ticaret, turizm ve teknoloji rollerinde önemlidir. İngilizce CV hazırlamak için <a href=\"/ingilizce-cv-ornegi\">İngilizce CV rehberine</a> bakın."),("Sanayi bölgesindeki işlere nasıl başvurulur?","İlan portallarının yanı sıra firmaların kariyer formlarını doldurmak ve İŞKUR kayıtlarınızı güncel tutmak yararlıdır."),("Tek sayfa yeterli mi?","Beş yıldan az deneyimde evet. Daha uzun deneyimde iki sayfa kabul edilir, ama ilk sayfa kendi başına ikna edici olmalıdır.")]),
dict(slug='bursa-cv-hazirlama',name='Bursa',loc="Bursa'da",
 kw='bursa cv hazırlama, bursa iş başvurusu cv, bursa cv örneği, bursa iş ilanları',
 intro="Bursa; otomotiv ve yan sanayi, tekstil ve beyaz eşya üretimiyle sanayi ağırlıklı bir şehir. Burada CV'nin kazandıran tarafı teknik yeterlilik ve süreç bilgisidir.",
 sectors=["<strong>Otomotiv ve yan sanayi:</strong> üretim, kalite, planlama ve bakım pozisyonları.","<strong>Tekstil ve konfeksiyon:</strong> model, üretim planlama ve kalite kontrol.","<strong>Beyaz eşya ve makine:</strong> tasarım, üretim mühendisliği ve satın alma.","<strong>Gıda ve tarım:</strong> işleme ve dağıtım işletmeleri.","<strong>Organize sanayi bölgeleri:</strong> Nilüfer, Demirtaş ve Bursa OSB çevresi yoğun istihdam sağlar."],
 tips=["Kalite belgelerinizi ve bildiğiniz standartları (ör. ISO 9001, otomotiv için IATF 16949) açıkça yazın.","Vardiya, servis ve çalışma saatlerine uygunluğunuzu kısa bir cümleyle belirtin.","Teknik rollerde CAD, ERP ve ölçüm yazılımlarını beceri başlığı altında gruplayın.","Üretimde ölçülebilir sonuç yazın: hurda oranı, teslimat süresi, duruş süresi."],
 sites="İlanlar Kariyer.net, İŞKUR ve şirketlerin kendi kariyer formlarında yayımlanır. Sanayi bölgelerinde ilan panoları ve iş kulübü gibi yerel kanallar da hâlâ etkilidir.",
 faq=[("Bursa'da fabrika işleri için CV gerekli mi?","Çoğu üretim ilanında kısa ve net bir CV veya başvuru formu istenir. Ehliyet, sertifika ve vardiya uygunluğu öne çıkmalıdır."),("Sertifikaları nereye yazmalıyım?","Eğitim bölümünün hemen ardından ayrı bir 'Sertifikalar' başlığında, yalnızca ilgili olanları yazın."),("Mühendis CV'si nasıl olmalı?","Proje, araç ve sonuç odaklı; bir sayfa. Sade bir şablon için <a href=\"/ats-uyumlu-cv-sablonu\">ATS uyumlu şablon rehberine</a> bakın.")]),
dict(slug='antalya-cv-hazirlama',name='Antalya',loc="Antalya'da",
 kw='antalya cv hazırlama, antalya iş başvurusu cv, antalya turizm cv örneği, antalya iş ilanları',
 intro="Antalya'da iş piyasası büyük ölçüde turizm sezonuna göre nefes alır. Sezonluk ve sürekli pozisyonlar için CV'nizde hangi bilgiyi öne çıkardığınız belirleyicidir.",
 sectors=["<strong>Otelcilik:</strong> ön büro, kat hizmetleri, yiyecek-içecek ve animasyon; Kemer, Belek, Lara ve Alanya çevresi.","<strong>Restoran ve eğlence:</strong> servis, mutfak ve organizasyon.","<strong>Tarım ve seracılık:</strong> üretim, paketleme ve ihracat.","<strong>İnşaat ve emlak:</strong> satış, proje ve saha pozisyonları.","<strong>Ulaşım ve transfer:</strong> turizme bağlı hizmetler."],
 tips=["Sezon başlangıç ve bitiş tarihlerinize uygunluğunuzu net yazın.","Yabancı dilleri seviyeleriyle yazın; İngilizcenin yanında Almanca veya Rusça birçok turizm rolünde belirgin avantajdır.","Önceki otel veya işletmelerdeki görev ve sezon sayısını belirtin; referans gösterebiliyorsanız yazın.","Ön büro ve rezervasyon yazılımlarına (ör. Opera) hâkimseniz beceriler bölümüne ekleyin."],
 sites="Kariyer.net ve İŞKUR'un yanı sıra otel zincirlerinin kendi kariyer sayfaları ve turizm odaklı ilan siteleri kullanılır. Sezon öncesinde başvurmak genellikle daha avantajlıdır.",
 faq=[("Sezonluk iş için CV şart mı?","Birçok otel kısa bir CV veya form ister. Kısa, yabancı dil ve tecrübeyi öne çıkaran tek sayfalık bir CV yeterlidir."),("Deneyimsizsem ne yazmalıyım?","Eğitim, yabancı dil, kurs ve gönüllü çalışmaları yazın. <a href=\"/yeni-mezun-cv-ornegi\">Yeni mezun CV örneği</a> aynı mantıkla kullanılabilir."),("Fotoğraf koymalı mıyım?","Ön büro ve karşılama gibi müşteriyle yüz yüze rollerde düzgün bir fotoğraf sık tercih edilir; yine de zorunlu değildir.")]),
dict(slug='konya-cv-hazirlama',name='Konya',loc="Konya'da",
 kw='konya cv hazırlama, konya iş başvurusu cv, konya cv örneği, konya iş ilanları',
 intro="Konya; tarım, makine ve yan sanayi ile gıda üretiminin güçlü olduğu, küçük ve orta ölçekli işletmelerin ağırlıkta olduğu bir şehir. Bu yapıda CV kısa, net ve doğrudan olmalı.",
 sectors=["<strong>Makine ve otomotiv yan sanayi:</strong> imalat, bakım, kalite ve CNC operatörlüğü.","<strong>Tarım ve tarım makineleri:</strong> satış, servis ve üretim.","<strong>Gıda:</strong> işleme, paketleme ve dağıtım.","<strong>Ticaret ve perakende:</strong> KOBİ ölçeğinde satış ve muhasebe pozisyonları.","<strong>Eğitim ve sağlık:</strong> üniversiteler, özel okullar ve hastaneler."],
 tips=["KOBİ'lerde CV çoğunlukla doğrudan sahibi veya müdür tarafından okunur; sade, okunaklı ve tek sayfalık bir düzen yeterlidir.","Kullandığınız makine, program ve ehliyet türlerini açıkça yazın.","Bölgesel bilgi (yerel müşteri ve tedarikçi çevresi) satış rollerinde artıdır.","Telefon ve e-posta bilgilerinizi hatasız yazın; işverenler sizi çoğunlukla telefonla arar."],
 sites="İŞKUR, Kariyer.net ve LinkedIn'in yanı sıra yerel işletmelerin doğrudan iletişim kanalları önemlidir. Organize sanayi bölgesindeki firmalara doğrudan başvuru da işe yarar.",
 faq=[("Konya'da küçük işletmelere CV nasıl gönderilir?","E-posta veya ilan sitesi üzerinden PDF olarak; dosya adını ad-soyad ve pozisyon şeklinde verin."),("Ehliyet ve belgeler CV'ye yazılmalı mı?","Evet, özellikle sanayi, satış ve lojistik ilanlarında ehliyet sınıfı ve mesleki belgeler kısa bir bölümde yer almalıdır."),("Yeni başlayanlar için ne önerirsiniz?","Staj ve eğitim bilgilerini sade bir düzenle yazın. <a href=\"/cv-nasil-hazirlanir\">CV nasıl hazırlanır rehberi</a> adım adım yol gösterir.")]),
dict(slug='adana-cv-hazirlama',name='Adana',loc="Adana'da",
 kw='adana cv hazırlama, adana iş başvurusu cv, adana cv örneği, adana iş ilanları',
 intro="Adana'da iş piyasası tarıma dayalı sanayi, gıda, tekstil, ticaret ve sağlık etrafında dönüyor. Komşu Mersin'deki liman ve lojistik ağı da bölgeye iş imkânı katar.",
 sectors=["<strong>Tarıma dayalı sanayi ve gıda:</strong> işleme, kalite ve satış.","<strong>Tekstil:</strong> üretim ve planlama pozisyonları.","<strong>Ticaret ve lojistik:</strong> depo, sevkiyat ve dış ticaret.","<strong>Sağlık:</strong> üniversite ve özel hastaneler.","<strong>Organize sanayi:</strong> Hacı Sabancı OSB çevresindeki üretim işletmeleri."],
 tips=["Kalite ve gıda güvenliği eğitimlerinizi (ör. HACCP) belgeleriyle birlikte yazın.","Depo ve lojistikte forklift veya SRC belgesi gibi mesleki yeterlilikleri öne çıkarın.","Satış rollerinde bölgesel müşteri portföyünüzü ve hedef gerçekleştirme oranını yazın.","Sağlık personeli için oda kaydı ve uzmanlık bilgisini net verin."],
 sites="Kariyer.net, İŞKUR ve LinkedIn ana kaynaklardır; büyük işletmelerin kariyer sayfalarından doğrudan başvuru da mümkündür.",
 faq=[("Adana'da satış temsilcisi CV'si nasıl olmalı?","Hedef, gerçekleşme oranı ve müşteri sayısı gibi rakamlarla yazılmalıdır. Detaylar için <a href=\"/satis-temsilcisi-cv-ornegi\">satış temsilcisi CV örneğine</a> bakın."),("Mersin'deki işlere de aynı CV ile başvurabilir miyim?","Evet; yalnızca ilana göre anahtar kelimeleri ve vurguları güncelleyin."),("CV'de maaş beklentisi yazılır mı?","Genellikle hayır; ilan özellikle istemedikçe CV'ye değil, mülakat aşamasına bırakın.")]),
dict(slug='gaziantep-cv-hazirlama',name='Gaziantep',loc="Gaziantep'te",
 kw='gaziantep cv hazırlama, gaziantep iş başvurusu cv, gaziantep cv örneği, gaziantep iş ilanları',
 intro="Gaziantep; tekstil, halı, gıda ve plastik başta olmak üzere ihracata yönelik üretimin öne çıktığı bir sanayi kentidir. CV'nizde üretim ve dış ticaret bilgisi ağırlık kazanır.",
 sectors=["<strong>Tekstil ve halı:</strong> üretim, kalite, planlama ve satış.","<strong>Gıda:</strong> işleme, ambalaj ve dış satış.","<strong>Plastik ve ayakkabı:</strong> imalat ve tasarım.","<strong>Dış ticaret:</strong> Orta Doğu ile ticarette Arapça bilgisi bazı satış ve ihracat rollerinde avantajdır.","<strong>Organize sanayi:</strong> Gaziantep OSB ve çevresindeki işletmeler."],
 tips=["İhracat sorumluluklarını pazar ve ürün bazında yazın.","Arapça veya başka bir yabancı dil biliyorsanız seviyesiyle belirtin.","Üretimde vardiya, kalite belgesi ve ERP bilgisini beceriler bölümünde gruplayın.","Şehir içi ve OSB'ye ulaşım durumunuzu (servis, araç) kısaca belirtebilirsiniz."],
 sites="Kariyer.net, İŞKUR ve LinkedIn; ayrıca firmaların kendi başvuru formları kullanılır.",
 faq=[("Gaziantep'te ihracat pozisyonu için CV'de neler olmalı?","Çalıştığınız pazarlar, kullandığınız evrak ve sistemler, yabancı dil ve ölçülebilir satış sonuçları."),("Yabancı dilim yoksa şansım azalır mı?","Üretim, kalite ve saha rollerinde hayır. Teknik yeterlilik ve deneyim öne çıkar."),("PDF mi Word mü göndermeli?","PDF gönderin; düzen bozulmaz. Ücretsiz oluşturucumuz PDF çıktısı verir.")]),
]

def city_page(c):
    slug=c['slug']; n=c['name']; L=c['loc']
    title=f"{n} CV Hazırlama: {L} İş Başvurusu İçin Rehber ve Örnek"
    desc=f"{L} iş başvurusu için CV nasıl hazırlanır? {n} sektörleri, ilan siteleri ve şehre özel ipuçları; ücretsiz ATS uyumlu CV oluşturucu ile PDF indirin."
    ALL[slug]=(f"{n} CV Hazırlama Rehberi",f"{L} iş başvurusu için sektör ve CV ipuçları","sehir")
    body=head(slug,title,desc,c['kw'],c['faq'],f"{n} CV Hazırlama")
    body+=hero(f"{n} CV Hazırlama",f"{n} CV Hazırlama: {L} İş Başvurusu Rehberi",c['intro'])
    body+=f"    <h2>{L} Hangi Sektörlerde İş Var?</h2>\n    <p>{n} iş piyasasında CV'nizi ilgili sektöre göre şekillendirmek, genel bir CV göndermekten çok daha fazla geri dönüş sağlar:</p>\n    {ul(c['sectors'])}\n"
    body+=f"    <h2>{n} İçin CV'de Dikkat Edilecekler</h2>\n    {ul(c['tips'],'g-check-list')}\n"
    x=EXTRA[slug]
    body+=f"    <h2>{L} En Çok Aranan Pozisyonlar ve CV Vurgusu</h2>\n    <p>Aynı şehirde bile pozisyona göre CV'nin öne çıkarması gereken kısım değişir:</p>\n    "+ul([f"<strong>{r}:</strong> {e}" for r,e in x['roles']])+"\n"
    body+=f"    <h2>{n} İçin Örnek Özet Cümlesi</h2>\n    <div class=\"g-example\"><span class=\"g-example-label\">Örnek</span>\"{x['sample']}\"</div>\n    <p>Kurgusal bir örnektir; kendi deneyiminize ve gerçek rakamlarınıza göre uyarlayın.</p>\n"
    body+=f"    <h2>{L} Mülakatta Sık Karşılaşılan Konular</h2>\n    "+ul(x['interview'])+"\n"
    body+=f"    <h2>{L} Nereden Başvurulur?</h2>\n    <p>{c['sites']}</p>\n    <p>Hangi yolu seçerseniz seçin, CV'nizin <a href=\"/ats-uyumlu-cv-sablonu\">ATS uyumlu</a> olması ve ilanın anahtar kelimelerini taşıması gerekir. Adım adım anlatım için <a href=\"/cv-nasil-hazirlanir\">CV nasıl hazırlanır</a> rehberine bakın.</p>\n"
    body+=f'''    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>{n} başvurunuz için CV'nizi 3 dakikada hazırlayın.</strong> Kayıt gerekmez, önizleme ücretsiz; filigransız PDF için 30 günlük Premium gerekir.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>\n'''
    body+=faq_html(c['faq'])
    body+="  </article>\n\n"
    others=[x['slug'] for x in C if x['slug']!=slug][:3]
    body+=tail(f"{n}'deki Hedef İşiniz İçin Hazır mısınız?","Ücretsiz oluşturucuyla CV'nizi hazırlayın, PDF olarak indirin.","/?start=1",['cv-nasil-hazirlanir','profesyonel-cv-hazirlama-hizmeti']+others)
    open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(body)

# register topic pages first so related() works
ALL['cv-nasil-hazirlanir']=("CV Nasıl Hazırlanır?","Adım adım profesyonel CV hazırlama rehberi","rehber")
ALL['ingilizce-cv-ornegi']=("İngilizce CV Örneği","Türkçe CV'den İngilizce CV'ye geçiş rehberi","rehber")
ALL['profesyonel-cv-hazirlama-hizmeti']=("Profesyonel CV Hazırlama Hizmeti","CV inceleme ve sıfırdan hazırlama paketleri","hizmet")
for c in C:
    ALL[c['slug']]=(f"{c['name']} CV Hazırlama Rehberi",f"{c['loc']} iş başvurusu için sektör ve CV ipuçları","sehir")
# existing
ALL['ats-uyumlu-cv-sablonu']=("ATS Uyumlu CV Şablonu","ATS odaklı sade CV nasıl hazırlanır","rehber")
ALL['on-yazi-nasil-yazilir']=("Ön Yazı Nasıl Yazılır","Dikkat çeken bir ön yazı için adım adım rehber","rehber")
ALL['yazilimci-cv-ornegi']=("Yazılımcı CV Örneği","Yazılım mühendisleri için örnek CV ve rehber","rehber")
ALL['pazarlamaci-cv-ornegi']=("Pazarlamacı CV Örneği","Dijital pazarlama uzmanları için örnek CV ve rehber","rehber")
ALL['satis-temsilcisi-cv-ornegi']=("Satış Temsilcisi CV Örneği","Satış rakamlarını CV'de nasıl öne çıkarırsınız","rehber")
ALL['yeni-mezun-cv-ornegi']=("Yeni Mezun CV Örneği","Deneyimsizken nasıl öne çıkarsınız","rehber")
for r in ROLES: ALL[r['slug']]=(r['short'],r['desc'],'rehber')
ALL['mulakat-sorulari-ve-cevaplari']=('Mülakat Soruları ve Cevapları','En sık sorulan 10 mülakat sorusu ve cevap yaklaşımı','rehber')
ALL['is-ilani-sitelerine-cv-yukleme']=('İş İlanı Sitelerine CV Yükleme','Kariyer.net, LinkedIn, Indeed ve İŞKUR için ipuçları','rehber')
NEWPAGES=[r['slug'] for r in ROLES]+['mulakat-sorulari-ve-cevaplari','is-ilani-sitelerine-cv-yukleme']+[g['slug'] for g in GUIDES]
for g in GUIDES: ALL[g['slug']]=(g['short'],g['desc'],'rehber')

for c in C: city_page(c)

# ---------------- Konu sayfaları ----------------
# 1) cv-nasil-hazirlanir
slug='cv-nasil-hazirlanir'
faq=[("CV kaç sayfa olmalı?","Beş yıldan az deneyimde tek sayfa yeterlidir. Daha uzun deneyimde iki sayfa kabul edilir; üçüncü sayfaya çıkmayın."),("CV'ye fotoğraf koymalı mıyım?","Türkiye'de yaygın ama zorunlu değildir. Koyarsanız sade ve güncel olsun; yurt dışına yapılan başvurularda genellikle çıkarılır."),("CV'de hangi sırayla bölüm yazılır?","İletişim, özet, deneyim, eğitim, beceriler, diller. Yeni mezunlar eğitimi deneyimin önüne alabilir.")]
b=head(slug,"CV Nasıl Hazırlanır? Adım Adım Profesyonel CV Rehberi (2026)","CV nasıl hazırlanır? İletişim bilgisinden özet ve deneyim yazımına, ATS uyumundan PDF kaydetmeye kadar 8 adımda profesyonel CV hazırlama rehberi.","cv nasıl hazırlanır, cv hazırlama, özgeçmiş nasıl yazılır, profesyonel cv hazırlama, cv yazma",faq,"CV Nasıl Hazırlanır")
b+=hero("CV Nasıl Hazırlanır","CV Nasıl Hazırlanır? 8 Adımda Profesyonel CV","İyi bir CV, tüm geçmişinizi değil, başvurduğunuz işe uygun olan kısmını gösterir. Aşağıdaki sekiz adımı sırayla uygularsanız birkaç dakikada temiz, ATS uyumlu ve okunması kolay bir özgeçmiş elde edersiniz.")
steps=[("İlana göre hedef belirleyin","Başvuracağınız pozisyonun ilanını açın ve tekrar eden kelimeleri (araçlar, sorumluluklar, unvan) not edin. CV'niz bu kelimelerle konuşmalı; bu, hem ATS hem de işe alımcı için ilk eşleştirmedir."),("İletişim bilgilerini eksiksiz yazın","Ad soyad, telefon, profesyonel bir e-posta adresi, şehir ve varsa LinkedIn bağlantısı. Açık ev adresine gerek yoktur."),("3-4 cümlelik özet yazın","Kim olduğunuz, kaç yıllık deneyiminiz ve en güçlü iki yetkinliğiniz. Klişe sıfatlar yerine somut bilgi verin."),("Deneyimi sonuçla yazın","Her madde eylem, araç ve sonuç içersin. Örneğin 'Kampanya yönettim' yerine 'Meta reklam bütçesini yöneterek dönüşüm oranını %18 artırdım'. Rakamınız yoksa uydurmayın; teslim süresi veya müşteri sayısı gibi gerçek bir ölçü seçin."),("Eğitim ve sertifikaları ekleyin","Bölüm, okul ve mezuniyet yılı. Yalnızca ilgili sertifikaları yazın."),("Becerileri gruplayın","Teknik, araçlar ve diller olarak ayırın. Bilmediğiniz şeyi yazmayın; mülakatta sorulur."),("Sade bir şablon seçin","Tek sütun, okunaklı yazı tipi, bol boşluk. Tabloya ve görsele dayalı tasarımlar tarama sistemlerinde bozulabilir. Ayrıntı için <a href=\"/ats-uyumlu-cv-sablonu\">ATS uyumlu CV şablonu</a> rehberine bakın."),("PDF olarak kaydedip kontrol edin","Dosya adını 'Ad-Soyad-CV.pdf' yapın, imla ve tarih hatalarını kontrol edin, başka birine okutun.")]
for i,(t,d) in enumerate(steps,1):
    b+=f"    <h2>{i}. {t}</h2>\n    <p>{d}</p>\n"
b+='''    <h2>CV'de Kaçınmanız Gerekenler</h2>
    '''+ul(["Yazım ve dil bilgisi hataları","Herkese aynı CV'yi göndermek","Yaş, medeni hâl ve TC kimlik numarası gibi gereksiz kişisel veriler","İki sayfayı aşan uzunluk","Doğrulanamayan iddialar ve şişirilmiş unvanlar"],'g-x-list')+'''
    <p>Rol bazlı örnekler için <a href="/yazilimci-cv-ornegi">yazılımcı</a>, <a href="/pazarlamaci-cv-ornegi">pazarlamacı</a>, <a href="/satis-temsilcisi-cv-ornegi">satış temsilcisi</a> ve <a href="/yeni-mezun-cv-ornegi">yeni mezun</a> rehberlerine göz atın. CV'nizle birlikte bir <a href="/on-yazi-nasil-yazilir">ön yazı</a> göndermek de dönüşü artırır.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>Sekiz adımı tek ekranda uygulayın.</strong> Sihirbaz sizi adım adım yönlendirir, ATS skorunuzu gösterir.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''+faq_html(faq)+"  </article>\n\n"
b+=tail("CV'nizi Bugün Hazırlayın","Sihirbazla 3 dakikada ATS uyumlu CV oluşturun.","/?start=1",['ats-uyumlu-cv-sablonu','ingilizce-cv-ornegi','on-yazi-nasil-yazilir','istanbul-cv-hazirlama','profesyonel-cv-hazirlama-hizmeti','yeni-mezun-cv-ornegi'])
open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

# 2) ingilizce-cv-ornegi
slug='ingilizce-cv-ornegi'
faq=[("İngilizce CV'ye fotoğraf konur mu?","Amerika, Birleşik Krallık ve birçok Avrupa ülkesinde genellikle konmaz. Türkiye'deki çok uluslu şirketlerde ise ilan veya şirket kültürüne göre değişir."),("Askerlik durumu İngilizce CV'de yazılır mı?","Yurt dışı işverenler için gereksizdir; Türkiye'deki şirketlere gönderilen İngilizce CV'de kısaca yazılabilir."),("CV ile Resume aynı şey mi?","ABD'de 'resume' 1-2 sayfalık özet belgedir; 'CV' akademik ve uzun biçimlerde kullanılır. Birleşik Krallık ve Avrupa'da 'CV' kelimesi daha yaygındır.")]
b=head(slug,"İngilizce CV Örneği: Türkçe CV'den İngilizce CV'ye Geçiş Rehberi","İngilizce CV nasıl yazılır? Bölüm başlıkları, örnek cümleler, fotoğraf ve kişisel bilgi kuralları ile Türkçe CV'den İngilizceye çeviri rehberi.","ingilizce cv örneği, ingilizce cv nasıl yazılır, english cv turkish, resume örneği, ingilizce özgeçmiş",faq,"İngilizce CV Örneği")
b+=hero("İngilizce CV Örneği","İngilizce CV Örneği ve Yazım Rehberi","İngilizce bir CV, Türkçe CV'nin birebir çevirisi değildir. Bölüm adları, ton ve kişisel bilgi anlayışı farklıdır. Bu rehber, doğru başlıkları ve kalıpları gösterir.")
b+='''    <h2>Bölüm Başlıklarının İngilizcesi</h2>
    <ul>
      <li><strong>Özet</strong> → Professional Summary</li>
      <li><strong>Deneyim</strong> → Work Experience</li>
      <li><strong>Eğitim</strong> → Education</li>
      <li><strong>Beceriler</strong> → Skills</li>
      <li><strong>Sertifikalar</strong> → Certifications</li>
      <li><strong>Diller</strong> → Languages</li>
    </ul>
    <h2>Deneyim Maddelerinde Güçlü Fiiller</h2>
    <p>İngilizce CV'de maddeler geçmiş zaman eylem fiiliyle başlar ve sonuç içerir:</p>
    <div class="g-example g-bad"><span class="g-example-label">Zayıf</span>"Responsible for sales."</div>
    <div class="g-example"><span class="g-example-label">Güçlü</span>"Increased regional sales by 22% by restructuring the outreach process."</div>
    <p>Sık kullanılan fiiller: <em>led, built, reduced, increased, launched, managed, improved, delivered</em>.</p>
    <h2>Türkiye'ye Özgü Bilgilerde Ne Yapmalı?</h2>
    '''+ul(["Fotoğraf, doğum tarihi, medeni hâl ve askerlik durumunu yurt dışı başvurularında genellikle çıkarın","Üniversite adlarını olduğu gibi yazın, gerekiyorsa parantez içinde İngilizcesini ekleyin","Türk lirasıyla verilen rakamları gerekirse yüzde veya oran olarak yazın","Dil seviyesini CEFR ölçeğiyle (A2, B1, B2, C1) belirtin"],'g-check-list')+'''
    <h2>Kısa Bir Özet Örneği</h2>
    <div class="g-example"><span class="g-example-label">Örnek</span>"Marketing specialist with 5 years of experience in performance campaigns. Skilled in Google Ads, analytics and reporting. Fluent in English (B2) and Turkish (native)."</div>
    <p>Sade bir düzen için <a href="/ats-uyumlu-cv-sablonu">ATS uyumlu şablon</a> kurallarını izleyin. Adımları görmek için <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberine bakabilirsiniz.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>CV'nizi kendi diliyle hazırlayın.</strong> Önce Türkçe sürümünü oluşturun, sonra İngilizceye uyarlayın.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''+faq_html(faq)+"  </article>\n\n"
b+=tail("İngilizce CV'nizi Hazırlamaya Başlayın","Türkçe CV'nizi oluşturun, sonra İngilizceye uyarlayın.","/?start=1",['cv-nasil-hazirlanir','ats-uyumlu-cv-sablonu','yazilimci-cv-ornegi','istanbul-cv-hazirlama','profesyonel-cv-hazirlama-hizmeti','izmir-cv-hazirlama'])
open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

# 3) hizmet sayfası (para sayfası)
slug='profesyonel-cv-hazirlama-hizmeti'
faq=[("Ödemeyi nasıl yapıyorum?","Sipariş butonuyla bize e-posta gönderirsiniz; ödeme bağlantısı size e-postayla iletilir. Ödeme onaylandıktan sonra mevcut CV'nizi veya bilgilerinizi ve hedef ilanı göndermeniz yeterlidir."),("Ne kadar sürede teslim edilir?","Paket sayfasında belirtilen sürede, çoğunlukla 24-48 saat içinde e-postayla PDF olarak teslim edilir."),("İş garantisi var mı?","Hayır. Kimse iş garantisi veremez; biz CV'nizi işe alım süreçlerine uygun ve güçlü hâle getiririz."),("Bilgilerim paylaşılıyor mu?","Gönderdiğiniz bilgiler yalnızca CV çalışması için kullanılır, üçüncü kişilerle paylaşılmaz.")]
b=head(slug,"Profesyonel CV Hazırlama Hizmeti: CV İnceleme ve Sıfırdan CV Yazımı","Profesyonel CV hazırlama ve CV inceleme hizmeti: ATS uyumlu, ilana özel, Türkçe ve İngilizce CV yazımı. Uzman gözüyle geri bildirim, hızlı teslim.","profesyonel cv hazırlama, cv hazırlama hizmeti, cv inceleme, cv yazdırma, cv düzenleme, ücretli cv hazırlama",faq,"Profesyonel CV Hazırlama Hizmeti")
b+=hero("Profesyonel CV Hazırlama Hizmeti","Profesyonel CV Hazırlama ve İnceleme Hizmeti","Ücretsiz oluşturucuyla hazırladığınız CV'yi ilana özel ve ATS uyumlu olacak şekilde bir uzmana kontrol ettirin ya da tamamen sıfırdan yazdırın.")
b+=f'''    <h2>Paketler</h2>
    <div class="g-related-grid">
      <div class="g-related-card"><div class="g-rc-title">CV İnceleme ve Geri Bildirim — {PRICE_REVIEW} TL</div>
        <div class="g-rc-desc">Mevcut CV'nizi ATS uyumu, içerik ve düzen açısından inceleyip yazılı geri bildirim sunuyoruz. Düzeltme önerileriyle birlikte.</div><br />
        <a class="g-cta-btn" href="{ORDER_REVIEW}">İnceleme Sipariş Ver</a></div>
      <div class="g-related-card"><div class="g-rc-title">Sıfırdan Profesyonel CV — {PRICE_FULL} TL</div>
        <div class="g-rc-desc">Bilgilerinizden ilana özel, ATS uyumlu Türkçe CV hazırlıyoruz. PDF olarak, bir revizyon hakkıyla teslim edilir.</div><br />
        <a class="g-cta-btn" href="{ORDER_FULL}">CV Yazdır</a></div>
    </div>
    <h2>Süreç Nasıl İşliyor?</h2>
    <ol>
      <li>Paketi seçip sipariş e-postanızı gönderirsiniz; ödeme bağlantısı e-postayla iletilir ve ödemeyi tamamlarsınız.</li>
      <li>Mevcut CV'nizi (varsa), hedef ilanı ve temel bilgilerinizi gönderirsiniz.</li>
      <li>CV'niz ATS ve işe alımcı gözüyle ele alınır.</li>
      <li>Belirtilen sürede PDF olarak teslim edilir.</li>
    </ol>
    <h2>Neden Uzman Desteği?</h2>
    '''+ul(["İlan başına bir CV yerine ilana özel vurgu ve anahtar kelime uyumu","Sonuç odaklı deneyim maddeleri: 'ne yaptım' yerine 'ne değişti'","ATS'de bozulmayan sade düzen","İhtiyaç olursa <a href=\"/ingilizce-cv-ornegi\">İngilizce CV</a> ve <a href=\"/on-yazi-nasil-yazilir\">ön yazı</a> desteği"],'g-check-list')+'''
    <p>Önce kendiniz denemek isterseniz <a href="/?start=1">ücretsiz CV oluşturucu</a> ile başlayabilir, sonra bu hizmete geçebilirsiniz. Rol bazlı örneklere <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberinden ulaşabilirsiniz.</p>
'''+faq_html(faq)+"  </article>\n\n"
b+=tail("CV'nizi Uzmana Emanet Etmek İster misiniz?","Önce ücretsiz oluşturucuyla deneyin, gerekirse uzman desteği alın.","/?start=1",['cv-nasil-hazirlanir','ats-uyumlu-cv-sablonu','ingilizce-cv-ornegi','on-yazi-nasil-yazilir'])
open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

exec(open(ROOT+'/pages2.py',encoding='utf-8').read())
# ---------------- Mevcut sayfalara iç bağlantı bloğu ekle ----------------
EXIST=['ats-uyumlu-cv-sablonu','on-yazi-nasil-yazilir','yazilimci-cv-ornegi','pazarlamaci-cv-ornegi','satis-temsilcisi-cv-ornegi','yeni-mezun-cv-ornegi']
citycards=''.join(f'<a class="g-related-card" href="/{c["slug"]}"><div class="g-rc-title">{c["name"]} CV Hazırlama</div><div class="g-rc-desc">{esc(c["loc"])} iş başvurusu için rehber</div></a>' for c in C)
block=f'''  <section class="g-related">
    <h2>Daha Fazla Rehber</h2>
    <div class="g-related-grid">
      <a class="g-related-card" href="/cv-nasil-hazirlanir"><div class="g-rc-title">CV Nasıl Hazırlanır?</div><div class="g-rc-desc">8 adımda profesyonel CV</div></a>
      <a class="g-related-card" href="/ingilizce-cv-ornegi"><div class="g-rc-title">İngilizce CV Örneği</div><div class="g-rc-desc">Türkçe CV'den İngilizceye geçiş</div></a>
      <a class="g-related-card" href="/profesyonel-cv-hazirlama-hizmeti"><div class="g-rc-title">Profesyonel CV Hazırlama</div><div class="g-rc-desc">Uzman incelemesi ve CV yazımı</div></a>
    </div>
    <h2 style="margin-top:32px">Şehre Göre CV Rehberleri</h2>
    <div class="g-related-grid">{citycards}</div>
  </section>

'''
morecards=''.join(f'<a class="g-related-card" href="/{x}"><div class="g-rc-title">{esc(ALL[x][0])}</div><div class="g-rc-desc">{esc(ALL[x][1])}</div></a>' for x in NEWPAGES)
block=block.replace('    </div>\n    <h2 style="margin-top:32px">Şehre Göre','      '+morecards+'\n    </div>\n    <h2 style="margin-top:32px">Şehre Göre',1)
CTAP="<p style=\"margin-top:14px;font-size:14px\">CV'nizi bir uzmana kontrol ettirmek ister misiniz?"
for s_ in EXIST:
    p_=f'{PUB}/{s_}.html'; t=open(p_,encoding='utf-8').read()
    if 'Daha Fazla Rehber' in t:
        t=re.sub(r'  <section class="g-related">\s*<h2>Daha Fazla Rehber</h2>.*?</section>\n\n',lambda m:block,t,count=1,flags=re.S)
    else:
        t=t.replace('  <section class="g-final-cta">',block+'  <section class="g-final-cta">',1)
    if CTAP not in t:
        t=t.replace('</a>\n    </div>\n  </section>\n\n  <footer','</a>\n      '+CTAP+' <a href="/profesyonel-cv-hazirlama-hizmeti" style="text-decoration:underline">Profesyonel CV hazırlama hizmeti</a></p>\n    </div>\n  </section>\n\n  <footer',1)
    open(p_,'w',encoding='utf-8').write(t)

# ---------------- redirects / sitemap / noscript / landing ----------------
allslugs=EXIST+['cv-nasil-hazirlanir','ingilizce-cv-ornegi','profesyonel-cv-hazirlama-hizmeti']+NEWPAGES+[c['slug'] for c in C]
# Diskteki tüm rehber sayfalarını da kat (üreticide olmayan eski sayfalar sitemap/yönlendirmeden düşmesin)
_legal={'gizlilik-politikasi','kvkk-aydinlatma-metni','kullanim-sartlari','mesafeli-satis-sozlesmesi','iptal-ve-iade','iletisim'}
for _f in sorted(os.listdir(PUB)):
    if _f.endswith('.html') and _f[:-5] not in allslugs and _f[:-5] not in _legal:
        allslugs.append(_f[:-5])
# Üreticide tanımı olmayan eski sayfalar için başlık/açıklamayı HTML'den oku
import html as _hh
_orph=[s for s in allslugs if s not in ALL]
for _s in _orph:
    _t=open(f'{PUB}/{_s}.html',encoding='utf-8').read()
    _ti=_hh.unescape(re.search(r'<title>(.*?)</title>',_t,re.S).group(1)).replace(' | CVDoldur','').strip()
    _de=_hh.unescape(re.search(r'<meta name="description" content="(.*?)"\s*/?>',_t,re.S).group(1)).strip()
    ALL[_s]=(_ti,_de if len(_de)<=80 else _de[:79].rstrip()+'…','rehber')
red='# SEO rehber sayfaları: temiz URL -> statik .html (SPA yedek kuralından ÖNCE gelmeli)\n'+''.join(f'/{s}    /{s}.html    200\n' for s in allslugs)+'\n# Uygulama (SPA) yedek yönlendirmesi\n/*    /index.html   200\n'
open(PUB+'/_redirects','w').write(red)
sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://cvdoldur.com.tr/</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n'%TODAY
for s in allslugs:
    pr='0.9' if s in EXIST+['cv-nasil-hazirlanir','profesyonel-cv-hazirlama-hizmeti'] else '0.8'
    sm+=f'  <url>\n    <loc>{SITE}/{s}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>{pr}</priority>\n  </url>\n'
sm+='</urlset>\n'
open(PUB+'/sitemap.xml','w').write(sm)

# noscript
ix=open(ROOT+'/index.html',encoding='utf-8').read()
lis=''.join(f'        <li><a href="/{s}">{esc(ALL[s][0])}</a></li>\n' for s in allslugs)
ix=re.sub(r'<ul>.*?</ul>\n    </noscript>',lambda m:'<ul>\n'+lis+'      </ul>\n    </noscript>',ix,flags=re.S)
open(ROOT+'/index.html','w',encoding='utf-8').write(ix)

# Landing.tsx
lp=ROOT+'/src/components/Landing.tsx'; t=open(lp,encoding='utf-8').read()
def ts(items): return ',\n'.join("  { href: '/%s', title: %s, desc: %s }"%(s,json.dumps(ALL[s][0],ensure_ascii=False).replace('"',"'") if "'" not in ALL[s][0] else json.dumps(ALL[s][0],ensure_ascii=False),json.dumps(ALL[s][1],ensure_ascii=False)) for s in items)
g1=['cv-nasil-hazirlanir','cv-sablonu-nasil-secilir','ats-uyumlu-cv-sablonu','on-yazi-nasil-yazilir','ingilizce-cv-ornegi','is-basvuru-e-postasi-ornegi','is-ilani-sitelerine-cv-yukleme','mulakat-sorulari-ve-cevaplari','cv-de-fotograf-hobi-referans','cv-de-bosluk-nasil-aciklanir','kariyer-degisikligi-cv']
g3=['yazilimci-cv-ornegi','pazarlamaci-cv-ornegi','satis-temsilcisi-cv-ornegi','yeni-mezun-cv-ornegi']+[r['slug'] for r in ROLES]
g2=[c['slug'] for c in C]
for _s in _orph:
    if _s=='profesyonel-cv-hazirlama-hizmeti': continue
    (g2 if (_s.endswith('-cv-hazirlama') or _s.startswith('istanbul-')) else g3 if _s.endswith('-cv-ornegi') and _s!='ozgecmis-ornekleri' else g1).append(_s)
newdef='const guides = [\n'+ts(g1)+',\n];\n\nconst roleGuides = [\n'+ts(g3)+',\n];\n\nconst cityGuides = [\n'+ts(g2)+',\n];\n'
t=re.sub(r"const guides = \[.*?\n\];\n(?:\s*const (?:cityGuides|roleGuides) = \[.*?\n\];\n)*",lambda m:newdef,t,count=1,flags=re.S)
if 'roleGuides.map' not in t:
    anchor='        <h3 className="font-display text-2xl font-bold text-center text-slate-900 mt-14 mb-6">\n          Şehre Göre CV Rehberleri'
    assert anchor in t
    roleblock='''        <h3 className="font-display text-2xl font-bold text-center text-slate-900 mt-14 mb-6">
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

'''
    t=t.replace(anchor,roleblock+anchor,1)
open(lp,'w',encoding='utf-8').write(t)
print('pages:',len(allslugs))
exec(open(ROOT+'/legal.py',encoding='utf-8').read())

import siteshell; siteshell.main()
