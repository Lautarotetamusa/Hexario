import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design-system/styles.css'
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
