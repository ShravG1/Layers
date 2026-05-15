import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { restoreIfEmpty, startAutoSync } from './utils/cloudSync.js'

async function boot() {
  // On a fresh install, pull the cloud backup before first render so the
  // app comes up already populated with the user's data.
  await restoreIfEmpty()
  startAutoSync()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot()
