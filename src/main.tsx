
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './index.css'
import './print.css'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
