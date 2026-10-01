import { CVData, getAISuggestions } from '../../types/cv';
import { Camera, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { aiSummary, AILimitError } from '../../utils/aiApi';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function PersonalForm({ data, setData }: Props) {
  const p = data.personal;
  const [showAI, setShowAI] = useState(false);

  const update = (field: string, value: string | null) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Fotoğraf 8MB\'dan küçük olmalı');
      return;
    }
    // Fotoğrafı küçültüp JPEG'e çevir (localStorage kotasını korur)
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 480;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext('2d');
        if (!ctx) { update('photo', reader.result as string); return; }
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        update('photo', c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => alert('Fotoğraf okunamadı, farklı bir dosya deneyin');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const suggestions = getAISuggestions(p.title, 'summary');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const runAI = async () => {
    setAiBusy(true); setAiErr('');
    try {
      const text = await aiSummary(data);
      update('summary', text);
    } catch (e) {
      if (!(e instanceof AILimitError)) setAiErr((e as Error).message);
    }
    setAiBusy(false);
  };

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div className="flex items-start gap-4">
        <div className="relative">
          {p.photo ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-teal-200 shadow-sm">
              <img src={p.photo} alt="Profil" className="w-full h-full object-cover" />
              <button
                onClick={() => update('photo', null)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition">
              <Camera size={24} className="text-slate-400" />
              <span className="text-xs text-slate-500 mt-1">Fotoğraf</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </div>
        <div className="flex-1 text-sm text-slate-500">
          <p className="font-medium text-slate-700 mb-1">Profesyonel fotoğraf</p>
          <p>Türkiye'de çoğu işveren fotoğraflı CV bekler. Nötr arka plan, iş kıyafeti önerilir. Opsiyonel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
          <input
            type="text"
            value={p.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Ahmet Yılmaz"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Ünvan / Pozisyon</label>
          <input
            type="text"
            value={p.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Yazılım Mühendisi"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
          <p className="text-xs text-slate-400 mt-1">Akıllı öneriler için ünvanı yazın</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
          <input
            type="email"
            value={p.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="ahmet@email.com"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefon *</label>
          <input
            type="tel"
            value={p.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+90 5XX XXX XX XX"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
          <input
            type="text"
            value={p.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="İstanbul"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Doğum Tarihi</label>
          <input
            type="text"
            value={p.birthDate}
            onChange={(e) => update('birthDate', e.target.value)}
            placeholder="15.03.1995"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medeni Durum</label>
          <select
            value={p.maritalStatus}
            onChange={(e) => update('maritalStatus', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition bg-white"
          >
            <option value="">Seçiniz</option>
            <option value="Bekar">Bekar</option>
            <option value="Evli">Evli</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Askerlik Durumu</label>
          <select
            value={p.militaryStatus}
            onChange={(e) => update('militaryStatus', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition bg-white"
          >
            <option value="">Seçiniz / Yok</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Muaf">Muaf</option>
            <option value="Tecilli">Tecilli</option>
            <option value="Yapılacak">Yapılacak</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
          <input
            type="url"
            value={p.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Portfolyo / GitHub</label>
          <input
            type="url"
            value={p.portfolio}
            onChange={(e) => update('portfolio', e.target.value)}
            placeholder="github.com/..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>
      </div>

      {/* AI Summary */}
      <div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-slate-700 flex-1">Profesyonel Özet</label>
          <button
            onClick={runAI}
            disabled={aiBusy}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 px-3 py-1.5 rounded-lg transition mr-2"
          >
            <Sparkles size={14} />
            {aiBusy ? 'Yazılıyor…' : 'AI ile Yaz'}
          </button>
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
          >
            <Sparkles size={14} />
            Hazır Örnekler
          </button>
        </div>
        {aiErr && <p className="text-xs text-red-600 mb-2">{aiErr}</p>}
        
        {showAI && (
          <div className="mb-3 space-y-2 animate-fade-in">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  update('summary', s);
                  setShowAI(false);
                }}
                className="w-full text-left text-xs p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl hover:border-teal-300 transition text-slate-700 leading-relaxed"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        <textarea
          value={p.summary}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="3-4 cümle ile kendinizi ve güçlü yönlerinizi özetleyin. Ölçülebilir başarılar ekleyin."
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">İpucu: "X projesinde Y% artış sağladım" gibi somut ifadeler kullanın.</p>
      </div>
    </div>
  );
}
