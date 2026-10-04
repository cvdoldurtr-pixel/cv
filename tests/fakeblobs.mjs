const stores = globalThis.__stores ||= {};
export function getStore(name) {
  const m = (stores[name] ||= new Map());
  return { async get(k, o) { const v = m.get(k); return v === undefined ? null : o?.type === 'json' ? JSON.parse(v) : v; }, async set(k, v) { m.set(k, String(v)); }, async setJSON(k, v) { m.set(k, JSON.stringify(v)); } };
}
