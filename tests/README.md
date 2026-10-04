# Testler

Sunucu fonksiyonları (ek kurulum gerekmez):

```bash
node tests/unit.mjs                          # PayTR tutar kontrolü, token, CV sanitize
node --import ./tests/register.mjs tests/fn.mjs   # ai-import ve paytr-callback (Netlify Blobs ve AI taklit edilir)
```

Tarayıcı testleri (Playwright gerekir: `npm i -D playwright && npx playwright install chromium`):

```bash
npm run build && npx vite preview --port 4173 &
node tests/e2e.mjs     # 51 senaryo: içe aktarma, şablonlar, mobil, başvuru takibi…
node tests/print.mjs   # yazdırma/PDF sayfa düzeni (pdftotext/pdfinfo gerekir: poppler-utils)
```
