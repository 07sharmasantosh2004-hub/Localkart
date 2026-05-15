import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { LocationProvider } from './context/LocationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
