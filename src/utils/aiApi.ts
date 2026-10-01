/** Gerçek AI (Claude Haiku) — Netlify Function üzerinden. */
import { getToken, openGate, isPremiumNow } from './premium';
import { track } from './track';
import { CVData } from '../types/cv';

export type AIType = 'summary' | 'achievement' | 'cover';
export class AILimitError extends Error { constructor() { super('LIMIT'); } }

async function call(type: AIType, context: Record<string, unknown>): Promise<string> {
  const res = await fetch('/.netlify/functions/ai-generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, context, token: getToken() }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) {
    if (data.error === 'BUSY') throw new Error('Bugünkü ücretsiz AI kontenjanı doldu. Yarın tekrar deneyin veya bir paketle hemen devam edin.');
    if (isPremiumNow()) throw new Error('Günlük AI hakkınız doldu. Yarın yenilenir.');
    openGate('ai'); throw new AILimitError();
  }
  if (!res.ok) throw new Error(data.error || 'AI şu an kullanılamıyor');
  track('ai_use');
  return data.text as string;
}

export function aiSummary(d: CVData) {
  const exp = d.experiences.slice(0, 3)
    .map((e) => `${e.position} @ ${e.company}: ${e.achievements.filter((a) => a.trim()).slice(0, 2).join(', ')}`)
    .filter((s) => s.trim() !== '@:').join('; ');
  return call('summary', {
    title: d.personal.title, experience: exp || d.personal.summary,
    skills: d.skills.slice(0, 8).map((s) => s.name).join(', '), lang: d.language,
  });
}

export async function aiAchievements(position: string, company: string) {
  const t = await call('achievement', { position, company });
  return t.split('\n').map((l) => l.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 5);
}

export function aiCover(d: CVData) {
  return call('cover', {
    name: d.personal.fullName, position: d.coverLetter.position || d.personal.title,
    company: d.coverLetter.company, summary: d.personal.summary, lang: d.language,
  });
}

/* ---------- İlana özel CV uyarlama (yalnızca Premium/Pro) ---------- */
export interface TailorCore { verdict: string; score: number; summary: string; keywords: { term: string; where: string }[] }
export interface TailorBullets { experiences: { i: number; bullets: string[] }[] }
export interface TailorExtra { coverLetter: string; questions: { q: string; tip: string }[] }

async function tailorCall<T>(part: 'core' | 'bullets' | 'extra', d: CVData): Promise<T> {
  const cv = {
    lang: d.language, title: d.personal.title, summary: d.personal.summary,
    skills: d.skills.map((s) => s.name),
    experiences: d.experiences.slice(0, 4).map((e) => ({
      position: e.position, company: e.company, description: e.description,
      achievements: e.achievements.filter((a) => a.trim()),
    })),
  };
  const res = await fetch('/.netlify/functions/ai-tailor', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part, token: getToken(), job: d.jobDescription, cv }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 402) { openGate('tailor'); throw new Error('Bu özellik Premium gerektirir'); }
  if (res.status === 429) throw new Error('Günlük AI hakkınız doldu. Yarın yenilenir.');
  if (!res.ok) throw new Error(data.error || 'AI şu an kullanılamıyor');
  return data as T;
}

/** Üç parça paralel çalışır; biri düşerse diğerleri yine gösterilir. */
export async function aiTailor(d: CVData) {
  const [core, bullets, extra] = await Promise.allSettled([
    tailorCall<TailorCore>('core', d), tailorCall<TailorBullets>('bullets', d), tailorCall<TailorExtra>('extra', d),
  ]);
  const val = <T,>(r: PromiseSettledResult<T>) => (r.status === 'fulfilled' ? r.value : null);
  const firstErr = [core, bullets, extra].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
  return { core: val(core), bullets: val(bullets), extra: val(extra), error: firstErr ? String((firstErr.reason as Error)?.message || '') : '' };
}
