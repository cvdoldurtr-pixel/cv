# -*- coding: utf-8 -*-
# build.py içinden exec edilir (head, hero, ul, faq_html, tail, esc, PUB, ALL global)
def role_page(r):
    slug=r['slug']
    b=head(slug,r['title'],r['mdesc'],r['kw'],r['faq'],r['short'])
    b+=hero(r['short'],r['h1'],r['lede'])
    n=r['short'].replace(' CV Örneği','')
    b+=f"    <h2>{n} CV'sinde Mutlaka Olması Gerekenler</h2>\n    <p>{n} pozisyonu için hazırlanan bir CV'de işe alım uzmanı ve tarama sistemi şu bilgileri arar:</p>\n    {ul(r['must'],'g-check-list')}\n"
    b+=f"    <h2>{n} CV'si İçin Örnek Özet</h2>\n    <div class=\"g-example\"><span class=\"g-example-label\">Örnek</span>\"{r['sample']}\"</div>\n    <p>Kurgusal bir örnektir; kendi gerçek deneyiminize ve rakamlarınıza göre uyarlayın.</p>\n"
    b+="    <h2>Deneyim Maddelerini Görev Değil, Sonuç Olarak Yazın</h2>\n"
    for bad,good in r['pairs']:
        b+=f'    <div class="g-example g-bad"><span class="g-example-label">Zayıf</span>"{bad}"</div>\n    <div class="g-example"><span class="g-example-label">Güçlü</span>"{good}"</div>\n'
    b+="    <p>Elinizde net bir rakam yoksa uydurmayın; teslim süresi, müşteri sayısı, hata oranı gibi gerçek bir ölçü seçin. Mülakatta her sayının kaynağı sorulabilir.</p>\n"
    b+=f"    <h2>{n} CV'sinde Beceriler Bölümü Nasıl Yazılır?</h2>\n    <p>Becerileri tek uzun liste yerine gruplayın; hem okunması hem taranması kolaylaşır:</p>\n    "+ul([f"<strong>{g}:</strong> {t}" for g,t in r['skills']])+"\n"
    if r.get('terms'):
        b+=f"    <h2>{n} İş İlanlarında Sık Geçen Anahtar Kelimeler</h2>\n    <p>{n} ilanlarında tekrar eden ifadeleri, gerçekten sahip olduğunuz deneyimle eşleştirerek CV'nize doğal biçimde yerleştirin (yalnızca yaptığınız işleri yazın):</p>\n    "+ul(r['terms'])+"\n"
        b+=f"    <h2>Deneyim Seviyesine Göre {n} CV'si</h2>\n    <p><strong>Yeni başlayanlar:</strong> {r['levels'][0]}</p>\n    <p><strong>Deneyimliler:</strong> {r['levels'][1]}</p>\n"
        b+=f"    <h2>{n} Mülakatında Sık Sorulan Sorular</h2>\n    <p>CV'nize yazdığınız her madde mülakatta sorulabilir; şu soruları önceden düşünün:</p>\n    "+ul(r['iq'])+"\n"
    b+=f"    <h2>{n} CV'sinde Sık Yapılan Hatalar</h2>\n    {ul(r['mist'],'g-x-list')}\n"
    b+='''    <p>CV'nizi sade tutmak için <a href="/ats-uyumlu-cv-sablonu">ATS uyumlu CV şablonu</a> kurallarını, adımları görmek için <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberini, başvuru sonrası hazırlık için <a href="/mulakat-sorulari-ve-cevaplari">mülakat soruları ve cevapları</a> yazısını inceleyin.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>CV'nizi 3 dakikada hazırlayın.</strong> Kayıt gerekmez, önizleme ücretsiz; filigransız PDF için 30 günlük Premium gerekir.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''
    b+=faq_html(r['faq'])+"  </article>\n\n"
    b+=tail(f"{n} Başvurunuz İçin Hazır mısınız?","Ücretsiz oluşturucuyla CV'nizi hazırlayın, PDF olarak indirin.","/?start=1",['cv-nasil-hazirlanir','ats-uyumlu-cv-sablonu','mulakat-sorulari-ve-cevaplari','profesyonel-cv-hazirlama-hizmeti','yeni-mezun-cv-ornegi','istanbul-cv-hazirlama'])
    open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

for r in ROLES: role_page(r)

# ---- Mülakat ----
slug='mulakat-sorulari-ve-cevaplari'
faq=[("Mülakata nasıl hazırlanılır?","Şirketi ve ilanı okuyun, CV'nizdeki her maddeyi anlatabilecek hâle gelin, en sık sorulan soruların cevaplarını yüksek sesle prova edin."),("Mülakatta ne giyilmeli?","Şirket kültürüne uygun, temiz ve rahat bir kıyafet. Emin değilseniz bir kademe resmî tarafı seçin."),("Cevabını bilmediğim soruda ne yapmalıyım?","Dürüst olun, düşünme süresi isteyin ve benzer bir deneyimle yaklaşımınızı anlatın.")]
b=head(slug,"Mülakat Soruları ve Cevapları: En Sık Sorulan 10 Soru ve Cevap Yaklaşımı","İş mülakatı soruları ve cevapları: kendinizden bahsedin, maaş beklentisi, neden ayrıldınız gibi en sık sorulan 10 mülakat sorusu ve nasıl cevaplanacağı.","mülakat soruları, mülakat soruları ve cevapları, iş görüşmesi soruları, mülakatta sorulan sorular, kendinden bahseder misin cevabı, maaş beklentisi nasıl söylenir",faq,"Mülakat Soruları ve Cevapları")
b+=hero("Mülakat Soruları ve Cevapları","Mülakat Soruları ve Cevapları: En Sık Sorulan 10 Soru","CV'niz sizi mülakat kapısına getirir; kapıdan içeri girdiğinizde ise hazırlığınız konuşur. Aşağıdaki sorular Türkiye'deki iş görüşmelerinde en sık karşınıza çıkan sorulardır.")
for i,(q,a) in enumerate(MULAKAT,1):
    b+=f"    <h2>{i}. {q}</h2>\n    <p>{a}</p>\n"
b+="    <h2>Mülakat Öncesi Kısa Kontrol Listesi</h2>\n    "+ul(["CV'nizdeki her maddeyi anlatabilecek durumda olun","Şirketin ürün ve hizmetlerini kısaca inceleyin","Yol ve zamanı önceden planlayın","Bir kopya CV ve not defteri yanınızda olsun","Sorularınızı önceden hazırlayın"],'g-check-list')+'''
    <p>Mülakata çağrılmak için önce güçlü bir CV gerekir; <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberi ve <a href="/on-yazi-nasil-yazilir">ön yazı</a> yazısı bu konuda yardımcı olur. Yabancı şirketler için <a href="/ingilizce-cv-ornegi">İngilizce CV örneğine</a> de göz atın.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>Mülakata gitmeden önce CV'nizi güncelleyin.</strong> Ücretsiz oluşturucu ile 3 dakikada hazırlayın.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''+faq_html(faq)+"  </article>\n\n"
