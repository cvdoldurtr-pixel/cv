import { CVData } from '../types/cv';
import { Printer, FileText } from 'lucide-react';
import { requestPdf, usePremiumState } from '../utils/premium';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

interface Props {
  data: CVData;
}

export default function Preview({ data }: Props) {
  const { plan, exp } = usePremiumState();
  const premium = plan !== 'free' && exp > Date.now();
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
      default:
        return <ModernTemplate data={data} />;
    }
  };

  const showCover =
    data.sections?.coverLetter &&
    (data.coverLetter?.content?.trim() || data.coverLetter?.company || data.coverLetter?.position);

  return (
    <div className="max-w-[210mm] mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <h3 className="font-semibold text-slate-700">Canlı Önizleme</h3>
        <button
          onClick={requestPdf}
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
          <p className="text-xs text-slate-400 mt-1">
            Soldaki adımları doldurun — önizleme anında güncellenir.
          </p>
        </div>
      )}

      <div
        id="cv-preview"
        className="bg-white shadow-xl rounded-sm overflow-hidden print:shadow-none print:rounded-none"
        style={{ width: '210mm', minHeight: isEmpty ? 'auto' : '297mm', position: 'relative' }}
        data-density={data.density || 'comfortable'}
      >
        {renderTemplate()}
        {!premium && !isEmpty && (
          <div aria-hidden className="cv-watermark">CVDoldur · Ücretsiz Önizleme</div>
        )}
      </div>

      {showCover && (
        <div
          id="cv-cover-letter"
          className="mt-6 bg-white shadow-xl rounded-sm overflow-hidden print:shadow-none print:mt-0 print:break-before-page"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <div className="p-10 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="mb-10 text-slate-600 text-xs space-y-0.5">
              {data.personal.fullName && <p className="font-semibold text-slate-900 text-sm">{data.personal.fullName}</p>}
              {data.personal.email && <p>{data.personal.email}</p>}
              {data.personal.phone && <p>{data.personal.phone}</p>}
              {data.personal.city && <p>{data.personal.city}</p>}
            </div>
            <p className="text-slate-500 text-xs mb-6">{new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {(data.coverLetter.recipient || data.coverLetter.company) && (
              <div className="mb-6 text-slate-800">
                {data.coverLetter.recipient && <p>{data.coverLetter.recipient}</p>}
                {data.coverLetter.company && <p className="font-medium">{data.coverLetter.company}</p>}
                {data.coverLetter.position && <p className="text-slate-600">Pozisyon: {data.coverLetter.position}</p>}
              </div>
            )}
            <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
              {data.coverLetter.content || 'Ön yazı metnini Ön Yazı adımında yazın…'}
            </div>
            <p className="mt-10 text-slate-800">Saygılarımla,</p>
            <p className="mt-6 font-medium text-slate-900">{data.personal.fullName || 'Ad Soyad'}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-3 no-print">
        PDF İndir → açılan pencerede hedef: “PDF olarak kaydet”, kenar boşluğu: “Yok”. Tek sayfa için Tasarım’da yoğunluk “Sıkı”.
        {showCover ? ' Ön yazı ikinci sayfa olarak yazdırılır.' : ''}
      </p>
    </div>
  );
}
