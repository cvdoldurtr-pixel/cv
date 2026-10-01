import { useState } from 'react';
import { CVData, calculateATSScore } from '../types/cv';
import PersonalForm from './forms/PersonalForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import TemplateForm from './forms/TemplateForm';
import CoverLetterForm from './forms/CoverLetterForm';
import JobMatchForm from './forms/JobMatchForm';
import { ChevronLeft, ChevronRight, Printer, Sparkles, Target, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';
import { getCompletionChecklist } from '../utils/completion';
import { requestPdf } from '../utils/premium';

interface WizardProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const steps = [
  { id: 0, title: 'Kişisel Bilgiler', short: 'Kişisel' },
  { id: 1, title: 'İş Deneyimi', short: 'Deneyim' },
  { id: 2, title: 'Eğitim', short: 'Eğitim' },
  { id: 3, title: 'Yetenekler & Diğer', short: 'Yetenek' },
  { id: 4, title: 'Ön Yazı (Opsiyonel)', short: 'Ön Yazı' },
  { id: 5, title: 'İş İlanı Eşleştirme', short: 'İlan' },
  { id: 6, title: 'Şablon & ATS', short: 'Tasarım' },
];

const gradeLabel: Record<string, string> = {
  excellent: 'Mükemmel',
  strong: 'Güçlü',
  developing: 'Gelişiyor',
  incomplete: 'Eksik',
};

export default function Wizard({ data, setData, step, setStep }: WizardProps) {
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const ats = calculateATSScore(data);
  const [showAtsDetail, setShowAtsDetail] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const completion = getCompletionChecklist(data);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-white">
        <div className="flex gap-1 mb-3">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s.id <= step ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-slate-500 overflow-x-auto gap-1">
          {steps.map((s) => (
            <span
              key={s.id}
              className={`cursor-pointer hover:text-teal-600 whitespace-nowrap ${s.id === step ? 'text-teal-700 font-semibold' : ''}`}
              onClick={() => setStep(s.id)}
            >
              {s.short}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 bg-gradient-to-r from-slate-50 to-teal-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-teal-600" />
            <span className="text-xs font-medium text-slate-600">CV Hazırlık · {gradeLabel[ats.grade]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ats.score >= 80 ? 'bg-emerald-500' : ats.score >= 60 ? 'bg-amber-500' : 'bg-red-400'
                }`}
                style={{ width: `${ats.score}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${
              ats.score >= 80 ? 'text-emerald-600' : ats.score >= 60 ? 'text-amber-600' : 'text-red-500'
            }`}>
              {ats.score}
            </span>
            {ats.tips.length > 0 && (
              <button
                onClick={() => setShowAtsDetail(!showAtsDetail)}
                className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-100/80 hover:bg-teal-100 px-2 py-1 rounded-lg transition"
              >
                Detay
                {showAtsDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>
        {showAtsDetail && ats.tips.length > 0 && (
          <div className="mt-2 pt-2 border-t border-teal-100/50 space-y-1.5">
            {ats.tips.map((tip, i) => (
              <button
                key={i}
                onClick={() => {
                  setStep(tip.step);
                  setShowAtsDetail(false);
                }}
                className="w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded-lg hover:bg-white/80 transition group"
              >
                <span className="text-amber-800 group-hover:text-teal-800">{tip.text}</span>
                <span className="text-teal-600 font-semibold whitespace-nowrap ml-2">+{tip.points} puan</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-b border-slate-100 bg-white">
        <button
          type="button"
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <ListChecks size={14} className="text-teal-600" />
            Tamamlanma
          </span>
          <span className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${completion.percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{completion.percent}%</span>
            {showChecklist ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </button>
        {showChecklist && (
          <ul className="mt-2 space-y-1">
            {completion.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => { setStep(item.step); setShowChecklist(false); }}
                  className={`w-full flex items-center gap-2 text-xs px-2 py-1 rounded-lg hover:bg-slate-50 text-left ${
                    item.done ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                    item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                  }`}>
                    {item.done ? '✓' : ''}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900">{steps[step].title}</h2>
          {(step === 0 || step === 5) && <Sparkles size={18} className="text-amber-500" />}
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {step === 0 && 'İletişim, coğraf, askerlik ve akıllı önerilerle profesyonel özet'}
          {step === 1 && 'İş deneyimlerinizi ters kronolojik sırayla ekleyin. Başarıları ölçülebilir yazın.'}
          {step === 2 && 'Eğitim bilgilerinizi ekleyin'}
          {step === 3 && 'Yetenekler, diller, sertifikalar ve projeler'}
          {step === 4 && 'Başvurduğunuz pozisyon için özel ön yazı / motivasyon mektubu'}
          {step === 5 && 'İlan metnini yapıştırın — eksik anahtar kelimeleri görün ve yeteneklere ekleyin'}
          {step === 6 && 'Şablon, renk, yoğunluk, bölüm sırası ve görünürlük'}
        </p>

        {step === 0 && <PersonalForm data={data} setData={setData} />}
        {step === 1 && <ExperienceForm data={data} setData={setData} />}
        {step === 2 && <EducationForm data={data} setData={setData} />}
        {step === 3 && <SkillsForm data={data} setData={setData} />}
        {step === 4 && <CoverLetterForm data={data} setData={setData} />}
        {step === 5 && <JobMatchForm data={data} setData={setData} />}
        {step === 6 && (
          <>
            <TemplateForm data={data} setData={setData} />
            {ats.tips.length > 0 && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                  <Target size={16} /> CV Hazırlık Önerileri
                </h4>
                <ul className="space-y-1.5">
                  {ats.tips.map((tip, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setStep(tip.step)}
                        className="w-full flex items-center justify-between text-sm text-amber-700 hover:text-teal-700 hover:bg-amber-100/50 rounded-lg px-2 py-1.5 transition text-left"
                      >
                        <span className="flex gap-2"><span>•</span> {tip.text}</span>
                        <span className="text-teal-600 font-semibold whitespace-nowrap">+{tip.points}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ats.score >= 85 && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                🎉 CV'niz eksiksiz görünüyor. Bu skor tamamlanma ve kalite kontrolüdür; belirli bir ATS sonucunu garanti etmez.
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} />
          Geri
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-primary"
          >
            İleri
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={requestPdf}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-primary"
          >
            <Printer size={18} />
            PDF İndir
          </button>
        )}
      </div>
    </div>
  );
}
