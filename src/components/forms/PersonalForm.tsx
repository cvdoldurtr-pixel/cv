import { CVData, getAISuggestions, DRIVING_CLASSES } from '../../types/cv';
import { Camera, X, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { aiSummary, AILimitError } from '../../utils/aiApi';
import { isValidEmail, isValidPhone } from '../../utils/quality';

interface Props {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
}

const INPUT =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition';
const SELECT = INPUT + ' bg-white';

/** Alanın CV'de görünüp görünmeyeceğini belirleyen küçük anahtar */
function ShowToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      aria-label={`${label}: CV'de ${on ? 'gösteriliyor' : 'gizli'}`}
      title={on ? "CV'de gösteriliyor (gizlemek için tıklayın)" : "CV'de gizli (göstermek için tıklayın)"}
      className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md border transition ${
        on ? 'text-teal-700 border-teal-200 bg-teal-50' : 'text-slate-500 border-slate-200 bg-white'
      }`}
    >
      {on ? <Eye size={11} /> : <EyeOff size={11} />} {on ? "CV'de göster" : 'Gizli'}
    </button>
  );
}

export default function PersonalForm({ data, setData }: Props) {
  const p = data.personal;
  const [showAI, setShowAI] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (field: keyof CVData['personal'], value: string | string[] | boolean | null) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const emailErr = touched.email && p.email.trim() && !isValidEmail(p.email) ? 'E-posta adresi hatalı görünüyor (ör. ad@ornek.com)' : '';
  const phoneErr = touched.phone && p.phone.trim() && !isValidPhone(p.phone) ? 'Telefon en az 10 rakam olmalı (ör. 0532 123 45 67)' : '';
  const toggleLicense = (c: string) =>
    update('drivingLicense', p.drivingLicense.includes(c) ? p.drivingLicense.filter((x) => x !== c) : [...p.drivingLicense, c]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Fotoğraf 15 MB'tan küçük olmalı");
      return;
    }
    // Fotoğrafı küçültüp JPEG'e çevir (localStorage kotasını korur; ~40-80 KB)
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
        if (!ctx) { alert('Fotoğraf işlenemedi, farklı bir dosya deneyin'); return; }
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        update('photo', c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => alert('Fotoğraf okunamadı (HEIC ise JPG olarak kaydedip tekrar deneyin)');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const suggestions = getAISuggestions(p.title, 'summary');

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
      {/* Fotoğraf */}
      <div className="flex items-start gap-4">
        <div className="relative">
          {p.photo ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-teal-200 shadow-sm">
              <img src={p.photo} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
              <button
                onClick={() => update('photo', null)}
                aria-label="Fotoğrafı kaldır"
                className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition focus-within:ring-2 focus-within:ring-teal-300">
              <Camera size={24} className="text-slate-400" />
              <span className="text-xs text-slate-500 mt-1">Fotoğraf</span>
              <input type="file" accept="image/*" className="sr-only" aria-label="Profil fotoğrafı yükle" onChange={handlePhoto} />
            </label>
          )}
        </div>
        <div className="flex-1 text-sm text-slate-500">
          <p className="font-medium text-slate-700 mb-1">Profesyonel fotoğraf</p>
          <p>Türkiye'de çoğu işveren fotoğraflı CV bekler. Nötr arka plan, iş kıyafeti önerilir. Opsiyonel; fotoğraf otomatik küçültülür.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="pf-name" className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
          <input id="pf-name" type="text" autoComplete="name" value={p.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Ahmet Yılmaz" className={INPUT} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pf-title" className="block text-sm font-medium text-slate-700 mb-1">Ünvan / Hedef Pozisyon</label>
          <input id="pf-title" type="text" autoComplete="organization-title" value={p.title} onChange={(e) => update('title', e.target.value)} placeholder="Yazılım Mühendisi" className={INPUT} />
          <p className="text-xs text-slate-400 mt-1">Başvurduğunuz ilandaki unvanı yazmak eşleşmeyi artırır</p>
        </div>

        <div>
          <label htmlFor="pf-email" className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
          <input
            id="pf-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={p.email}
            onChange={(e) => update('email', e.target.value.trim())}
            onBlur={() => touch('email')}
            placeholder="ahmet@email.com"
            aria-invalid={!!emailErr}
            aria-describedby={emailErr ? 'pf-email-err' : undefined}
            className={`${INPUT} ${emailErr ? 'border-red-300' : ''}`}
          />
          {emailErr && <p id="pf-email-err" className="text-xs text-red-600 mt-1">{emailErr}</p>}
        </div>

        <div>
          <label htmlFor="pf-phone" className="block text-sm font-medium text-slate-700 mb-1">Telefon *</label>
          <input
            id="pf-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={p.phone}
            onChange={(e) => update('phone', e.target.value)}
            onBlur={() => touch('phone')}
            placeholder="0532 123 45 67"
            aria-invalid={!!phoneErr}
            aria-describedby={phoneErr ? 'pf-phone-err' : undefined}
            className={`${INPUT} ${phoneErr ? 'border-red-300' : ''}`}
          />
          {phoneErr && <p id="pf-phone-err" className="text-xs text-red-600 mt-1">{phoneErr}</p>}
        </div>

        <div>
          <label htmlFor="pf-city" className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
          <input id="pf-city" type="text" autoComplete="address-level2" value={p.city} onChange={(e) => update('city', e.target.value)} placeholder="İstanbul" className={INPUT} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="pf-birth" className="block text-sm font-medium text-slate-700">Doğum Tarihi</label>
            <ShowToggle label="Doğum tarihi" on={p.showBirthDate} onChange={(v) => update('showBirthDate', v)} />
          </div>
          <input id="pf-birth" type="text" value={p.birthDate} onChange={(e) => update('birthDate', e.target.value)} placeholder="15.03.1995" className={INPUT} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="pf-marital" className="block text-sm font-medium text-slate-700">Medeni Durum</label>
            <ShowToggle label="Medeni durum" on={p.showMaritalStatus} onChange={(v) => update('showMaritalStatus', v)} />
          </div>
          <select id="pf-marital" value={p.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className={SELECT}>
            <option value="">Seçiniz</option>
            <option value="Bekar">Bekar</option>
            <option value="Evli">Evli</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="pf-military" className="block text-sm font-medium text-slate-700">Askerlik Durumu</label>
            <ShowToggle label="Askerlik durumu" on={p.showMilitaryStatus} onChange={(v) => update('showMilitaryStatus', v)} />
          </div>
          <select id="pf-military" value={p.militaryStatus} onChange={(e) => update('militaryStatus', e.target.value)} className={SELECT}>
            <option value="">Seçiniz / Yok</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Muaf">Muaf</option>
            <option value="Tecilli">Tecilli</option>
            <option value="Yapılacak">Yapılacak</option>
          </select>
        </div>

        <div>
          <label htmlFor="pf-linkedin" className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
          <input id="pf-linkedin" type="url" inputMode="url" value={p.linkedin} onChange={(e) => update('linkedin', e.target.value.trim())} placeholder="linkedin.com/in/..." className={INPUT} />
        </div>

        <div>
          <label htmlFor="pf-portfolio" className="block text-sm font-medium text-slate-700 mb-1">Portfolyo / GitHub / Web</label>
          <input id="pf-portfolio" type="url" inputMode="url" value={p.portfolio} onChange={(e) => update('portfolio', e.target.value.trim())} placeholder="github.com/..." className={INPUT} />
        </div>
      </div>

      <p className="text-[11px] text-slate-500 -mt-2">
        Doğum tarihi ve medeni durum modern CV'lerde genelde yazılmaz; yazsanız da “Gizli” bırakabilirsiniz. T.C. kimlik no gibi bilgileri CV'ye yazmayın.
      </p>

      {/* Türkiye'ye özel ek bilgiler */}
      <details
        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
        open={!!(p.drivingLicense.length || p.workPreference || p.travel || p.availability)}
      >
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          Ehliyet, çalışma tercihi ve işe başlama <span className="font-normal text-slate-500">(opsiyonel)</span>
        </summary>
        <div className="mt-3 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Sürücü belgesi / yeterlilik</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sürücü belgesi sınıfları">
              {DRIVING_CLASSES.map((c) => {
                const on = p.drivingLicense.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleLicense(c)}
                    className={`min-w-[44px] min-h-[36px] px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                      on ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Şoför, kurye, saha satış ve lojistik ilanlarında çoğu zaman sorulur.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="pf-work" className="block text-xs font-medium text-slate-600 mb-1">Çalışma tercihi</label>
              <select id="pf-work" value={p.workPreference} onChange={(e) => update('workPreference', e.target.value)} className={SELECT}>
                <option value="">Belirtme</option>
                <option value="Ofis">Ofis</option>
                <option value="Hibrit">Hibrit</option>
                <option value="Uzaktan">Uzaktan</option>
                <option value="Ofis / Hibrit / Uzaktan">Fark etmez</option>
              </select>
            </div>
            <div>
              <label htmlFor="pf-travel" className="block text-xs font-medium text-slate-600 mb-1">Seyahat</label>
              <select id="pf-travel" value={p.travel} onChange={(e) => update('travel', e.target.value)} className={SELECT}>
                <option value="">Belirtme</option>
                <option value="Seyahat engeli yok">Seyahat engeli yok</option>
              </select>
            </div>
            <div>
              <label htmlFor="pf-avail" className="block text-xs font-medium text-slate-600 mb-1">İşe başlama</label>
              <select id="pf-avail" value={p.availability} onChange={(e) => update('availability', e.target.value)} className={SELECT}>
                <option value="">Belirtme</option>
                <option value="Hemen başlayabilir">Hemen başlayabilir</option>
                <option value="2 hafta içinde başlayabilir">2 hafta içinde</option>
                <option value="1 ay içinde başlayabilir">1 ay içinde</option>
              </select>
            </div>
          </div>
        </div>
      </details>

      {/* Özet */}
      <div>
        <div className="flex items-center mb-1 flex-wrap gap-y-2">
          <label htmlFor="pf-summary" className="block text-sm font-medium text-slate-700 flex-1">Profesyonel Özet</label>
          <button
            type="button"
            onClick={runAI}
            disabled={aiBusy}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 px-3 py-2 rounded-lg transition mr-2"
          >
            <Sparkles size={14} />
            {aiBusy ? 'Yazılıyor…' : 'AI ile Yaz'}
          </button>
          <button
            type="button"
            onClick={() => setShowAI(!showAI)}
            aria-expanded={showAI}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition"
          >
            <Sparkles size={14} />
            Hazır Örnekler
          </button>
        </div>
        {aiErr && <p className="text-xs text-red-600 mb-2" role="alert">{aiErr}</p>}

        {showAI && (
          <div className="mb-3 space-y-2 animate-fade-in">
            {suggestions.map((s, i) => (
              <button
                type="button"
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
            <p className="text-[11px] text-slate-500">Örneklerdeki rakamları kendi gerçek rakamlarınızla değiştirin.</p>
          </div>
        )}

        <textarea
          id="pf-summary"
          value={p.summary}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="3-4 cümle ile kendinizi ve güçlü yönlerinizi özetleyin. Ölçülebilir bir başarı ekleyin."
          rows={4}
          className={`${INPUT} resize-y`}
        />
        <p className="text-xs text-slate-400 mt-1 flex justify-between gap-2">
          <span>İpucu: kim olduğunuz, güçlü yönünüz ve somut bir sonuç.</span>
          <span className={p.summary.length > 900 ? 'text-amber-600 font-medium' : ''}>{p.summary.length} karakter</span>
        </p>
      </div>
    </div>
  );
}
