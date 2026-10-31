import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemedApp from './ThemedApp'
import '@fontsource-variable/lora'
import 'leaflet/dist/leaflet.css'
import 'flag-icons/css/flag-icons.min.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
)