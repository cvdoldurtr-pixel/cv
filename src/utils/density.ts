export type Density = 'comfortable' | 'compact' | 'tight';

export function densityClasses(d: Density = 'comfortable') {
  return {
    pad: d === 'tight' ? 'p-5' : d === 'compact' ? 'p-6' : 'p-8',
    gap: d === 'tight' ? 'mb-3' : d === 'compact' ? 'mb-4' : 'mb-5',
    text: d === 'tight' ? 'text-[12px]' : 'text-[13px]',
    space: d === 'tight' ? 'space-y-2' : d === 'compact' ? 'space-y-3' : 'space-y-4',
  };
}
