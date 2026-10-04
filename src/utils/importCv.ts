/**
 * Mevcut CV'yi içe aktarma.
 * 1) Dosyadan metin çıkarma tarayıcıda yapılır (PDF: pdf.js, DOCX: zip içindeki XML). Dosya sunucuya gitmez.
 * 2) Metin, alanlara ayrılmak üzere AI'a gönderilir (ai-import). CV metni sunucuda saklanmaz.
 * 3) AI kullanılamazsa (limit, bağlantı) kural tabanlı yedek ayrıştırıcı en azından iletişim bilgilerini doldurur.
 */
import { CVData, defaultCVData } from '../types/cv';
import { migrateData } from './migrate';
import { getToken } from './premium';
import { track } from './track';

export const MAX_IMPORT_CHARS = 12000;

export class ImportError extends Error {}

/* ---------------- Metin çıkarma ---------------- */

async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Satırları y koordinatına göre birleştir
    let lastY: number | null = null;
    let line = '';
    const lines: string[] = [];
    for (const item of content.items as { str?: string; transform?: number[]; hasEOL?: boolean }[]) {
      if (typeof item.str !== 'string') continue;
      const y = item.transform ? Math.round(item.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
      line += (line && !line.endsWith(' ') && item.str && !item.str.startsWith(' ') ? ' ' : '') + item.str;
      if (item.hasEOL) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
      lastY = y;
    }
    if (line.trim()) lines.push(line.trim());
    pages.push(lines.join('\n'));
  }
  await doc.destroy();
  return pages.join('\n\n');
}

async function docxToText(file: File): Promise<string> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: (f) => f.name === 'word/document.xml' });
  const xml = files['word/document.xml'];
  if (!xml) throw new ImportError('Word dosyası okunamadı. Dosyayı .docx olarak kaydedip tekrar deneyin.');
  const doc = new DOMParser().parseFromString(strFromU8(xml), 'application/xml');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const out: string[] = [];
  const paras = doc.getElementsByTagNameNS(W, 'p');
  for (let i = 0; i < paras.length; i++) {
    let text = '';
    const walker = doc.createTreeWalker(paras[i], NodeFilter.SHOW_ELEMENT);
    let n = walker.currentNode as Element | null;
    while (n) {
      if (n.namespaceURI === W) {
        if (n.localName === 't') text += n.textContent || '';
        else if (n.localName === 'tab') text += '\t';
        else if (n.localName === 'br') text += '\n';
      }
      n = walker.nextNode() as Element | null;
    }
    // Madde işareti: paragrafta numaralandırma (numPr) veya liste stili (ör. "ListBullet", "ListeParagraf")
    const styleEl = paras[i].getElementsByTagNameNS(W, 'pStyle')[0];
    const style = styleEl?.getAttributeNS(W, 'val') || styleEl?.getAttribute('w:val') || '';
    const isBullet = paras[i].getElementsByTagNameNS(W, 'numPr').length > 0 || /list|liste|bullet|madde/i.test(style);
    if (text.trim()) out.push((isBullet ? '• ' : '') + text.trim());
  }
  return out.join('\n');
}

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.size > 10 * 1024 * 1024) throw new ImportError('Dosya 10 MB\'tan büyük. Daha küçük bir dosya deneyin.');
  let text = '';
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    text = await pdfToText(file);
  } else if (name.endsWith('.docx')) {
    text = await docxToText(file);
  } else if (name.endsWith('.doc')) {
    throw new ImportError('Eski .doc biçimi okunamıyor. Word\'de "Farklı kaydet → .docx" veya PDF olarak kaydedip yükleyin.');
  } else if (name.endsWith('.txt') || file.type.startsWith('text/')) {
    text = await file.text();
  } else {
    throw new ImportError('Desteklenen dosyalar: PDF, Word (.docx) veya .txt');
  }
  text = text.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length < 60) {
    throw new ImportError('Dosyadan metin okunamadı. Taranmış (fotoğraf) bir PDF olabilir. Word dosyasını yükleyin veya metni kopyalayıp yapıştırın.');
  }
  return text.slice(0, MAX_IMPORT_CHARS);
}

