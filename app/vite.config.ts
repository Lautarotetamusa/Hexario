import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite bloquea por defecto hosts desconocidos (ngrok, LAN). El build de
  // producción se sirve con nginx, así que esto sólo afecta dev/preview.
  server: { allowedHosts: true },
  preview: { allowedHosts: true },
})
