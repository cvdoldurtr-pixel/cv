# -*- coding: utf-8 -*-
"""Tüm statik sayfalara ORTAK üst menü (kategoriler) + alt bilgi uygular, /rehberler sayfasını ve
src/utils/navData.ts dosyasını üretir. Tek kaynak: aşağıdaki CATS. Çalıştır: python3 siteshell.py
(build.py sonunda otomatik çalışır; tekrar çalıştırmak güvenlidir)."""
import re, glob, os, html, json
ROOT = os.path.dirname(os.path.abspath(__file__)); PUB = ROOT + '/public'
SITE = 'https://cvdoldur.com.tr'

LBL = {
 # CV hazırlama
 'cv-nasil-hazirlanir':'CV Nasıl Hazırlanır?','cv-sablonlari':'CV Şablonları','ats-uyumlu-cv-sablonu':'ATS Uyumlu CV',
 'cv-sablonu-nasil-secilir':'Şablon Nasıl Seçilir?','cv-kac-sayfa-olmali':'CV Kaç Sayfa Olmalı?',
 'cv-de-yetenekler-nasil-yazilir':'CV\'de Yetenekler','cv-de-fotograf-hobi-referans':'Fotoğraf, Hobi, Referans',
 'cv-de-bosluk-nasil-aciklanir':'CV\'de İş Boşluğu','word-mu-pdf-mi-cv-formati':'Word mü PDF mi?','ingilizce-cv-ornegi':'İngilizce CV',
 # meslek
 'yazilimci-cv-ornegi':'Yazılımcı','muhasebeci-cv-ornegi':'Muhasebeci','muhasebe-cv-ornegi':'Muhasebe ve Finans','ogretmen-cv-ornegi':'Öğretmen',
 'hemsire-cv-ornegi':'Hemşire','muhendis-cv-ornegi':'Mühendis','satis-temsilcisi-cv-ornegi':'Satış Temsilcisi','pazarlamaci-cv-ornegi':'Pazarlamacı',
 'kasiyer-tezgahtar-cv-ornegi':'Kasiyer / Tezgâhtar','sofor-kurye-cv-ornegi':'Şoför / Kurye','garson-restoran-cv-ornegi':'Garson',
 'grafik-tasarimci-cv-ornegi':'Grafik Tasarımcı','insan-kaynaklari-cv-ornegi':'İnsan Kaynakları','lojistik-uzman-cv-ornegi':'Lojistik Uzmanı',
 'sekreter-cv-ornegi':'Sekreter / Asistan','yeni-mezun-cv-ornegi':'Yeni Mezun','ozgecmis-ornekleri':'Tüm Özgeçmiş Örnekleri',
 # başvuru
 'on-yazi-nasil-yazilir':'Ön Yazı Nasıl Yazılır?','mulakat-sorulari-ve-cevaplari':'Mülakat Soruları','is-basvuru-e-postasi-ornegi':'Başvuru E-postası',
 'is-ilani-sitelerine-cv-yukleme':'İş Sitelerine CV Yükleme','linkedin-profili-nasil-hazirlanir':'LinkedIn Profili','kariyer-degisikligi-cv':'Kariyer Değişikliği',
 'profesyonel-cv-hazirlama-hizmeti':'Profesyonel CV Hizmeti',
 # şehir
 'istanbul-anadolu-yakasi-cv-rehberi':'İstanbul Anadolu Yakası','istanbul-avrupa-yakasi-cv-rehberi':'İstanbul Avrupa Yakası',
 'istanbul-yeni-mezun-is-bulma-rehberi':'İstanbul Yeni Mezun',
}
CITIES = {'hatay':'Hatay','adana':'Adana','mersin':'Mersin','gaziantep':'Gaziantep','istanbul':'İstanbul','ankara':'Ankara','izmir':'İzmir','bursa':'Bursa',
 'antalya':'Antalya','konya':'Konya','kayseri':'Kayseri','kocaeli':'Kocaeli','samsun':'Samsun','trabzon':'Trabzon','denizli':'Denizli','diyarbakir':'Diyarbakır',
 'eskisehir':'Eskişehir','malatya':'Malatya','manisa':'Manisa','sanliurfa':'Şanlıurfa'}
