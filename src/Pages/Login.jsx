import React from 'react'
import { useContext } from 'react'
import {AuthContext}  from '../context/AuthContext'
import '../App.css'

const Login = () => {

  const {user, setUser, password, setPassword, errors, setErrors, handleSubmit, isLoading, isDoorOpening} = useContext(AuthContext)

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      
      <div className="card shadow-lg p-5" style={{ width: '100%', maxWidth: '420px', borderRadius: '1rem', border: 'none' }}>
        <div className="text-center mb-4">
          {/* Logo SVG Animado */}
          <div className="mb-3 d-flex justify-content-center">
            <svg viewBox="0 0 200 200" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
              {/* Círculo exterior (Simétrico y centrado) */}
              <path d="M 70 179.5 A 85 85 0 1 1 130 179.5" fill="none" stroke="#76989d" strokeWidth="4" strokeLinecap="round" />
              
              {/* Camino (Efecto de carretera con perspectiva que se ensancha abajo) */}
              <path d="M 65 185 Q 130 160 100 118 Q 80 150 50 178 Z" fill="#76989d" />

              {/* Marco de la puerta (Perfectamente centrado en X=100) */}
              <polyline points="75,118 75,60 125,60" fill="none" stroke="#76989d" strokeWidth="4" strokeLinecap="square"/>

              {/* Texto JW perfectamente centrado */}
              <text x="100" y="98" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="24" fill="#76989d" fontWeight="700"
                style={{
                  transition: 'text-shadow 2s ease-in-out',
                  textShadow: isDoorOpening ? '0 0 10px rgba(118,152,157,0.6)' : 'none'
                }}
              >JW</text>

              {/* Puerta animada (Bisagra en el poste derecho x=125) */}
              <g style={{ 
                transformOrigin: '125px 60px', 
                transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDoorOpening ? 'perspective(600px) rotateY(105deg)' : 'perspective(600px) rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}>
                  {/* Rectángulo de la puerta (Ligeramente más grande para tapar bien el marco y el texto) */}
                  <rect x="73" y="58" width="52" height="61" fill={isDoorOpening ? "#5a7a7e" : "#76989d"} style={{ transition: 'fill 2s' }} />
                  {/* Pomo de la puerta (A la izquierda) */}
                  <circle cx="82" cy="92" r="2.5" fill="#fff" style={{
                    transition: 'opacity 2s',
                    opacity: isDoorOpening ? 0.2 : 1
                  }}/>
              </g>
            </svg>
          </div>

          <h2 className="fw-bold" style={{ color: '#334155' }}>Bienvenido</h2>
          <p className="text-muted">Por favor, inicia sesión para continuar</p>
        </div>


        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="user" className="form-label fw-semibold" style={{ color: '#475569' }}>
              Usuario
            </label>
            <input
              id="user"
              type="text"
              className={`form-control form-control-lg ${errors.user ? 'is-invalid' : ''}`}
              placeholder="Ingresar Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.75rem' }}
            />
            {errors.user && (
              <div className="invalid-feedback fw-medium">
                {errors.user}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="formBasicPassword" className="form-label fw-semibold" style={{ color: '#475569' }}>
              Contraseña
            </label>
            <input
              id="formBasicPassword"
              type="password"
              className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Ingresar Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.75rem' }}
            />
            {errors.password && (
              <div className="invalid-feedback fw-medium">
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
            style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#007bff', borderColor: '#007bff', transition: 'all 0.2s ease-in-out' }}
            onMouseOver={(e) => { if (!isLoading) { e.target.style.backgroundColor = '#0056b3'; e.target.style.borderColor = '#0056b3'; } }}
            onMouseOut={(e) => { if (!isLoading) { e.target.style.backgroundColor = '#007bff'; e.target.style.borderColor = '#007bff'; } }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cargando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
