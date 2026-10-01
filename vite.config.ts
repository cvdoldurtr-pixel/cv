import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * public/_redirects dosyasını yerelde (dev + preview) de uygular.
 * Netlify bu dosyayı canlıda kendisi okur; Vite okumadığı için localhost'ta
 * /iletisim gibi adresler ana uygulamaya düşüyordu. Bu eklenti yalnızca
 * "temiz adres -> .html" kurallarını (durum kodu 200) yerelde çalıştırır.
 */
function netlifyRedirects(): Plugin {
  const map = new Map<string, string>()
  try {
    const raw = readFileSync(resolve(__dirname, 'public/_redirects'), 'utf-8')
    for (const line of raw.split(/\r?\n/)) {
      const l = line.trim()
      if (!l || l.startsWith('#')) continue
      const [from, to, status] = l.split(/\s+/)
      if (from && to && status === '200' && !from.includes('*')) map.set(from, to)
    }
  } catch {
    /* _redirects yoksa sessizce geç */
  }
  const handler = (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url || ''
    const q = url.indexOf('?')
    const path = (q === -1 ? url : url.slice(0, q)).replace(/\/+$/, '') || '/'
    const target = map.get(path)
    if (target) req.url = target + (q === -1 ? '' : url.slice(q))
    next()
  }
  return {
    name: 'netlify-redirects-local',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), netlifyRedirects()],
  server: {
    port: 3000,
    open: true
  }
})
