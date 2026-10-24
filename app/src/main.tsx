import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist-mono/500.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import './design-system/styles/tokens.css'
import './design-system/styles/base.css'
import './design-system/styles/components.css'
import './index.css'
import App from './App.tsx'

// El service worker es lo que hace instalable a la app (ver public/sw.js).
// Sólo en build de producción: en dev cachearía el shell de Vite y las
// recargas dejarían de traer los cambios.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sin service worker la app funciona igual, sólo pierde la instalación.
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
