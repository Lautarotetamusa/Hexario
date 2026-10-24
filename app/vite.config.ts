import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En producción la PWA vive bajo /app/ (landing en / y API en /api/).
// En local el default sigue siendo / para no cambiar `npm run dev`.
const rawBase = process.env.VITE_BASE_PATH ?? '/'
const normalizedBase = rawBase.replace(/^\/+|\/+$/g, '')
const base = normalizedBase ? `/${normalizedBase}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  // Vite bloquea por defecto hosts desconocidos (ngrok, LAN). El build de
  // producción se sirve con nginx, así que esto sólo afecta dev/preview.
  server: { allowedHosts: true },
  preview: { allowedHosts: true },
})
