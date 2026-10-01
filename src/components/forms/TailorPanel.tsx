import { useState } from 'react';
import { Wand2, Lock, Check, Undo2, RefreshCw, Plus, MessageCircleQuestion, Mail, ListChecks } from 'lucide-react';
import { CVData, emptySkill } from '../../types/cv';
import { aiTailor, TailorBullets, TailorCore, TailorExtra } from '../../utils/aiApi';
import { openGate, usePremiumState } from '../../utils/premium';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  coverage?: number;
}

interface Result {
  core: TailorCore | null;
  bullets: TailorBullets | null;
  extra: TailorExtra | null;
  expIds: string[];
}

export default function TailorPanel({ data, setData, coverage }: Props) {
  const { plan, exp } = usePremiumState();
  const premium = plan !== 'free' && exp > Date.now();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [undo, setUndo] = useState<null | { label: string; run: () => void }>(null);

  const jobOk = data.jobDescription.trim().length >= 80;
  const mark = (k: string) => setApplied((a) => ({ ...a, [k]: true }));
  const unmark = (k: string) => setApplied((a) => { const n = { ...a }; delete n[k]; return n; });

  async function run() {
    setErr(''); setRes(null); setApplied({}); setUndo(null); setLoading(true);
    const expIds = data.experiences.slice(0, 4).map((e) => e.id);
    try {
      const r = await aiTailor(data);
      if (!r.core && !r.bullets && !r.extra) setErr(r.error || 'AI şu an yanıt vermiyor, biraz sonra tekrar deneyin.');
      else {
        setRes({ core: r.core, bullets: r.bullets, extra: r.extra, expIds });
        if (r.error) setErr('Bazı bölümler hazırlanamadı: ' + r.error);
      }
    } catch (e) { setErr((e as Error).message || 'Beklenmeyen hata'); }
    setLoading(false);
  }

  const applySummary = (text: string) => {
    const prev = data.personal.summary;
    setData((p) => ({ ...p, personal: { ...p.personal, summary: text } }));
    mark('summary');
    setUndo({ label: 'Özet', run: () => { setData((p) => ({ ...p, personal: { ...p.personal, summary: prev } })); unmark('summary'); } });
  };

  const applyBullets = (idx: number, bullets: string[]) => {
    const id = res?.expIds[idx];
    const target = data.experiences.find((e) => e.id === id);
    if (!target) { setErr('Bu deneyim artık listede yok.'); return; }
    const prev = target.achievements;
    setData((p) => ({ ...p, experiences: p.experiences.map((e) => (e.id === id ? { ...e, achievements: bullets } : e)) }));
    mark('b' + idx);
    setUndo({ label: 'Başarı maddeleri', run: () => { setData((p) => ({ ...p, experiences: p.experiences.map((e) => (e.id === id ? { ...e, achievements: prev } : e)) })); unmark('b' + idx); } });
  };

  const addSkill = (term: string) => {
    if (data.skills.some((s) => s.name.toLowerCase() === term.toLowerCase())) { mark('k' + term); return; }
    const skill = { ...emptySkill(), name: term.charAt(0).toUpperCase() + term.slice(1) };
    setData((p) => ({ ...p, skills: [...p.skills, skill] }));
    mark('k' + term);
    setUndo({ label: 'Yetenek', run: () => { setData((p) => ({ ...p, skills: p.skills.filter((s) => s.id !== skill.id) })); unmark('k' + term); } });
  };

  const applyCover = (text: string) => {
    const prev = { content: data.coverLetter.content, position: data.coverLetter.position, on: data.sections.coverLetter };
    setData((p) => ({
      ...p,
      coverLetter: { ...p.coverLetter, content: text, position: p.coverLetter.position || p.personal.title },
      sections: { ...p.sections, coverLetter: true },
    }));
    mark('cover');
    setUndo({ label: 'Ön yazı', run: () => { setData((p) => ({ ...p, coverLetter: { ...p.coverLetter, content: prev.content, position: prev.position }, sections: { ...p.sections, coverLetter: prev.on } })); unmark('cover'); } });
  };

  const Btn = ({ k, onClick, children }: { k: string; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} disabled={!!applied[k]}
      className={`text-xs px-2.5 py-1 rounded-md border transition ${applied[k] ? 'bg-emerald-50 text-emerald-700 border-emerald-100 cursor-default' : 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'}`}>
      {applied[k] ? <span className="inline-flex items-center gap-1"><Check size={11} /> Uygulandı</span> : children}
    </button>
  );

  /* ---------- Ücretsiz kullanıcı: değeri göster, kilidi aç ---------- */
  if (!premium) {
    return (
      <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-slate-900 to-teal-900 text-white p-4">
        <div className="flex items-start gap-3">
          <Wand2 size={20} className="text-teal-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">İlana özel CV — bu ilan için yeniden yazılsın</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {typeof coverage === 'number'
                ? `Şu an bu ilanla uyumunuz %${coverage}. Aynı CV'yi her ilana göndermek yerine, ilana göre uyarlanmış hâlini 30 saniyede alın:`
                : 'İlanı yapıştırın; CV’niz o ilana göre uyarlansın:'}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-200">
              <li className="flex gap-2"><ListChecks size={13} className="text-teal-300 shrink-0 mt-0.5" /> Özet ve başarı maddeleri ilanın diliyle, gerçek deneyiminize sadık kalarak yeniden yazılır</li>
              <li className="flex gap-2"><ListChecks size={13} className="text-teal-300 shrink-0 mt-0.5" /> Dürüst uyum yorumu ve eksik anahtar kelimeler</li>
              <li className="flex gap-2"><Mail size={13} className="text-teal-300 shrink-0 mt-0.5" /> O ilana özel ön yazı</li>
              <li className="flex gap-2"><MessageCircleQuestion size={13} className="text-teal-300 shrink-0 mt-0.5" /> Bu ilan için olası mülakat soruları ve cevap ipuçları</li>
            </ul>
            <button type="button" onClick={() => openGate('tailor')}
              className="mt-3 inline-flex items-center gap-2 bg-white text-slate-900 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-teal-50">
              <Lock size={13} /> Paketi seç · ₺59’dan başlar
            </button>
            <p className="text-[10px] text-slate-400 mt-2">Tek seferlik ödeme, otomatik yenileme yok. AI çıktısı öneridir; göndermeden önce okuyup düzeltin.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Premium ---------- */
  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Wand2 size={20} className="text-teal-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-sm">İlana özel CV uyarlama</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Yukarıdaki ilana göre özet, başarı maddeleri, ön yazı ve mülakat soruları hazırlanır. Yalnızca CV’nizdeki gerçek bilgiler kullanılır; hiçbir şey siz onaylamadan CV’ye yazılmaz.
          </p>
          <button type="button" onClick={run} disabled={loading || !jobOk}
            className="mt-3 inline-flex items-center gap-2 bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-800 disabled:bg-slate-300">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Uyarlanıyor… (10-20 sn)</> : <><Wand2 size={14} /> İlana göre uyarla</>}
          </button>
          {!jobOk && <p className="text-[11px] text-amber-600 mt-2">Önce ilan metnini yapıştırın (en az ~80 karakter).</p>}
          <p className="text-[10px] text-slate-400 mt-2">Bir uyarlama 3 günlük AI hakkı kullanır.</p>
        </div>
      </div>

      {err && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{err}</p>}

      {undo && (
        <button type="button" onClick={() => { undo.run(); setUndo(null); }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md px-2.5 py-1">
          <Undo2 size={12} /> Son uygulamayı geri al ({undo.label})
        </button>
      )}

      {res?.core && (
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-700">AI uyum değerlendirmesi</p>
            <span className={`text-sm font-bold ${res.core.score >= 70 ? 'text-emerald-600' : res.core.score >= 45 ? 'text-amber-600' : 'text-red-500'}`}>{res.core.score}/100</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{res.core.verdict}</p>
        </div>
      )}

      {res?.core?.summary && (
        <div>
          <h4 className="text-xs font-semibold text-slate-800 mb-1">Önerilen özet</h4>
          {data.personal.summary && <p className="text-[11px] text-slate-400 mb-1 line-clamp-2">Şimdiki: {data.personal.summary}</p>}
          <p className="text-sm text-slate-800 bg-teal-50 border border-teal-100 rounded-lg p-3 leading-relaxed">{res.core.summary}</p>
          <div className="mt-2"><Btn k="summary" onClick={() => applySummary(res.core!.summary)}>Özeti uygula</Btn></div>
        </div>
      )}

      {res?.bullets && res.bullets.experiences.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-800">İlana uyarlanmış başarı maddeleri</h4>
          {res.bullets.experiences.map((x) => {
            const e = data.experiences.find((ee) => ee.id === res.expIds[x.i]);
            return (
              <div key={x.i} className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-700 mb-1.5">{e ? `${e.position}${e.company ? ' · ' + e.company : ''}` : `Deneyim ${x.i + 1}`}</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                  {x.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <p className="text-[10px] text-slate-400 mt-2">“[X]” yazan yere kendi gerçek rakamınızı yazın.</p>
                <div className="mt-2"><Btn k={'b' + x.i} onClick={() => applyBullets(x.i, x.bullets)}>Maddeleri değiştir</Btn></div>
              </div>
            );
          })}
        </div>
      )}

      {res?.core && res.core.keywords.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-700 mb-1">İlanda geçen, CV’nizde olmayan terimler</h4>
          <p className="text-[11px] text-slate-500 mb-2">Yalnızca gerçekten bildiklerinizi ekleyin.</p>
          <ul className="space-y-1.5">
            {res.core.keywords.map((k) => (
              <li key={k.term} className="flex items-start justify-between gap-2 text-xs bg-amber-50 border border-amber-100 rounded-lg p-2">
                <span><strong className="text-amber-900">{k.term}</strong>{k.where ? <span className="text-slate-600"> — {k.where}</span> : null}</span>
                <button type="button" disabled={!!applied['k' + k.term]} onClick={() => addSkill(k.term)}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-200 bg-white hover:bg-amber-100 text-amber-900 disabled:opacity-50">
                  {applied['k' + k.term] ? <Check size={10} /> : <Plus size={10} />} Ekle
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {res?.extra?.coverLetter && (
        <div>
          <h4 className="text-xs font-semibold text-slate-800 mb-1">Bu ilana özel ön yazı</h4>
          <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed max-h-56 overflow-y-auto">{res.extra.coverLetter}</p>
          <div className="mt-2"><Btn k="cover" onClick={() => applyCover(res.extra!.coverLetter)}>Ön yazıya aktar</Btn></div>
        </div>
      )}

      {res?.extra && res.extra.questions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1"><MessageCircleQuestion size={13} /> Olası mülakat soruları</h4>
          <ol className="space-y-2">
            {res.extra.questions.map((q, i) => (
              <li key={i} className="text-xs border border-slate-200 rounded-lg p-2.5">
                <p className="font-medium text-slate-800">{i + 1}. {q.q}</p>
                {q.tip && <p className="text-slate-600 mt-1 leading-relaxed">İpucu: {q.tip}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {res && <p className="text-[10px] text-slate-400">AI çıktısı öneridir. Göndermeden önce her cümlenin doğru olduğundan emin olun. Bu CV’yi bu ilana özel saklamak için üst menüden “Kaydet” ile ayrı bir profil oluşturabilirsiniz.</p>}
    </div>
  );
}
