import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import WrappedApp from './WrappedApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WrappedApp />
  </StrictMode>,
)
