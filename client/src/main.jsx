import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { wakeServer } from './api/wakeServer.js'

// Ping the Render backend immediately so it wakes from cold-start
// before the user submits the register/login form.
wakeServer();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
