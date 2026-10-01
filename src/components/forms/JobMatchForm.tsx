import { useMemo } from 'react';
import { CVData, emptySkill } from '../../types/cv';
import { atsCompare, cvToPlainText } from '../../utils/atsMatch';
import { Target, Plus, Sparkles } from 'lucide-react';
import TailorPanel from './TailorPanel';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function JobMatchForm({ data, setData }: Props) {
  const result = useMemo(() => {
    if (!data.jobDescription || data.jobDescription.trim().length < 40) return null;
    return atsCompare(cvToPlainText(data), data.jobDescription);
  }, [data]);

  const addSkill = (keyword: string) => {
    const exists = data.skills.some((s) => s.name.toLowerCase() === keyword.toLowerCase());
    if (exists) return;
    setData((p) => ({
      ...p,
      skills: [...p.skills, { ...emptySkill(), name: keyword.charAt(0).toUpperCase() + keyword.slice(1) }],
    }));
  };

  const coverageColor =
    !result ? 'text-slate-400' :
    result.coverage >= 70 ? 'text-emerald-600' :
    result.coverage >= 45 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Target className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">İş ilanı eşleştirme</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Kariyer.net, LinkedIn veya şirket sitesinden ilan metnini yapıştırın.
              CV’nizle ortak anahtar kelimeler ve eksikler anında, tarayıcınızda hesaplanır (bu adımda veri sunucuya gitmez). AI ile ilana özel uyarlama için aşağıdaki bölüm.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">İş ilanı metni</label>
        <textarea
          value={data.jobDescription}
          onChange={(e) => setData((p) => ({ ...p, jobDescription: e.target.value }))}
          rows={8}
          placeholder="İlan metnini buraya yapıştırın…&#10;&#10;Örn: React, TypeScript, 3+ yıl deneyim, takım çalışması…"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y min-h-[140px]"
        />
        <p className="text-[11px] text-slate-400 mt-1">{data.jobDescription.length} karakter</p>
      </div>

      <TailorPanel data={data} setData={setData} coverage={result?.coverage} />

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Uyumluluk</p>
              <p className={`text-3xl font-bold ${coverageColor}`}>{result.coverage}%</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.matched.length} eşleşen · {result.missing.length} eksik · {result.jobTokenCount} ilan terimi
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
              style={{
                borderColor: result.coverage >= 70 ? '#10b981' : result.coverage >= 45 ? '#f59e0b' : '#ef4444',
              }}
            >
              <span className={`text-sm font-bold ${coverageColor}`}>
                {result.coverage >= 70 ? 'İyi' : result.coverage >= 45 ? 'Orta' : 'Düşük'}
              </span>
            </div>
          </div>

          {result.matched.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                <Sparkles size={12} /> Eşleşen kelimeler
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs border border-emerald-100">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-700 mb-2">Eksik / güçlendirilebilir</h4>
              <p className="text-[11px] text-slate-500 mb-2">
                Tıklayarak yeteneklere ekleyin (yalnızca gerçekten bildiklerinizi ekleyin).
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.slice(0, 24).map((k) => {
                  const already = data.skills.some((s) => s.name.toLowerCase() === k.toLowerCase());
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={already}
                      onClick={() => addSkill(k)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border transition ${
                        already
                          ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-default'
                          : 'bg-amber-50 text-amber-900 border-amber-100 hover:bg-amber-100'
                      }`}
                    >
                      {!already && <Plus size={10} />}
                      {k}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">İpucu:</strong> Eksik kelimeleri körü körüne eklemeyin.
            Özet ve başarı maddelerine, gerçek deneyiminizle bağlayarak yazın. Uydurma bilgi ATS ve mülakatta zarar verir.
          </div>
        </div>
      )}

      {!result && data.jobDescription.length > 0 && data.jobDescription.length < 40 && (
        <p className="text-xs text-amber-600">Analiz için biraz daha uzun bir ilan metni yapıştırın (en az ~40 karakter).</p>
      )}
    </div>
  );
}
