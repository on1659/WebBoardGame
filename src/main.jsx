import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './profile/UserContext'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
