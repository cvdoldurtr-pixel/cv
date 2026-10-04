/**
 * CV Kalite Skoru (0-100). Bu bir ATS sonucu DEĞİLDİR; içeriğin eksiksizliğini ve
 * kalitesini ölçer. İlana uyum ayrıca İş İlanı adımında (anahtar kelime) hesaplanır.
 */
import { CVData } from '../types/cv';

export type IssueLevel = 'error' | 'warn' | 'tip';
export interface QualityIssue {
  text: string;
  points: number;
  step: number;
  level: IssueLevel;
}
export type QualityGrade = 'excellent' | 'strong' | 'developing' | 'incomplete';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());
/** Türkiye ve uluslararası numaralar: 10-13 rakam */
export const isValidPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 13;
};

const PLACEHOLDER_RE = /\[\s*[xX]\s*\]/;
export const hasPlaceholder = (s: string) => PLACEHOLDER_RE.test(s || '');

export type BulletLevel = 'placeholder' | 'weak' | 'ok' | 'strong';
/** Başarı maddesi kalitesi: rakam/yüzde/tutar içeren maddeler en güçlüsüdür. */
export function bulletQuality(text: string): BulletLevel {
  const t = (text || '').trim();
  if (hasPlaceholder(t)) return 'placeholder';
  if (t.length < 25) return 'weak';
  if (/\d/.test(t)) return 'strong';
  return 'ok';
}
export const BULLET_HINT: Record<BulletLevel, string> = {
  placeholder: '[X] yerine kendi gerçek rakamınızı yazın',
  weak: 'Çok kısa: ne yaptığınızı ve sonucunu yazın',
  ok: 'İyi. Mümkünse rakam ekleyin (%, adet, ₺, süre)',
  strong: 'Güçlü: ölçülebilir sonuç içeriyor',
};

/** CV'de doldurulmamış [X] yer tutucusu olan yerlerin listesi */
export function findPlaceholders(d: CVData): string[] {
  const out: string[] = [];
  if (hasPlaceholder(d.personal.summary)) out.push('Profesyonel özet');
  d.experiences.forEach((e, i) => {
    if (e.achievements.some(hasPlaceholder) || hasPlaceholder(e.description)) {
      out.push(`Deneyim ${i + 1}${e.position ? ` (${e.position})` : ''}`);
    }
  });
  if (hasPlaceholder(d.coverLetter.content)) out.push('Ön yazı');
  return out;
}

export function calculateQuality(d: CVData): { score: number; grade: QualityGrade; issues: QualityIssue[] } {
  const issues: QualityIssue[] = [];
  let score = 0;
  const add = (ok: boolean, pts: number, issue: Omit<QualityIssue, 'points'>) => {
    if (ok) score += pts;
    else issues.push({ ...issue, points: pts });
  };
  const p = d.personal;

  add(!!p.fullName.trim(), 6, { text: 'Ad soyad eksik', step: 0, level: 'error' });
  add(!!p.title.trim(), 4, { text: 'Ünvan / hedef pozisyon ekleyin', step: 0, level: 'warn' });

  const emailOk = isValidEmail(p.email);
  const phoneOk = isValidPhone(p.phone);
  add(emailOk && phoneOk, 10, {
    text: !p.email || !p.phone ? 'E-posta ve telefon ekleyin' : !emailOk ? 'E-posta adresi hatalı görünüyor' : 'Telefon numarası eksik/hatalı görünüyor',
    step: 0,
    level: 'error',
  });

  const sumLen = p.summary.trim().length;
  if (sumLen > 900) {
    score += 6;
    issues.push({ text: 'Özet çok uzun: 3-4 cümleye indirin', points: 6, step: 0, level: 'warn' });
  } else {
    add(sumLen >= 120, 12, {
      text: sumLen === 0 ? 'Profesyonel özet ekleyin (3-4 cümle)' : 'Özet çok kısa: en az 2-3 cümle yazın',
      step: 0,
      level: 'warn',
    });
  }

  const exps = d.experiences.filter((e) => e.company.trim() || e.position.trim());
  const isStudentLike = exps.length === 0 && (d.projects.length > 0 || d.educations.length > 0);
  add(exps.length > 0, 14, {
    text: isStudentLike ? 'Staj, gönüllülük veya yarı zamanlı iş varsa deneyime ekleyin' : 'En az bir iş deneyimi ekleyin',
    step: 1,
    level: isStudentLike ? 'tip' : 'warn',
  });

  const bullets = d.experiences.flatMap((e) => e.achievements.map((a) => a.trim()).filter(Boolean));
  const strong = bullets.filter((b) => bulletQuality(b) === 'strong').length;
  if (exps.length > 0) {
    add(bullets.length >= Math.min(2, exps.length * 2), 8, { text: 'Her deneyime 2-4 başarı maddesi yazın', step: 1, level: 'warn' });
    add(strong >= 1 && strong / Math.max(bullets.length, 1) >= 0.34, 10, {
      text: 'Başarılarınızı rakamla güçlendirin (%, adet, ₺, süre)',
      step: 1,
      level: 'warn',
    });
    const noDates = exps.filter((e) => !e.startDate.trim()).length;
    add(noDates === 0, 4, { text: 'Deneyimlerde başlangıç tarihi eksik', step: 1, level: 'warn' });
  }

  add(d.educations.some((e) => e.school.trim()), 8, { text: 'Eğitim bilgisi ekleyin', step: 2, level: 'warn' });
  add(d.skills.filter((s) => s.name.trim()).length >= 5, 8, { text: 'En az 5 yetenek ekleyin (ilana uygun)', step: 3, level: 'warn' });
  add(d.languages.some((l) => l.name.trim()), 4, { text: 'Dil bilgisi ekleyin', step: 3, level: 'tip' });
  add(!!p.linkedin.trim(), 3, { text: 'LinkedIn profil linki ekleyin', step: 0, level: 'tip' });

  // Ölçeklendirme. Deneyimli: toplam 91 puan. Deneyimsiz (yeni mezun/öğrenci): deneyime bağlı
  // 36 puan düşülür; kalan 55 puan 60 üzerinden ölçeklenir ki tam doldurulmuş bir öğrenci CV'si ~92 alsın.
  const max = exps.length > 0 ? 91 : 60;
  let final = Math.round((score / max) * 100);

  const ph = findPlaceholders(d);
  if (ph.length) {
    final = Math.max(0, final - 15);
    issues.unshift({ text: `Doldurulmamış [X] var: ${ph.join(', ')}`, points: 15, step: ph[0].startsWith('Ön') ? 4 : ph[0].startsWith('Profes') ? 0 : 1, level: 'error' });
  }
  if (d.template === 'sidebar') {
    issues.push({ text: 'İki sütunlu şablon bazı ATS sistemlerinde karışık okunur; büyük şirketlere ATS Sade veya Modern gönderin', points: 0, step: 6, level: 'tip' });
  }

  final = Math.min(100, final);
  const grade: QualityGrade = final >= 90 ? 'excellent' : final >= 75 ? 'strong' : final >= 55 ? 'developing' : 'incomplete';
  const order: Record<IssueLevel, number> = { error: 0, warn: 1, tip: 2 };
  issues.sort((a, b) => order[a.level] - order[b.level] || b.points - a.points);
  return { score: final, grade, issues };
}
