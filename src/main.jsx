import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LogtoProvider } from '@logto/react'
import { HelmetProvider } from 'react-helmet-async'
import { logtoConfig } from './config/logto'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <LogtoProvider config={logtoConfig}>
        <App />
      </LogtoProvider>
    </HelmetProvider>
  </StrictMode>,
)