b+=tail("Mülakata Hazır mısınız?","CV'nizi güncelleyin ve PDF olarak indirin.","/?start=1",['cv-nasil-hazirlanir','on-yazi-nasil-yazilir','ingilizce-cv-ornegi','profesyonel-cv-hazirlama-hizmeti','yeni-mezun-cv-ornegi','ats-uyumlu-cv-sablonu'])
open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

# ---- İş ilanı siteleri ----
slug='is-ilani-sitelerine-cv-yukleme'
faq=[("CV'yi PDF mi Word mü yüklemeliyim?","Siteler genellikle PDF ve Word kabul eder; düzen bozulmasın diye PDF tercih edilir. İlanın ya da sitenin özel bir isteği varsa ona uyun."),("Kariyer sitelerinde profil bilgisi ile CV aynı mı olmalı?","Evet, tutarlı olmalı. Unvan, tarih ve şirket adları arasında fark olmamasına dikkat edin."),("CV'mi ne sıklıkla güncellemeliyim?","Her önemli değişiklikte ve en az birkaç ayda bir; güncel profiller daha sık dikkate alınır.")]
b=head(slug,"İş İlanı Sitelerine CV Yükleme: Kariyer.net, LinkedIn, Indeed ve İŞKUR İçin İpuçları","İş ilanı sitelerine CV yükleme rehberi: Kariyer.net, LinkedIn, Indeed ve İŞKUR profilinde CV'nizi nasıl hazırlar, hangi bilgileri eklersiniz, nelere dikkat edersiniz.","kariyer.net cv yükleme, linkedin cv hazırlama, indeed cv yükleme, iskur cv yükleme, iş ilanı sitesi cv, cv nasıl yüklenir, iş başvurusu cv",faq,"İş İlanı Sitelerine CV Yükleme")
b+=hero("İş İlanı Sitelerine CV Yükleme","İş İlanı Sitelerine CV Yükleme ve Profil İpuçları","Kariyer.net, LinkedIn, Indeed ve İŞKUR gibi platformlarda CV'niz hem sistem hem işe alım uzmanı tarafından görülür. Aşağıdaki genel ilkeler hangi siteyi kullanırsanız kullanın işe yarar.")
b+='''    <h2>1. Profilinizi Eksiksiz Doldurun</h2>
    <p>Kariyer sitelerinde tamamlanmış bir profil, boş bırakılmış alanlara göre daha güvenilir görünür. Unvan, deneyim, eğitim, beceri ve iletişim alanlarını eksiksiz yazın.</p>
    <h2>2. İlanın Anahtar Kelimelerini Kullanın</h2>
    <p>Başvurduğunuz pozisyonun ilanında geçen unvan, araç ve sorumluluk kelimelerini CV'nize doğal biçimde yerleştirin. Bu, hem <a href="/ats-uyumlu-cv-sablonu">ATS taramasında</a> hem de işe alımcının ilk okumasında eşleşmeyi artırır.</p>
    <h2>3. CV Dosyasını Doğru Hazırlayın</h2>
    '''+ul(["Dosya adını 'Ad-Soyad-CV.pdf' olarak verin","Sade, tek sütunlu ve okunabilir bir şablon kullanın","Dosya boyutunu küçük tutun","Yükledikten sonra önizlemeyle metnin bozulmadığını kontrol edin"],'g-check-list')+'''
    <h2>4. Platforma Göre Küçük Farklar</h2>
    '''+ul(["<strong>Kariyer sitesi profili:</strong> yazılı alanlarla CV dosyası uyumlu olmalı.","<strong>LinkedIn:</strong> başlık, hakkında ve deneyim alanları birer mini CV gibi yazılmalı; bağlantıyı CV'ye ekleyin.","<strong>Indeed:</strong> kısa ve net bir CV; ilan başına ilgili anahtar kelimeleri kullanın.","<strong>İŞKUR:</strong> kayıt bilgilerinizi güncel tutun; meslek ve tercih alanlarını doğru seçin."])+'''
    <h2>5. Gizlilik ve Güvenlik</h2>
    <p>CV'nizi yüklerken gereksiz kişisel bilgi (TC kimlik numarası, açık adres, banka bilgisi) paylaşmayın. Yalnızca ad, telefon, e-posta, şehir ve profesyonel bağlantılar yeterlidir.</p>
    <h2>Sık Yapılan Hatalar</h2>
    '''+ul(["Farklı sitelerde birbirini tutmayan bilgi girmek","Eski CV'yi güncellemeden yüklemek","Her ilana aynı CV'yi göndermek","Profesyonel olmayan e-posta adresi kullanmak","CV'yi yükleyip ön yazıyı atlamak"],'g-x-list')+'''
    <p>CV'nizi sıfırdan hazırlamak için <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberini, mülakat aşaması için <a href="/mulakat-sorulari-ve-cevaplari">mülakat soruları</a> yazısını kullanabilirsiniz.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>Sitelere yüklemeden önce CV'nizi hazırlayın.</strong> Ücretsiz, kayıtsız, ATS uyumlu.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''+faq_html(faq)+"  </article>\n\n"
b+=tail("CV'nizi Sitelere Yüklemeye Hazır mısınız?","Önce ATS uyumlu CV'nizi hazırlayın, sonra platformlara yükleyin.","/?start=1",['cv-nasil-hazirlanir','ats-uyumlu-cv-sablonu','istanbul-cv-hazirlama','ankara-cv-hazirlama','profesyonel-cv-hazirlama-hizmeti','mulakat-sorulari-ve-cevaplari'])
open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

# ---- Evergreen rehberler ----
def guide_page(g):
    slug=g['slug']
    b=head(slug,g['title'],g['mdesc'],g['kw'],g['faq'],g['short'])
    b+=hero(g['short'],g['h1'],g['lede'])
    for h,t in g['secs']:
        b+=f"    <h2>{h}</h2>\n    <p>{t}</p>\n"
    for h,items,cls in g['lists']:
        b+=f"    <h2>{h}</h2>\n    "+ul(items,cls)+"\n"
    b+='''    <p>Adım adım hazırlık için <a href="/cv-nasil-hazirlanir">CV nasıl hazırlanır</a> rehberine, başvuru sonrası hazırlık için <a href="/mulakat-sorulari-ve-cevaplari">mülakat soruları ve cevapları</a> yazısına bakın.</p>
    <div class="g-inline-cta"><div class="g-inline-cta-box"><p><strong>CV'nizi 3 dakikada hazırlayın.</strong> Kayıt gerekmez, önizleme ücretsiz; filigransız PDF için 30 günlük Premium gerekir.</p><a href="/?start=1" class="g-cta-btn">Ücretsiz CV Oluştur</a></div></div>
'''
    b+=faq_html(g['faq'])+"  </article>\n\n"
    b+=tail(g['h1']+" — Şimdi Uygulayın","Ücretsiz oluşturucuyla CV'nizi hazırlayın, PDF olarak indirin.","/?start=1",['cv-nasil-hazirlanir','ats-uyumlu-cv-sablonu','mulakat-sorulari-ve-cevaplari','on-yazi-nasil-yazilir','profesyonel-cv-hazirlama-hizmeti','ingilizce-cv-ornegi'])
    open(f'{PUB}/{slug}.html','w',encoding='utf-8').write(b)

for g in GUIDES: guide_page(g)
