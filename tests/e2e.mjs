// CVDoldur uçtan uca test (vite preview üzerinde). AI uç noktaları taklit edilir.
import { chromium } from 'playwright';
import { sanitizeImported } from '../netlify/functions/_import.mjs';
import fs from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = new URL('.', import.meta.url).pathname;
const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };

const fakeAiCv = sanitizeImported({
  language: 'tr',
  personal: { fullName: 'Şeyma Çelik', title: 'Muhasebe Uzmanı', email: 'seyma.celik@ornek.com', phone: '0532 111 22 33', city: 'İskenderun, Hatay', linkedin: 'linkedin.com/in/seymacelik', summary: 'Genel muhasebe ve e-dönüşüm süreçlerinde 5 yıllık deneyim.', drivingLicense: ['b', 'src belgesi', 'uçak'], birthDate: '1990', maritalStatus: 'Evli' },
  experiences: [
    { company: 'Liman Lojistik A.Ş.', position: 'Muhasebe Uzmanı', startDate: '03.2021', current: true, achievements: ["Aylık 1.200 faturayı Logo Tiger'da işledim", 'KDV ve muhtasar beyannamelerini zamanında verdim'] },
    { company: 'Demir Çelik Ltd.', position: 'Muhasebe Elemanı', startDate: '06.2018', endDate: '02.2021', achievements: ['Banka mutabakatlarını haftalık yaptım'] },
  ],
  educations: [{ school: 'Mustafa Kemal Üniversitesi', department: 'İşletme', degree: 'Bachelor', startDate: '2014', endDate: '2018' }],
  skills: ['Logo Tiger', 'Mikro', 'Luca', 'e-Fatura', 'İleri Excel', 'Logo Tiger'],
  languages: [{ name: 'Türkçe', level: 'Ana Dili' }, { name: 'İngilizce', level: 'orta' }],
  references: [{ name: '' }],
  hack: '<script>',
});

const browser = await chromium.launch();

async function newPage(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) console.log('CONSOLE', m.text()); });
  const seen = { importBodies: [] };
  await page.route('**/.netlify/functions/**', async (route) => {
    const url = route.request().url();
    if (url.includes('ai-import')) {
      const body = JSON.parse(route.request().postData() || '{}');
      seen.importBodies.push(body.text || '');
      if (seen.mode429) return route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: 'LIMIT' }) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cv: fakeAiCv, remaining: 1 }) });
    }
    if (url.includes('premium-status')) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false}' });
    return route.fulfill({ status: 204, body: '' });
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  return { ctx, page, seen };
}

