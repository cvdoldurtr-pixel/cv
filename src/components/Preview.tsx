import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CVData } from '../types/cv';
import { Printer, FileText } from 'lucide-react';
import { requestPdf, usePremiumState } from '../utils/premium';
import { labelsFor } from '../utils/cvView';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import AtsTemplate from './templates/AtsTemplate';

interface Props {
  data: CVData;
}

const A4_PX = 794; // 210mm @ 96dpi

/** Ön yazının sonunda zaten kapanış/imza varsa tekrar eklenmesin */
const CLOSING_RE = /(saygılarımla|saygılarımızla|sevgilerimle|sincerely|best regards|kind regards|yours faithfully|yours sincerely)[,.]?\s*$/i;
function splitClosing(content: string, name: string): { body: string; hasClosing: boolean; hasName: boolean } {
  const lines = content.replace(/\s+$/, '').split('\n');
  const last = (lines[lines.length - 1] || '').trim();
  const prev = (lines[lines.length - 2] || '').trim();
  const nameLow = name.trim().toLocaleLowerCase('tr-TR');
  const hasName = !!nameLow && last.toLocaleLowerCase('tr-TR') === nameLow;
  const closingLine = hasName ? prev : last;
  return { body: content, hasClosing: CLOSING_RE.test(closingLine), hasName };
}

export default function Preview({ data }: Props) {
  const { plan, exp } = usePremiumState();
  const premium = plan !== 'free' && exp > Date.now();
  const L = labelsFor(data);
  const isEmpty =
    !data.personal.fullName &&
    !data.personal.summary &&
    data.experiences.length === 0 &&
    data.educations.length === 0 &&
    data.skills.length === 0;

  const renderTemplate = () => {
    switch (data.template) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'sidebar':
        return <SidebarTemplate data={data} />;
      case 'minimal':
        return <MinimalTemplate data={data} />;
      case 'ats':
        return <AtsTemplate data={data} />;
      default:
        return <ModernTemplate data={data} />;
    }
  };

  const showCover =
    data.sections?.coverLetter &&
    (data.coverLetter?.content?.trim() || data.coverLetter?.company || data.coverLetter?.position);
  const cover = splitClosing(data.coverLetter.content || '', data.personal.fullName || '');

  /* ---- Telefonda A4 sayfayı ekran genişliğine sığdır (yazdırmayı etkilemez) ---- */
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const calc = () => setScale(Math.min(1, outer.clientWidth / A4_PX));
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const upd = () => setHeight(scale < 1 ? inner.offsetHeight * scale : undefined);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [scale]);

  return (
    <div className="max-w-[210mm] mx-auto cv-print-root">
      <div className="flex justify-between items-center mb-4 no-print">
        <h3 className="font-semibold text-slate-700">Canlı Önizleme</h3>
        <button
          onClick={() => requestPdf(data)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition shadow"
        >
          <Printer size={16} />
          PDF İndir
        </button>
      </div>

      {isEmpty && (
        <div className="mb-4 no-print rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-center">
          <FileText className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-600">CV henüz boş</p>
          <p className="text-xs text-slate-400 mt-1">Adımları doldurun; önizleme anında güncellenir.</p>
        </div>
      )}

      <div ref={outerRef} className="cv-scale-outer" style={{ height }}>
        <div
          ref={innerRef}
          className="cv-scale-inner"
          style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_PX } : undefined}
        >
          <div
            id="cv-preview"
            className="bg-white shadow-xl rounded-sm overflow-hidden print:shadow-none print:rounded-none"
            style={{ width: '210mm', minHeight: isEmpty ? 'auto' : '297mm', position: 'relative' }}
            data-density={data.density || 'comfortable'}
            lang={data.language === 'en' ? 'en' : 'tr'}
          >
            {renderTemplate()}
            {!premium && !isEmpty && <div aria-hidden className="cv-watermark">CVDoldur · Ücretsiz Önizleme</div>}
          </div>

          {showCover && (
            <div
              id="cv-cover-letter"
              className="mt-6 bg-white shadow-xl rounded-sm overflow-hidden print:shadow-none print:mt-0 print:break-before-page"
              style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}
              lang={data.language === 'en' ? 'en' : 'tr'}
            >
              <div className="p-10 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                <div className="mb-10 text-slate-600 text-xs space-y-0.5">
                  {data.personal.fullName && <p className="font-semibold text-slate-900 text-sm">{data.personal.fullName}</p>}
                  {data.personal.email && <p>{data.personal.email}</p>}
                  {data.personal.phone && <p>{data.personal.phone}</p>}
                  {data.personal.city && <p>{data.personal.city}</p>}
                </div>
                <p className="text-slate-500 text-xs mb-6">
                  {new Date().toLocaleDateString(L.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {(data.coverLetter.recipient || data.coverLetter.company) && (
                  <div className="mb-6 text-slate-800">
                    {data.coverLetter.recipient && <p>{data.coverLetter.recipient}</p>}
                    {data.coverLetter.company && <p className="font-medium">{data.coverLetter.company}</p>}
                    {data.coverLetter.position && <p className="text-slate-600">{L.coverPosition}: {data.coverLetter.position}</p>}
                  </div>
                )}
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {cover.body || L.coverPlaceholder}
                </div>
                {!cover.hasClosing && <p className="mt-10 text-slate-800">{L.coverClosing}</p>}
                {!cover.hasName && (
                  <p className={`${cover.hasClosing ? 'mt-2' : 'mt-6'} font-medium text-slate-900`}>{data.personal.fullName || L.namePlaceholder}</p>
                )}
              </div>
              {!premium && <div aria-hidden className="cv-watermark">CVDoldur · Ücretsiz Önizleme</div>}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-3 no-print">
        PDF İndir → açılan pencerede hedef: “PDF olarak kaydet”, kenar boşluğu: “Yok”. Tek sayfa için Tasarım’da yoğunluk “Sıkı”.
        {showCover ? ' Ön yazı ikinci sayfa olarak yazdırılır.' : ''}
      </p>
    </div>
  );
}
