import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS computes 100vh/100dvh inconsistently in Safari vs standalone. Drive the
// app height from the real measured viewport instead and keep it in sync.
function setAppHeight() {
  const h = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-h', `${Math.round(h)}px`)
}
setAppHeight()
window.addEventListener('resize', setAppHeight)
window.addEventListener('orientationchange', setAppHeight)
window.visualViewport?.addEventListener('resize', setAppHeight)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
