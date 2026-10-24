import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El sistema de diseño vive en app/ y se consume desde ahí para no duplicarlo.
// dedupe hace que sus imports de react/h3/maplibre resuelvan contra los
// node_modules de la landing y no busquen los de app/.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ds': fileURLToPath(new URL('../app/src/design-system', import.meta.url)),
    },
    dedupe: ['react', 'react-dom', 'h3-js', 'maplibre-gl', 'qrcode.react'],
  },
  server: {
    fs: { allow: ['..'] },
  },
})
