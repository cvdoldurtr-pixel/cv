export async function resolve(spec, ctx, next) {
  if (spec === '@netlify/blobs') return { url: new URL('./fakeblobs.mjs', import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
