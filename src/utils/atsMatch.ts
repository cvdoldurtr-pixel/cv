/** Job description ↔ CV keyword match (adapted from ElitCV SaaS v16, client-side only) */

const ALIASES: Record<string, string> = {
  'react.js': 'react',
  reactjs: 'react',
  nextjs: 'next.js',
  next: 'next.js',
  js: 'javascript',
  ts: 'typescript',
  node: 'node.js',
  nodejs: 'node.js',
  postgres: 'postgresql',
  'ms sql': 'sql server',
  mssql: 'sql server',
  k8s: 'kubernetes',
  'c#': 'csharp',
  'c++': 'cpp',
  'makine öğrenmesi': 'machine learning',
  'yapay zeka': 'ai',
  'veri bilimi': 'data science',
  'proje yönetimi': 'project management',
  'müşteri ilişkileri': 'crm',
  'dijital pazarlama': 'digital marketing',
};

const STOP = new Set([
  've', 'veya', 'ile', 'için', 'bir', 'bu', 'olan', 'olarak', 'gibi', 'çok', 'daha',
  'the', 'and', 'or', 'for', 'with', 'our', 'you', 'your', 'will', 'are', 'is', 'to',
  'of', 'in', 'on', 'at', 'we', 'be', 'an', 'as', 'from', 'that', 'this', 'have',
  'yıl', 'yıllık', 'deneyim', 'experience', 'required', 'requirements', 'görev',
  'sorumluluk', 'aranan', 'nitelikler', 'iş', 'tanımı', 'hakkında', 'şirket',
]);

function norm(x: string): string {
  let s = x
    .toLocaleLowerCase('tr-TR')
    .replace(/[()[\]{}.,:;!?/\\|+=*"'`´]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return ALIASES[s] || s;
}

export function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/\s+/)
        .map(norm)
        .filter((x) => x.length >= 3 && !STOP.has(x) && !/^\d+$/.test(x))
    )
  );
}

export interface JobMatchResult {
  matched: string[];
  missing: string[];
  coverage: number;
  jobTokenCount: number;
}

export function atsCompare(resumeText: string, jobText: string): JobMatchResult {
  const r = new Set(tokenize(resumeText));
  const j = tokenize(jobText);
  const jSet = new Set(j);
  const matched = j.filter((x) => r.has(x));
  const missing = j.filter((x) => !r.has(x));
  const uniqueMatched = Array.from(new Set(matched));
  const uniqueMissing = Array.from(new Set(missing));
  const coverage = Math.round((uniqueMatched.length / Math.max(jSet.size, 1)) * 100);
  return {
    matched: uniqueMatched.slice(0, 60),
    missing: uniqueMissing.slice(0, 60),
    coverage,
    jobTokenCount: jSet.size,
  };
}

/** Flatten CV into plain text for matching & ATS paste */
export function cvToPlainText(data: {
  personal: { fullName: string; title: string; summary: string; email: string; phone: string; city: string; linkedin: string };
  experiences: { position: string; company: string; description: string; achievements: string[] }[];
  educations: { school: string; department: string; degree: string }[];
  skills: { name: string }[];
  languages: { name: string; level: string }[];
  certificates: { name: string; issuer: string }[];
  projects: { name: string; description: string; technologies: string }[];
}): string {
  const parts: string[] = [];
  const p = data.personal;
  parts.push(p.fullName, p.title, p.summary, p.email, p.phone, p.city, p.linkedin);
  data.experiences.forEach((e) => {
    parts.push(e.position, e.company, e.description, ...(e.achievements || []));
  });
  data.educations.forEach((e) => parts.push(e.school, e.department, e.degree));
  data.skills.forEach((s) => parts.push(s.name));
  data.languages.forEach((l) => parts.push(l.name, l.level));
  data.certificates.forEach((c) => parts.push(c.name, c.issuer));
  data.projects.forEach((pr) => parts.push(pr.name, pr.description, pr.technologies));
  return parts.filter(Boolean).join(' ');
}

export function cvToAtsText(data: Parameters<typeof cvToPlainText>[0]): string {
  const lines: string[] = [];
  const p = data.personal;
  lines.push((p.fullName || 'AD SOYAD').toUpperCase());
  if (p.title) lines.push(p.title);
  lines.push([p.email, p.phone, p.city, p.linkedin].filter(Boolean).join(' | '));
  lines.push('');
  if (p.summary) {
    lines.push('PROFESYONEL ÖZET');
    lines.push(p.summary);
    lines.push('');
  }
  if (data.experiences.length) {
    lines.push('İŞ DENEYİMİ');
    data.experiences.forEach((e) => {
      lines.push(`${e.position} — ${e.company}`);
      if (e.description) lines.push(e.description);
      e.achievements.filter(Boolean).forEach((a) => lines.push(`• ${a}`));
      lines.push('');
    });
  }
  if (data.educations.length) {
    lines.push('EĞİTİM');
    data.educations.forEach((e) => {
      lines.push(`${e.degree} ${e.department} — ${e.school}`.trim());
    });
    lines.push('');
  }
  if (data.skills.length) {
    lines.push('YETENEKLER');
    lines.push(data.skills.map((s) => s.name).join(', '));
    lines.push('');
  }
  if (data.languages.length) {
    lines.push('DİLLER');
    lines.push(data.languages.map((l) => `${l.name} (${l.level})`).join(', '));
  }
  return lines.join('\n');
}
