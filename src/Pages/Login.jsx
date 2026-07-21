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
              
              {/* Camino (Curva S elegante con stroke) */}
              <path d="M 70 175 C 120 170, 80 135, 100 120" fill="none" stroke="#76989d" strokeWidth="10" strokeLinecap="round" />

              {/* Marco de la puerta (Más angosto y alto para mejor proporción) */}
              <polyline points="82,120 82,65 118,65" fill="none" stroke="#76989d" strokeWidth="4" strokeLinecap="square"/>

              {/* Texto JW centrado y ajustado al marco */}
              <text x="100" y="98" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="20" fill="#76989d" fontWeight="700"
                style={{
                  transition: 'text-shadow 2s ease-in-out',
                  textShadow: isDoorOpening ? '0 0 10px rgba(118,152,157,0.6)' : 'none'
                }}
              >JW</text>

              {/* Puerta animada (Bisagra en el poste derecho x=118) */}
              <g style={{ 
                transformOrigin: '118px 65px', 
                transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDoorOpening ? 'perspective(600px) rotateY(105deg)' : 'perspective(600px) rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}>
                  {/* Rectángulo de la puerta (Cubre exactamente el marco) */}
                  <rect x="80" y="63" width="40" height="59" fill={isDoorOpening ? "#5a7a7e" : "#76989d"} style={{ transition: 'fill 2s' }} />
                  {/* Pomo de la puerta */}
                  <circle cx="87" cy="94" r="2.5" fill="#fff" style={{
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
