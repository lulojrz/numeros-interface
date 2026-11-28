import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { NumerosProvider } from './context/NumerosContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css'
import App from './App.jsx'

const originalFetch = window.fetch.bind(window);
const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const esPeticionBackend = apiBaseUrl && url.startsWith(apiBaseUrl);

  if (esPeticionBackend) {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await originalFetch(input, { ...init, headers });

    if (response.status === 401 && !url.endsWith('/usuarios/login')) {
      ['token', 'isAuth', 'usuario', 'usuarioId', 'privilegio', 'asignacion', 'habilitacionPublica', 'conductor']
        .forEach(key => localStorage.removeItem(key));
    }

    return response;
  }

  return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NumerosProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NumerosProvider>
    </BrowserRouter>
  </StrictMode>
)