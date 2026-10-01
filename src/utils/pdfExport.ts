/**
 * Görsel PDF: önizlemeyi görüntü olarak A4 sayfalara böler (telefonda tek dokunuşla iner).
 * Not: metin katmanı olmaz; ATS için "Yazdır → PDF olarak kaydet" (metinli PDF) tercih edilmeli.
 */
export async function downloadImagePdf(fileName: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const targets = ['cv-preview', 'cv-cover-letter']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  if (!targets.length) throw new Error('Önizleme bulunamadı');

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const PW = 210, PH = 297;
  let first = true;

  for (const el of targets) {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const pageH = Math.floor((canvas.width * PH) / PW);
    for (let y = 0; y < canvas.height; y += pageH) {
      const h = Math.min(pageH, canvas.height - y);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = h;
      const ctx = slice.getContext('2d');
      if (!ctx) throw new Error('Tuval oluşturulamadı');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PW, (h * PW) / canvas.width);
    }
  }
  pdf.save(fileName);
}
