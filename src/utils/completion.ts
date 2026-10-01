import { CVData } from '../types/cv';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  step: number;
  weight: number;
}

export function getCompletionChecklist(data: CVData): {
  items: ChecklistItem[];
  doneCount: number;
  total: number;
  percent: number;
} {
  const items: ChecklistItem[] = [
    { id: 'name', label: 'Ad soyad', done: !!data.personal.fullName.trim(), step: 0, weight: 1 },
    { id: 'contact', label: 'E-posta + telefon', done: !!(data.personal.email && data.personal.phone), step: 0, weight: 1 },
    { id: 'title', label: 'Ünvan / pozisyon', done: !!data.personal.title.trim(), step: 0, weight: 1 },
    { id: 'summary', label: 'Profesyonel özet (50+ karakter)', done: (data.personal.summary?.length || 0) >= 50, step: 0, weight: 1 },
    { id: 'exp', label: 'En az 1 iş deneyimi', done: data.experiences.length > 0, step: 1, weight: 1 },
    {
      id: 'ach',
      label: 'Ölçülebilir başarı maddesi',
      done: data.experiences.some((e) => e.achievements.some((a) => a.trim().length > 10)),
      step: 1,
      weight: 1,
    },
    { id: 'edu', label: 'Eğitim bilgisi', done: data.educations.length > 0, step: 2, weight: 1 },
    { id: 'skills', label: 'En az 4 yetenek', done: data.skills.length >= 4, step: 3, weight: 1 },
    { id: 'lang', label: 'Dil bilgisi', done: data.languages.length > 0, step: 3, weight: 1 },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const total = items.length;
  const percent = Math.round((doneCount / total) * 100);
  return { items, doneCount, total, percent };
}