for c, n in CITIES.items(): LBL[c + '-cv-hazirlama'] = n

CATS = [
 ('cv-hazirlama', 'CV Hazırlama', 'CV yazımının temelleri: şablon, ATS, bölümler ve format.',
  ['cv-nasil-hazirlanir','cv-sablonlari','ats-uyumlu-cv-sablonu','cv-sablonu-nasil-secilir','cv-kac-sayfa-olmali','cv-de-yetenekler-nasil-yazilir',
   'cv-de-fotograf-hobi-referans','cv-de-bosluk-nasil-aciklanir','word-mu-pdf-mi-cv-formati','ingilizce-cv-ornegi']),
 ('meslek', 'Meslek Örnekleri', 'Meslek bazlı hazır CV örnekleri ve yazım rehberleri.',
  ['yazilimci-cv-ornegi','muhasebeci-cv-ornegi','muhasebe-cv-ornegi','ogretmen-cv-ornegi','hemsire-cv-ornegi','muhendis-cv-ornegi','satis-temsilcisi-cv-ornegi',
   'pazarlamaci-cv-ornegi','kasiyer-tezgahtar-cv-ornegi','sofor-kurye-cv-ornegi','garson-restoran-cv-ornegi','grafik-tasarimci-cv-ornegi',
   'insan-kaynaklari-cv-ornegi','lojistik-uzman-cv-ornegi','sekreter-cv-ornegi','yeni-mezun-cv-ornegi','ozgecmis-ornekleri']),
 ('sehir', 'Şehirlere Göre', 'Bulunduğunuz şehirde iş başvurusu için yerel CV rehberleri.',
  [c + '-cv-hazirlama' for c in CITIES] + ['istanbul-anadolu-yakasi-cv-rehberi','istanbul-avrupa-yakasi-cv-rehberi','istanbul-yeni-mezun-is-bulma-rehberi']),
 ('basvuru', 'Başvuru ve Mülakat', 'Ön yazı, başvuru e-postası, mülakat ve iş arama ipuçları.',
  ['on-yazi-nasil-yazilir','is-basvuru-e-postasi-ornegi','mulakat-sorulari-ve-cevaplari','is-ilani-sitelerine-cv-yukleme','linkedin-profili-nasil-hazirlanir',
   'kariyer-degisikligi-cv','profesyonel-cv-hizmeti-placeholder']),
]
CATS[3][3][-1] = 'profesyonel-cv-hazirlama-hizmeti'
MENU_MAX = 9
LEGAL = [('/gizlilik-politikasi','Gizlilik Politikası'),('/kvkk-aydinlatma-metni','KVKK Aydınlatma Metni'),('/kullanim-sartlari','Kullanım Şartları'),
         ('/mesafeli-satis-sozlesmesi','Mesafeli Satış Sözleşmesi'),('/iptal-ve-iade','İptal ve İade'),('/iletisim','İletişim')]
e = html.escape

def info(slug):
    t = open('%s/%s.html' % (PUB, slug), encoding='utf-8').read()
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S); d = re.search(r'<meta name="description" content="(.*?)"', t, re.S)
    return html.unescape(re.sub('<[^>]+>', '', h1.group(1))).strip() if h1 else slug, html.unescape(d.group(1)).strip() if d else ''

def exists(s): return os.path.exists('%s/%s.html' % (PUB, s))

def build_nav():
    parts = []
    for cid, name, _, slugs in CATS:
        slugs = [s for s in slugs if exists(s)]
        links = ''.join('<a href="/%s">%s</a>' % (s, e(LBL.get(s, info(s)[0]))) for s in slugs[:MENU_MAX])
        parts.append('<div class="g-dd"><button type="button" class="g-dd-btn" aria-expanded="false">%s <span aria-hidden="true">▾</span></button>'
                     '<div class="g-dd-panel">%s<a class="g-dd-all" href="/rehberler#%s">Tümünü gör →</a></div></div>' % (e(name), links, cid))
    return ('<header class="g-topbar" data-shell="1"><div class="g-topbar-inner">'
            '<a href="/" class="g-logo"><div class="g-logo-mark">C</div><div class="g-logo-text">CV<span>Doldur</span></div></a>'
            '<button type="button" class="g-burger" aria-label="Menüyü aç" aria-expanded="false"><span></span><span></span><span></span></button>'
            '<nav class="g-nav" aria-label="Ana menü">' + ''.join(parts) +
            '<a class="g-nav-link" href="/#fiyatlar">Fiyatlar</a><a class="g-nav-link" href="/iletisim">İletişim</a>'
            '<a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></nav></div></header>')