/* ---------------- Kural tabanlı yedek ayrıştırıcı ---------------- */

export function heuristicParse(text: string): CVData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const email = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0] || '';
  const phone = text.match(/(?:\+?90[\s-]?)?\(?0?5\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/)?.[0]?.trim() || '';
  const linkedin = text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_\-%]+/i)?.[0] || '';
  const portfolio = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i)?.[0] || '';
  const nameLine = lines.slice(0, 5).find((l) => {
    const w = l.split(/\s+/);
    return w.length >= 2 && w.length <= 4 && /^[A-Za-zÇĞİÖŞÜçğıöşü.'\- ]+$/.test(l) && !/@|\d/.test(l);
  });
  const fullName = nameLine
    ? nameLine
        .split(/\s+/)
        .map((w) => (w === w.toLocaleUpperCase('tr-TR') ? w.charAt(0) + w.slice(1).toLocaleLowerCase('tr-TR') : w))
        .join(' ')
    : '';
  const idx = nameLine ? lines.indexOf(nameLine) : -1;
  const next = idx >= 0 ? lines[idx + 1] || '' : '';
  const title = next && next.length < 60 && !/@|\d{3}/.test(next) ? next : '';
  return migrateData({
    ...defaultCVData,
    personal: { ...defaultCVData.personal, fullName, title, email, phone, linkedin, portfolio, city: '' },
  });
}

/* ---------------- AI ile ayrıştırma ---------------- */

export interface ImportResult {
  data: CVData;
  usedAI: boolean;
  note?: string;
}

export async function parseCv(text: string): Promise<ImportResult> {
  const clean = text.slice(0, MAX_IMPORT_CHARS);
  try {
    const res = await fetch('/.netlify/functions/ai-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, token: getToken() }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.cv) {
      track('import_ok');
      return { data: migrateData(body.cv), usedAI: true };
    }
    const reason =
      res.status === 429
        ? body.error === 'BUSY'
          ? 'Bugünkü ücretsiz AI kontenjanı doldu'
          : 'Günlük ücretsiz içe aktarma hakkınız doldu (günde 2)'
        : body.error || 'AI şu an yanıt vermedi';
    return { data: heuristicParse(clean), usedAI: false, note: `${reason}. Yalnızca iletişim bilgileri otomatik dolduruldu; diğer bölümleri metinden kopyalayabilirsiniz.` };
  } catch {
    return { data: heuristicParse(clean), usedAI: false, note: 'Sunucuya ulaşılamadı. Yalnızca iletişim bilgileri otomatik dolduruldu.' };
  }
}

/** İçe aktarılan CV'yi mevcut CV ile birleştir: tasarım tercihleri ve fotoğraf korunur. */
export function mergeImported(current: CVData, imported: CVData): CVData {
  return migrateData({
    ...imported,
    template: current.template,
    color: current.color,
    density: current.density,
    sectionOrder: current.sectionOrder,
    sections: current.sections,
    jobDescription: current.jobDescription,
    coverLetter: imported.coverLetter.content ? imported.coverLetter : current.coverLetter,
    personal: {
      ...imported.personal,
      photo: current.personal.photo,
      city: imported.personal.city || current.personal.city,
    },
  });
}

export function summarize(d: CVData): { label: string; ok: boolean }[] {
  const p = d.personal;
  return [
    { label: p.fullName ? `Ad soyad: ${p.fullName}` : 'Ad soyad bulunamadı', ok: !!p.fullName },
    { label: p.email || p.phone ? `İletişim: ${[p.email, p.phone].filter(Boolean).join(', ')}` : 'İletişim bulunamadı', ok: !!(p.email || p.phone) },
    { label: p.summary ? 'Profesyonel özet' : 'Özet yok', ok: !!p.summary },
    { label: `${d.experiences.length} iş deneyimi`, ok: d.experiences.length > 0 },
    { label: `${d.educations.length} eğitim`, ok: d.educations.length > 0 },
    { label: `${d.skills.length} yetenek`, ok: d.skills.length > 0 },
    { label: `${d.languages.length} dil`, ok: d.languages.length > 0 },
    { label: `${d.certificates.length} sertifika`, ok: d.certificates.length > 0 },
  ];
}
