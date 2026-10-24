import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/600.css'
import '@fontsource/geist-mono/500.css'
import '@ds/styles/tokens.css'
import '@ds/styles/base.css'
import '@ds/styles/components.css'
import './landing.css'
import { Landing } from './Landing'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