def build_footer():
    cols = ''
    for cid, name, _, slugs in CATS[:3]:
        slugs = [s for s in slugs if exists(s)][:7]
        cols += '<div class="g-fcol"><h4>%s</h4>%s<a class="g-fall" href="/rehberler#%s">Tümü →</a></div>' % (
            e(name), ''.join('<a href="/%s">%s</a>' % (s, e(LBL.get(s, info(s)[0]))) for s in slugs), cid)
    corp = '<div class="g-fcol"><h4>Kurumsal</h4><a href="/rehberler">Tüm Rehberler</a><a href="/profesyonel-cv-hazirlama-hizmeti">Profesyonel CV Hizmeti</a>' + \
           ''.join('<a href="%s">%s</a>' % (h, e(l)) for h, l in LEGAL) + '</div>'
    return ('<footer class="g-footer" data-shell="1"><div class="g-footer-grid"><div class="g-fbrand">'
            '<a href="/" class="g-logo"><div class="g-logo-mark">C</div><div class="g-logo-text">CV<span>Doldur</span></div></a>'
            '<p>Türkiye için tasarlanmış, yapay zeka destekli CV oluşturucu. Önizleme ve düzenleme ücretsiz; üyelik ve otomatik yenileme yok.</p>'
            '<a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div>' + cols + corp +
            '</div><div class="g-fbottom"><p class="g-fcopy">© 2026 CVDoldur · Kişisel veriler KVKK kapsamında işlenir · Kart bilgisi sitede saklanmaz</p>'
            '<a class="ako-sign" href="https://www.akodijital.com" target="_blank" rel="noopener" aria-label="AKO Dijital: tasarım ve geliştirme"><span class="ako-ico"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4L12 19.5l-2.4-6.1-6.1-2.4 6.1-2.4z"/></svg></span>'
            '<span class="ako-txt"><small>TASARIM VE GELİŞTİRME</small><b>AKO Dijital</b><em>www.akodijital.com</em></span></a></div></footer>'
            '<script>(function(){var b=document.querySelector(".g-burger"),n=document.querySelector(".g-nav");if(!b)return;'
            'b.addEventListener("click",function(){var o=n.classList.toggle("open");b.setAttribute("aria-expanded",o)});'
            'document.querySelectorAll(".g-dd-btn").forEach(function(x){x.addEventListener("click",function(){var d=x.parentNode,o=d.classList.toggle("open");x.setAttribute("aria-expanded",o)})});'
            'document.addEventListener("keydown",function(ev){if(ev.key==="Escape"){document.querySelectorAll(".g-dd.open").forEach(function(d){d.classList.remove("open")})}})})();</script>')