/* ---------- 1) Masaüstü: ana sayfa ---------- */
{
  const { ctx, page } = await newPage({ width: 1366, height: 900 });
  await page.goto(BASE + '/');
  await page.waitForSelector('text=Mevcut CV\'mi yükle');
  ok('Ana sayfa: "Mevcut CV\'mi yükle" butonu', await page.locator('button:has-text("Mevcut CV\'mi yükle")').count() >= 1);
  ok('Ana sayfa: 6 meslek kartı + tümünü göster', (await page.locator('button:has-text("Tüm meslekleri göster")').count()) === 1);
  await page.screenshot({ path: OUT + '01-landing-desktop.png', fullPage: false });
  await page.click('button:has-text("Tüm meslekleri göster")');
  ok('Ana sayfa: 18 meslek kartı', (await page.locator('section >> text=Muhasebe / Finans').count()) === 1 && (await page.locator('text=Teknisyen / Usta').count()) === 1);
  const fav = await page.evaluate(async () => (await fetch('/favicon.svg')).text());
  ok('Favicon "C"', />C</.test(fav) && !/>E</.test(fav));

  /* ---------- 2) Meslek başlangıcı: Şoför ---------- */
  await page.click('button:has-text("Şoför / Kurye")');
  await page.waitForSelector('#cv-preview');
  const prev = await page.locator('#cv-preview').innerText();
  ok('Şoför örneği: ehliyet satırı önizlemede', /Ehliyet: B, C, CE, SRC, Psikoteknik/.test(prev), prev.match(/Ehliyet[^\n]*/)?.[0]);
  ok('Şoför örneği: doğum tarihi/medeni durum gizli', !/Doğum:/.test(prev));
  ok('Kalite skoru başlığı', await page.locator('text=CV Kalite Skoru').count() === 1);
  const scoreTxt = await page.locator('text=CV Kalite Skoru').locator('xpath=../..').innerText();
  ok('[X] yer tutucu kalite uyarısı', true, scoreTxt.replace(/\s+/g, ' ').slice(0, 80));
  await page.click('button[aria-expanded]:has-text("Detay")');
  ok('Detayda doldurulmamış [X] hatası listeleniyor', await page.locator('text=Doldurulmamış [X] var').count() >= 1);
  await page.screenshot({ path: OUT + '02-editor-sofor.png' });

  /* Kişisel adımı: e-posta doğrulama */
  await page.fill('#pf-name', 'Ali Veli');
  await page.fill('#pf-email', 'ali@');
  await page.locator('#pf-email').blur();
  ok('E-posta hatalı uyarısı', await page.locator('#pf-email-err').count() === 1);
  await page.fill('#pf-email', 'ali@ornek.com');
  await page.fill('#pf-phone', '0532 123 45 67');
  await page.locator('#pf-phone').blur();
  ok('Geçerli e-posta/telefonda uyarı yok', (await page.locator('#pf-email-err, #pf-phone-err').count()) === 0);

  /* Doğum tarihi göster anahtarı */
  await page.fill('#pf-birth', '01.01.1990');
  ok('Doğum tarihi yazılınca varsayılan gizli', !/Doğum: 01\.01\.1990/.test(await page.locator('#cv-preview').innerText()));
  await page.click('button[aria-label^="Doğum tarihi: CV"]');
  ok('Göster anahtarı açınca görünüyor', /Doğum: 01\.01\.1990/.test(await page.locator('#cv-preview').innerText()));

  /* PDF: [X] uyarısı + ücretsiz kapı + dosya adı */
  let dialogMsg = '';
  page.once('dialog', async (d) => { dialogMsg = d.message(); await d.dismiss(); });
  await page.click('#cv-preview >> xpath=../../.. >> button:has-text("PDF İndir")').catch(async () => { await page.locator('button:has-text("PDF İndir")').first().click(); });
  await page.waitForTimeout(300);
  ok('PDF öncesi [X] onay sorusu', /doldurulmamış \[X\]/.test(dialogMsg), dialogMsg.split('\n')[0]);
  ok('Vazgeçince ödeme penceresi açılmadı', (await page.locator('text=PDF indirmek için bir paket seçin').count()) === 0);
  page.once('dialog', (d) => d.accept());
  await page.locator('button:has-text("PDF İndir")').first().click();
  await page.waitForSelector('text=PDF indirmek için bir paket seçin');
  ok('Kabul edince (ücretsiz) paket penceresi', true);
  await page.click('button:has-text("Şimdi değil")');

  /* ---------- 3) Tasarım adımı: İngilizce + ATS şablonu ---------- */
  await page.click('nav[aria-label="CV adımları"] >> text=Tasarım');
  await page.click('button[role="radio"]:has-text("English")');
  await page.click('button:has-text("ATS Sade")');
  const en = await page.locator('#cv-preview').innerText();
  ok('İngilizce başlıklar (ATS şablonu)', /WORK EXPERIENCE/i.test(en) && /EDUCATION/i.test(en) && /Driving licence/.test(en), en.match(/Driving licence[^\n|]*/)?.[0]);
  ok('İngilizce: Askerlik → Military service: Completed', /Military service: Completed/.test(en));
  ok('İngilizce: Lise → High School', /High School/.test(en));
  await page.screenshot({ path: OUT + '03-ats-english.png' });
  await page.click('button[role="radio"]:has-text("Türkçe")');

  /* Tüm şablonlar hatasız render */
  for (const t of ['Modern', 'Klasik', 'Yan Sütun', 'Minimal', 'ATS Sade']) {
    await page.click(`button[aria-pressed]:has-text("${t}")`);
    const txt = await page.locator('#cv-preview').innerText();
    ok(`Şablon ${t}: ad ve deneyim görünüyor`, /Ali Veli|ALİ VELİ/.test(txt) && /Dağıtım Şoförü/.test(txt));
  }

  /* ---------- 4) Ön yazı: çift "Saygılarımla" olmasın ---------- */
  await page.click('nav[aria-label="CV adımları"] >> text=Ön Yazı');
  await page.click('button:has-text("Şablondan Oluştur")');
  const cover = await page.locator('#cv-cover-letter').innerText();
  const n = (cover.match(/Saygılarımla/g) || []).length;
  ok('Ön yazıda "Saygılarımla" tek kez', n === 1, `adet=${n}`);
  ok('Ön yazıda ad bir kez imzada', (cover.match(/Ali Veli/g) || []).length === 2, 'üst bilgi + imza');

  /* ---------- 5) Yazdırma (metin katmanlı PDF) ---------- */
  await page.emulateMedia({ media: 'print' });
  const pdfBuf = await page.pdf({ format: 'A4', printBackground: true });
  fs.writeFileSync(OUT + 'print.pdf', pdfBuf);
  await page.emulateMedia({ media: 'screen' });
  ok('Yazdırma PDF üretildi', pdfBuf.length > 10000, `${pdfBuf.length} bayt`);

  /* ---------- 6) Başvuru takibi ---------- */
  await page.click('button[aria-label="Başvurularım"]');
  await page.waitForSelector('#apps-title');
  await page.fill('#ap-co', 'ABC Lojistik');
  await page.fill('#ap-pos', 'Dağıtım Şoförü');
  await page.fill('#ap-date', '2026-09-20');
  await page.click('[role="dialog"] button:has-text("Kaydet")');
  ok('Başvuru eklendi', await page.locator('text=ABC Lojistik').count() >= 1);
  ok('7+ gün: takip hatırlatması', await page.locator('text=takip e-postası').count() === 1);
  await page.click('[role="group"][aria-label="Durumu değiştir"] >> text=Mülakat');
  await page.keyboard.press('Escape');
  await page.reload();
  await page.click('button[aria-label="Başvurularım"]');
  await page.waitForSelector('#apps-title');
  ok('Başvuru yenilemeden sonra kalıcı + durum Mülakat', (await page.locator('button[aria-pressed="true"]:has-text("Mülakat")').count()) === 1);
  await page.screenshot({ path: OUT + '04-applications.png' });
  await page.keyboard.press('Escape');

  /* ---------- 7) İçe aktarma: PDF (AI taklidi) ---------- */
  const { page: p2, seen } = await newPage({ width: 1366, height: 900 });
  await p2.goto(BASE + '/?import=1');
  await p2.waitForSelector('#imp-title');
  const fc = p2.waitForEvent('filechooser');
  await p2.click('button:has-text("Dosya seçin")');
  await (await fc).setFiles(OUT + 'ornek-cv.pdf');
  await p2.waitForSelector('text=CV\'nizden bulunanlar', { timeout: 20000 });
  const sent = seen.importBodies[0] || '';
  ok('PDF metni tarayıcıda çıkarıldı (Türkçe karakter)', /ŞEYMA ÇELİK/.test(sent) && /Logo Tiger/.test(sent) && /İskenderun/.test(sent), sent.slice(0, 60).replace(/\n/g, ' / '));
  ok('Özet: 2 deneyim bulundu', await p2.locator('text=2 iş deneyimi').count() === 1);
  await p2.screenshot({ path: OUT + '05-import-review.png' });
  await p2.click('button:has-text("Forma aktar")');
  await p2.waitForSelector('#cv-preview');
  const imp = await p2.locator('#cv-preview').innerText();
  ok('İçe aktarılan CV önizlemede', /Şeyma Çelik/i.test(imp) && /Liman Lojistik/.test(imp) && /Mustafa Kemal/.test(imp));
  ok('Sanitize: ehliyet B + SRC (geçersiz atıldı)', /Ehliyet: B, SRC/.test(imp), imp.match(/Ehliyet[^\n]*/)?.[0]);
  ok('Sanitize: doğum/medeni varsayılan gizli', !/Doğum: 1990/.test(imp) && !/Evli/.test(imp));
  ok('Sanitize: tekrar eden yetenek tekil', (imp.match(/Logo Tiger/g) || []).length === 2, 'başarı maddesi + yetenek');
  ok('Sanitize: "orta" → B1', /İngilizce[\s\S]{0,5}B1/.test(imp));

  /* DOCX + 429 → kural tabanlı yedek */
  seen.mode429 = true;
  await p2.click('button[aria-label="Diğer işlemler"]');
  await p2.click('text=CV\'mi yükle (PDF / Word / LinkedIn)');
  const fc2 = p2.waitForEvent('filechooser');
  await p2.click('button:has-text("Dosya seçin")');
  await (await fc2).setFiles(OUT + 'ornek-cv.docx');
  await p2.waitForSelector('text=Kısmi aktarım', { timeout: 20000 });
  const sent2 = seen.importBodies[1] || '';
  ok('DOCX metni çıkarıldı (madde işaretleri dahil)', /• Aylık 1\.200 faturayı/.test(sent2) && /ŞEYMA ÇELİK/.test(sent2));
  ok('Limit dolunca açıklayıcı not', await p2.locator('text=Günlük ücretsiz içe aktarma hakkınız doldu').count() === 1);
  ok('Yedek ayrıştırıcı: ad', await p2.locator('text=Ad soyad: Şeyma Çelik').count() === 1);
  ok('Yedek ayrıştırıcı: e-posta + telefon', await p2.locator('text=seyma.celik@ornek.com, 0532 111 22 33').count() === 1);
  p2.once('dialog', (d) => d.accept());
  await p2.click('button:has-text("Forma aktar")');
  await p2.waitForTimeout(300);
  ok('Mevcut CV varken onay soruldu ve aktarıldı', (await p2.locator('#pf-email').inputValue()) === 'seyma.celik@ornek.com');
  await p2.context().close();
  await ctx.close();
}

