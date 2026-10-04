import { chromium } from 'playwright';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const OUT = new URL('.', import.meta.url).pathname;
const b = await chromium.launch();
let fails = 0;
const ok = (n, c, x = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`); if (!c) fails++; };
async function run(name, mutate, vp = { width: 1366, height: 900 }, mobileView) {
  const p = await b.newPage({ viewport: vp });
  await p.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"valid":false}' }));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await p.goto('http://localhost:4173/?role=muhasebe'); await p.waitForSelector('#cv-preview', { state: 'attached' });
  await p.evaluate(mutate);
  await p.reload(); await p.waitForSelector('#cv-preview', { state: 'attached' });
  if (mobileView) await p.click(`[role="tab"]:has-text("${mobileView}")`);
  await p.emulateMedia({ media: 'print' });
  const f = OUT + name + '.pdf';
  fs.writeFileSync(f, await p.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
  await p.close();
  const pages = Number(execSync(`pdfinfo ${f}`).toString().match(/Pages:\s+(\d+)/)[1]);
  const p1 = execSync(`pdftotext -f 1 -l 1 ${f} -`).toString();
  const all = execSync(`pdftotext ${f} -`).toString();
  return { pages, p1, all };
}
const base = (extra) => `(() => { const d = JSON.parse(localStorage.getItem('cvdoldur_data')); d.personal.fullName='Test Kişi'; ${extra}; localStorage.setItem('cvdoldur_data', JSON.stringify(d)); })()`;

let r = await run('p-cv-only', base(''));
ok('Yalnız CV → 1 sayfa', r.pages === 1, `sayfa=${r.pages}`);
ok('Metin katmanı (ATS okur)', /Test Kişi/.test(r.all) && /Logo Tiger/.test(r.all));

r = await run('p-cover', base(`d.coverLetter.company='ABC A.Ş.'; d.coverLetter.content='Sayın Yetkili,\\n\\nÖN YAZI METNİ BURADA.\\n\\nSaygılarımla,'`));
ok('CV + ön yazı → 2 sayfa', r.pages === 2, `sayfa=${r.pages}`);
ok('1. sayfada ön yazı yok (üst üste binme yok)', !/ÖN YAZI METNİ/.test(r.p1));
ok('2. sayfada ön yazı var', /ÖN YAZI METNİ/.test(r.all));
ok('Saygılarımla tek kez', (r.all.match(/Saygılarımla/g) || []).length === 1);

r = await run('p-long', base(`for (let i=0;i<7;i++) d.experiences.push({...d.experiences[0], id:'x'+i, company:'Firma '+i, achievements:['Uzun bir başarı maddesi '+i+' ile sayfayı doldurmak için yazılmış örnek metin, rakam 120 içerir','İkinci madde','Üçüncü madde']})`));
ok('Uzun CV → 2 sayfa, 1. sayfa dolu (deneyim 1. sayfada başlıyor)', r.pages === 2 && /İŞ DENEYİMİ/.test(r.p1) && r.p1.split('\n').filter(Boolean).length > 40, `sayfa=${r.pages}, 1.sayfa satır=${r.p1.split('\n').filter(Boolean).length}`);

r = await run('p-mobile-edit', base(''), { width: 390, height: 844 }, 'Düzenle');
ok('Telefonda Düzenle sekmesindeyken yazdırma → CV basılır, 1 sayfa', r.pages === 1 && /Test Kişi/.test(r.all), `sayfa=${r.pages}`);

r = await run('p-mobile-prev', base(`d.coverLetter.content='Sayın Yetkili,\\n\\nMOBİL ÖN YAZI.'`), { width: 390, height: 844 }, 'Önizle');
ok('Telefonda Önizle + ön yazı → 2 sayfa, ölçeksiz', r.pages === 2 && !/MOBİL ÖN YAZI/.test(r.p1), `sayfa=${r.pages}`);
await b.close();
console.log(fails ? `${fails} başarısız` : 'Hepsi geçti');
process.exit(fails ? 1 : 0);