CSS = '''
/* === SHELL (siteshell.py) === */
/* Tek kaynak: üst menü, alt bilgi, butonlar, CTA kutusu. Ana sayfa (Landing.tsx) ile aynı ölçüleri kullanır. */
:root{--g-wrap:1180px;--g-gut:24px;--g-head:72px;--teal-900:#134e4a}
body{min-height:100vh;display:flex;flex-direction:column}
body>*{width:100%;flex-shrink:0}
body>script{display:none}
a:focus-visible,button:focus-visible{outline:2px solid #5eead4;outline-offset:2px}

/* Butonlar: varsayılan koyu teal dolgu; koyu zeminlerde (menü, footer, son CTA) beyaz */
.g-cta-btn{display:inline-flex;align-items:center;justify-content:center;background:#0f766e;color:#fff;font:700 14px/1 Inter,system-ui,sans-serif;padding:13px 20px;border-radius:12px;text-decoration:none;white-space:nowrap;border:0;cursor:pointer;box-shadow:0 4px 14px rgba(13,148,136,.28);transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
.g-cta-btn:hover{background:#115e59;transform:translateY(-1px);box-shadow:0 8px 20px rgba(13,148,136,.34);text-decoration:none}
.g-topbar .g-cta-btn,.g-footer .g-cta-btn,.g-final-cta-box .g-cta-btn{background:#fff;color:var(--teal-900);box-shadow:0 4px 14px rgba(0,0,0,.2)}
.g-topbar .g-cta-btn:hover,.g-footer .g-cta-btn:hover,.g-final-cta-box .g-cta-btn:hover{background:#f0fdfa;color:var(--teal-900)}

/* Üst menü */
.g-topbar{background:linear-gradient(135deg,#0f172a 0%,#0f3d3a 55%,#0f172a 100%);padding:0 var(--g-gut);position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,.06)}
.g-topbar-inner{max-width:var(--g-wrap);margin:0 auto;height:var(--g-head);display:flex;align-items:center;gap:16px}
.g-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.g-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#2dd4bf 0%,#0d9488 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;box-shadow:0 4px 14px rgba(13,148,136,.35);flex-shrink:0}
.g-logo-text{color:#fff;font-weight:700;font-size:20px;letter-spacing:-.01em;line-height:1}
.g-logo-text span{color:#5eead4}
.g-nav{display:flex;align-items:center;align-self:stretch;gap:4px;margin-left:auto}
.g-dd{position:relative;display:flex;align-items:center;align-self:stretch}
.g-dd-btn,.g-nav-link{background:none;border:0;color:#e2e8f0;font:600 14px Inter,system-ui,sans-serif;padding:10px 12px;border-radius:10px;cursor:pointer;text-decoration:none;white-space:nowrap}
.g-dd-btn:hover,.g-nav-link:hover,.g-dd:focus-within .g-dd-btn,.g-dd.open .g-dd-btn{background:rgba(255,255,255,.1);color:#fff}
.g-dd-panel{display:none;position:absolute;top:100%;right:0;min-width:240px;max-height:70vh;overflow:auto;background:#fff;border-radius:14px;padding:8px;box-shadow:0 18px 40px rgba(15,23,42,.28);z-index:60}
.g-dd:hover .g-dd-panel,.g-dd:focus-within .g-dd-panel,.g-dd.open .g-dd-panel{display:block}
.g-dd-panel a{display:block;padding:8px 12px;border-radius:8px;color:var(--slate-700);font-size:14px;text-decoration:none}
.g-dd-panel a:hover{background:var(--slate-100);color:var(--primary-dark)}
.g-dd-panel a.g-dd-all{margin-top:4px;border-top:1px solid var(--slate-200);border-radius:0 0 8px 8px;color:var(--primary-dark);font-weight:600}
.g-nav .g-cta-btn{margin-left:8px}
.g-burger{display:none;background:none;border:0;padding:8px;cursor:pointer;margin-left:auto}
.g-burger span{display:block;width:22px;height:2px;background:#fff;margin:5px 0;border-radius:2px}
@media(max-width:960px){
 :root{--g-gut:16px;--g-head:64px}
 .g-burger{display:block}
 .g-nav{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;align-items:stretch;align-self:auto;gap:0;background:#0f172a;padding:10px 16px 18px;max-height:80vh;overflow:auto;margin:0}
 .g-nav.open{display:flex}
 .g-dd{display:block;align-self:auto}
 .g-dd-btn,.g-nav-link{width:100%;text-align:left;padding:12px}
 .g-dd-panel{position:static;display:none;box-shadow:none;background:rgba(255,255,255,.06);max-height:none;margin:0 0 6px}
 .g-dd:hover .g-dd-panel{display:none}.g-dd.open .g-dd-panel{display:block}
 .g-dd-panel a{color:#cbd5e1}.g-dd-panel a:hover{background:rgba(255,255,255,.1);color:#fff}
 .g-dd-panel a.g-dd-all{border-color:rgba(255,255,255,.15);color:#5eead4}
 .g-nav .g-cta-btn{margin:10px 0 0}
}

/* Son CTA kutusu (tek tanım, ortalı) */
.g-final-cta{max-width:900px;margin:0 auto;padding:16px var(--g-gut) 72px}
.g-final-cta-box{background:linear-gradient(135deg,#0f766e 0%,#115e59 55%,#0f172a 100%);border-radius:24px;padding:52px 32px;text-align:center;color:#fff;box-shadow:0 24px 50px -24px rgba(15,23,42,.45)}
.g-final-cta-box h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(24px,4vw,34px);line-height:1.2;margin:0 0 12px;font-weight:700;color:#fff}
.g-final-cta-box p{color:#99f6e4;font-size:16px;max-width:480px;margin:0 auto 26px}
.g-final-cta-box .g-cta-btn{padding:16px 34px;font-size:16px;border-radius:14px}
.g-final-cta-box p:last-child{font-size:14px;margin:20px auto 0;max-width:520px;line-height:1.6}
.g-final-cta-box p a{color:#99f6e4;text-decoration:underline;text-underline-offset:2px}
.g-final-cta-box p a:hover{color:#fff}
@media(max-width:640px){.g-final-cta-box{padding:36px 20px}}

/* Alt bilgi */
.g-footer{margin-top:auto;background:linear-gradient(135deg,#0f172a 0%,#0f3d3a 60%,#0f172a 100%);color:#cbd5e1;text-align:left;padding:56px var(--g-gut) 28px;border-top:0}
.g-footer-grid{max-width:var(--g-wrap);margin:0 auto;display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:32px}
.g-fbrand p{font-size:13px;line-height:1.65;color:#94a3b8;margin:14px 0 18px;max-width:300px}
.g-fcol h4{color:#fff;font-size:14px;font-weight:600;margin:0 0 12px}
.g-fcol a{display:block;color:#cbd5e1;font-size:13px;padding:4px 0;text-decoration:none}
.g-fcol a:hover{color:#5eead4;text-decoration:none}
.g-footer .g-fall{color:#5eead4;font-weight:600}
.g-fbottom{max-width:var(--g-wrap);margin:36px auto 0;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);font-size:12px;color:#94a3b8;text-align:center}
@media(max-width:960px){.g-footer-grid{grid-template-columns:1fr 1fr}.g-fbrand{grid-column:1/-1}.g-fbrand p{max-width:none}}
@media(max-width:520px){.g-footer-grid{grid-template-columns:1fr}}

/* Yasal sayfalar ve genel makale başlığı (h1, kırıntı, güncelleme notu) */
.g-crumb{font-size:13px;color:var(--slate-500);margin:0 0 14px}
.g-crumb a{color:var(--primary-dark);text-decoration:none}.g-crumb a:hover{text-decoration:underline}
main.g-article{padding-top:40px;padding-bottom:64px}
.g-article>h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,4.5vw,40px);font-weight:700;line-height:1.2;color:var(--slate-900);margin:0 0 10px}
.g-article>.g-lede{font-size:14px;color:var(--slate-500);margin:0 0 22px}
.g-article a{color:var(--primary-dark)}

.g-contact-intro{font-size:16px;color:var(--slate-700);margin:0 0 24px}
.g-form{background:#fff;border:1px solid var(--slate-200);border-radius:20px;padding:28px;box-shadow:0 8px 30px rgba(15,23,42,.05);display:grid;gap:16px}
.g-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:end}
.g-form label{display:grid;gap:6px;font-size:14px;font-weight:600;color:var(--slate-900)}
.g-form label em{font-style:normal;font-weight:400;color:var(--slate-500)}
.g-form input,.g-form select,.g-form textarea{font:400 15px Inter,system-ui,sans-serif;color:var(--slate-900);background:var(--slate-50);border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;width:100%;transition:border-color .15s,box-shadow .15s,background .15s}
.g-form textarea{resize:vertical;min-height:140px}
.g-form input:focus,.g-form select:focus,.g-form textarea:focus{outline:0;background:#fff;border-color:var(--primary);box-shadow:0 0 0 3px rgba(13,148,136,.18)}
.g-article .g-form-note{font-size:13px;color:var(--slate-500);margin:0}
.g-article .g-form-status{margin:0;font-size:14px}
.g-form select{height:46px}
.g-form .g-cta-btn{justify-self:start;padding:14px 28px;font-size:15px}
.g-form .g-cta-btn:disabled{opacity:.6;cursor:wait;transform:none}
.g-form-status{margin:0;font-size:14px;font-weight:600;min-height:20px}
.g-form-status.ok{color:#047857}.g-form-status.err{color:#be123c}
@media(max-width:640px){.g-form{padding:20px}.g-form-row{grid-template-columns:1fr}.g-form .g-cta-btn{justify-self:stretch}}

/* Rehber merkezi */
.g-hub{max-width:var(--g-wrap);margin:0 auto;padding:40px var(--g-gut) 56px}
.g-hub h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(28px,4.5vw,40px);line-height:1.2;color:var(--slate-900);margin:6px 0 10px}
.g-hub .g-hub-lede{color:var(--slate-600);max-width:700px;line-height:1.7}
.g-hub-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 4px}
.g-hub-tabs a{padding:8px 14px;border-radius:999px;background:var(--slate-100);color:var(--slate-700);font-size:14px;font-weight:600;text-decoration:none}
.g-hub-tabs a:hover{background:var(--primary-dark);color:#fff}
.g-hub h2{font-size:22px;color:var(--slate-900);margin:38px 0 4px;scroll-margin-top:90px}
.g-hub .g-hub-sub{color:var(--slate-500);font-size:14px;margin:0 0 14px}
.g-hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.g-hub-card{display:block;background:#fff;border:1px solid var(--slate-200);border-radius:14px;padding:16px;text-decoration:none;transition:.15s}
.g-hub-card:hover{border-color:var(--primary);box-shadow:0 8px 22px rgba(15,23,42,.08);transform:translateY(-2px)}
.g-hub-card b{display:block;color:var(--slate-900);font-size:15px;margin-bottom:6px;line-height:1.35}
.g-hub-card span{color:var(--slate-500);font-size:13px;line-height:1.5;display:block}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
.g-fbottom{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;text-align:left}
.g-fcopy{margin:0;line-height:1.6}
.ako-sign{display:inline-flex;align-items:center;gap:12px;padding:10px 16px 10px 12px;border:1px solid rgba(251,191,36,.35);border-radius:14px;background:rgba(255,255,255,.04);text-decoration:none;color:#e2e8f0;transition:border-color .25s,box-shadow .25s,background .25s}
.ako-ico{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f172a;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.ako-txt{display:flex;flex-direction:column;line-height:1.25}
.ako-txt small{font-size:9px;letter-spacing:.14em;color:#fbbf24;font-weight:600}
.ako-txt b{font-size:15px;color:#fff;font-weight:700}
.ako-txt em{font-style:normal;font-size:11px;color:#94a3b8}
.ako-sign:hover,.ako-sign:focus-visible{border-color:#fbbf24;background:rgba(251,191,36,.08);box-shadow:0 0 0 3px rgba(251,191,36,.15),0 8px 24px rgba(0,0,0,.35)}
.ako-sign:hover .ako-ico,.ako-sign:focus-visible .ako-ico{transform:rotate(360deg)}
.ako-sign:hover b,.ako-sign:hover em,.ako-sign:focus-visible b,.ako-sign:focus-visible em{text-decoration:underline;text-underline-offset:3px}
@media(max-width:640px){.g-fbottom{justify-content:center;text-align:center}}
@media(prefers-reduced-motion:reduce){.ako-ico{transition:none}.ako-sign:hover .ako-ico{transform:none}}

'''