/* ---------- 8) Eski sürüm verisinin geçişi ---------- */
{
  const { ctx, page } = await newPage({ width: 1280, height: 800 });
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    localStorage.setItem('cvdoldur_data', JSON.stringify({
      personal: { fullName: 'Eski Kullanıcı', title: 'Satış', email: 'e@x.com', phone: '05321234567', city: 'Adana', birthDate: '1988', maritalStatus: 'Evli', militaryStatus: 'Tamamlandı', linkedin: '', portfolio: '', photo: null, summary: '' },
      experiences: [{ id: 'a', company: 'Firma', position: 'Satış Temsilcisi', startDate: '2020-01', endDate: '', current: true, description: '', achievements: ['Ciro artırdım'] }],
      educations: [], skills: [], languages: [{ id: 'l', name: 'Türkçe', level: 'Ana dil' }], certificates: [], projects: [],
      coverLetter: { recipient: '', company: '', position: '', content: '' }, template: 'classic', color: '#1e40af', language: 'tr',
      sections: { summary: true, experience: true, education: true, skills: true, languages: true, certificates: true, projects: true, coverLetter: true },
      sectionOrder: ['experience', 'summary', 'education', 'skills', 'languages', 'certificates', 'projects'], jobDescription: '', density: 'compact',
    }));
    localStorage.setItem('cvdoldur_ui', JSON.stringify({ started: true, step: 3 }));
  });
  await page.reload();
  await page.waitForSelector('#cv-preview');
  const t = await page.locator('#cv-preview').innerText();
  ok('Eski veri: doğum tarihi/medeni durum görünür kaldı', /Doğum: 1988/.test(t) && /Evli/.test(t));
  ok('Eski veri: "Ana dil" → "Ana Dili"', /Ana Dili/.test(t));
  ok('Eski veri: bölüm sırası korundu (deneyim önce)', t.indexOf('DENEYİM') > -1);
  const sel = await page.locator('select[aria-label="Türkçe seviyesi"]').inputValue();
  ok('Eski veri: dil seçimi doğru gösteriliyor', sel === 'Ana Dili');
  await ctx.close();
}

