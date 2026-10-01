import { CVData } from '../../types/cv';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { aiCover, AILimitError } from '../../utils/aiApi';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function CoverLetterForm({ data, setData }: Props) {
  const cl = data.coverLetter;

  const update = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      coverLetter: { ...prev.coverLetter, [field]: value },
    }));
  };

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const writeAI = async () => {
    setBusy(true); setErr('');
    try { update('content', await aiCover(data)); }
    catch (e) { if (!(e instanceof AILimitError)) setErr((e as Error).message); }
    setBusy(false);
  };

  const generateAI = () => {
    const name = data.personal.fullName || 'Aday';
    const title = data.personal.title || 'pozisyon';
    const company = cl.company || 'şirketiniz';
    const pos = cl.position || title;
    
    const content = `Sayın Yetkili,

${company} bünyesinde açık bulunan ${pos} pozisyonuna başvurmak istiyorum.

${data.personal.summary || `Bu alanda edindiğim deneyim ve yetkinliklerimle ekibinize değer katabileceğime inanıyorum.`}

${data.experiences.length > 0 ? `Özellikle ${data.experiences[0].company} firmasında ${data.experiences[0].position} olarak görev alırken edindiğim tecrübeler, bu rol için gerekli donanıma sahip olduğumu gösteriyor.` : ''}

CV'mi ekte bulabilirsiniz. Görüşme fırsatı verirseniz memnuniyet duyarım.

Saygılarımla,
${name}`;
    
    update('content', content);
  };

  return (
    <div className="space-y-5">
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
        Ön yazı opsiyoneldir. Belirli bir şirkete başvururken kişiselleştirilmiş bir mektup göndermek şansınızı artırır.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Adı</label>
          <input
            value={cl.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Örn: Koç Holding"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pozisyon</label>
          <input
            value={cl.position}
            onChange={(e) => update('position', e.target.value)}
            placeholder="Örn: Yazılım Mühendisi"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">Ön Yazı İçeriği</label>
          <button
            onClick={writeAI}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 px-3 py-1.5 rounded-lg transition mr-2 ml-auto"
          >
            <Sparkles size={14} />
            {busy ? 'Yazılıyor…' : 'AI ile Yaz'}
          </button>
          <button
            onClick={generateAI}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
          >
            <Sparkles size={14} />
            Şablondan Oluştur
          </button>
        </div>
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        <textarea
          value={cl.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder="Sayın Yetkili,&#10;&#10;... pozisyonuna başvurmak istiyorum."
          rows={12}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition resize-none text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