def hub_page():
    base = open(PUB + '/iletisim.html', encoding='utf-8').read(); head = base[:base.find('<body')]
    head = re.sub(r'<title>.*?</title>', '<title>CV Rehberleri: Örnekler, Şablonlar ve Şehir Rehberleri | CVDoldur</title>', head, flags=re.S)
    head = re.sub(r'(<meta name="description" content=").*?(")', r'\1Meslek bazlı CV örnekleri, şehre özel CV rehberleri, ATS uyumlu şablonlar, ön yazı ve mülakat ipuçları: tüm CVDoldur rehberleri tek sayfada.\2', head, flags=re.S)
    head = re.sub(r'(rel="canonical" href=")[^"]*"', r'\1%s/rehberler"' % SITE, head)
    tabs = ''.join('<a href="#%s">%s</a>' % (c, e(n)) for c, n, _, _ in CATS)
    secs = ''
    for cid, name, sub, slugs in CATS:
        cards = ''
        for s in [x for x in slugs if exists(x)]:
            t, d = info(s)
            cards += '<a class="g-hub-card" href="/%s"><b>%s</b><span>%s</span></a>' % (s, e(t), e(d[:130] + ('…' if len(d) > 130 else '')))
        secs += '<h2 id="%s">%s</h2><p class="g-hub-sub">%s</p><div class="g-hub-grid">%s</div>' % (cid, e(name), e(sub), cards)
    body = ('<body>\n%s\n<main class="g-hub"><nav class="g-crumb"><a href="/">Ana Sayfa</a> / Rehberler</nav><h1>CV Rehberleri</h1>'
            '<p class="g-hub-lede">İş başvurusunu güçlendirecek tüm rehberler tek yerde. Mesleğinize veya şehrinize göre örneklere göz atın, ardından CV\'nizi ücretsiz hazırlayın.</p>'
            '<div class="g-hub-tabs">%s</div>%s</main>\n%s\n</body>\n</html>\n') % ('@@H@@', tabs, secs, '@@F@@')
    open(PUB + '/rehberler.html', 'w', encoding='utf-8').write(head + body)

