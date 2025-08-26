import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initParallax } from './utils/parallax'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// start parallax
if (typeof window !== 'undefined') {
  initParallax()
}