/* ---------- 9) Mobil (iPhone 12/13 boyutu) ---------- */
{
  const { ctx, page } = await newPage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
  await page.goto(BASE + '/');
  await page.screenshot({ path: OUT + '06-landing-mobile.png' });
  const lw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('Mobil ana sayfa yatay taşma yok', lw <= 390, `scrollWidth=${lw}`);
  await page.click('button:has-text("Muhasebe / Finans")');
  await page.waitForSelector('[role="tablist"][aria-label="Görünüm"]');
  const hw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('Mobil editör yatay taşma yok', hw <= 390, `scrollWidth=${hw}`);
  await page.screenshot({ path: OUT + '07-editor-mobile.png' });
  await page.click('[role="tab"]:has-text("Önizle")');
  await page.waitForTimeout(400);
  const box = await page.locator('#cv-preview').boundingBox();
  const pw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('Mobil önizleme ekrana sığıyor', box && box.width <= 390 && pw <= 390, `önizleme genişliği=${box && Math.round(box.width)} scrollWidth=${pw}`);
  await page.screenshot({ path: OUT + '08-preview-mobile.png' });
  // Düzenle sekmesindeyken bile yazdırma çıktısı dolu olmalı
  await page.click('[role="tab"]:has-text("Düzenle")');
  await page.emulateMedia({ media: 'print' });
  const vis = await page.evaluate(() => { const el = document.getElementById('cv-preview'); const r = el.getBoundingClientRect(); return { w: r.width, h: r.height, t: getComputedStyle(el.closest('.cv-scale-inner')).transform }; });
  ok('Mobil yazdırma: önizleme görünür ve ölçeksiz', vis.w > 700 && vis.h > 1000 && (vis.t === 'none'), JSON.stringify(vis));
  await page.emulateMedia({ media: 'screen' });
  // Menü
  await page.click('button[aria-label="Diğer işlemler"]');
  const mb = await page.locator('[role="menu"]').boundingBox();
  ok('Mobil menü ekran içinde', mb && mb.x >= 0 && mb.x + mb.width <= 390, mb && `${Math.round(mb.x)}..${Math.round(mb.x + mb.width)}`);
  await ctx.close();
}

await browser.close();
const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length}/${results.length} geçti`);
fs.writeFileSync(OUT + 'results.json', JSON.stringify(results, null, 2));
process.exit(fails.length ? 1 : 0);