def main():
    css = open(PUB + '/guide.css', encoding='utf-8').read()
    css = css.split('/* === SHELL (siteshell.py) === */')[0].rstrip() + '\n' + CSS
    open(PUB + '/guide.css', 'w', encoding='utf-8').write(css)
    hub_page(); H, F = build_nav(), build_footer(); n = 0
    for f in glob.glob(PUB + '/*.html'):
        t = open(f, encoding='utf-8').read(); o = t
        t = t.replace('@@H@@', H).replace('@@F@@', F)
        t = re.sub(r'<header class="g-topbar".*?</header>', lambda m: H, t, count=1, flags=re.S)
        t = re.sub(r'<footer class="g-footer".*?</footer>(\s*<script>\(function\(\)\{var b=document\.querySelector\(".g-burger"\).*?</script>)?', lambda m: F, t, count=1, flags=re.S)
        if t != o: open(f, 'w', encoding='utf-8').write(t); n += 1
    # yönlendirme + sitemap
    r = open(PUB + '/_redirects', encoding='utf-8').read()
    if '/rehberler ' not in r:
        r = r.replace('/gizlilik-politikasi ', '/rehberler    /rehberler.html    200\n/gizlilik-politikasi ', 1); open(PUB + '/_redirects', 'w', encoding='utf-8').write(r)
    sm = open(PUB + '/sitemap.xml', encoding='utf-8').read()
    if '/rehberler<' not in sm:
        sm = sm.replace('</urlset>', '  <url>\n    <loc>%s/rehberler</loc>\n    <lastmod>2026-10-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>' % SITE)
        open(PUB + '/sitemap.xml', 'w', encoding='utf-8').write(sm)
    # React için veri
    data = [{'id': c, 'label': n, 'items': [{'href': '/' + s, 'label': LBL.get(s, info(s)[0])} for s in sl if exists(s)]} for c, n, _, sl in CATS]
    os.makedirs(ROOT + '/src/utils', exist_ok=True)
    open(ROOT + '/src/utils/navData.ts', 'w', encoding='utf-8').write('// siteshell.py tarafından üretilir; elle değiştirmeyin.\nexport const NAV = %s as const;\nexport const LEGAL_LINKS = %s as const;\n' % (json.dumps(data, ensure_ascii=False, indent=1), json.dumps([{'href': h, 'label': l} for h, l in LEGAL], ensure_ascii=False)))
    print('güncellenen sayfa:', n)

if __name__ == '__main__': main()
