import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemedApp from './ThemedApp'
import '@fontsource-variable/lora'
import '@fontsource-variable/caveat'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
)