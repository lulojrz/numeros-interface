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
              {/* Círculo exterior roto abajo */}
              <path d="M 70 174 A 85 85 0 1 1 120 182" fill="none" stroke="#76989d" strokeWidth="3" strokeLinecap="round" />
              
              {/* Camino ondulado */}
              <path d="M 68 156 C 130 145, 60 130, 105 118" fill="none" stroke="#76989d" strokeWidth="12" strokeLinecap="round"/>

              {/* Marco de la puerta */}
              <polyline points="80,118 80,65 120,65" fill="none" stroke="#76989d" strokeWidth="4" strokeLinecap="square"/>

              {/* Texto JW oculto detrás de la puerta */}
              <text x="84" y="102" fontFamily="'Inter', sans-serif" fontSize="24" fill="#76989d" fontWeight="600"
                style={{
                  transition: 'text-shadow 2s ease-in-out',
                  textShadow: isDoorOpening ? '0 0 10px rgba(118,152,157,0.5)' : 'none'
                }}
              >JW</text>

              {/* Puerta animada (Bisagra en x=120) */}
              <g style={{ 
                transformOrigin: '120px 65px', 
                transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDoorOpening ? 'perspective(600px) rotateY(105deg)' : 'perspective(600px) rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}>
                  {/* El rectángulo de la puerta cambia ligeramente a un tono más oscuro para simular sombra al abrirse */}
                  <rect x="79" y="64.5" width="41.5" height="54" fill={isDoorOpening ? "#5a7a7e" : "#76989d"} style={{ transition: 'fill 2s' }} />
                  {/* Pomo de la puerta */}
                  <circle cx="86" cy="95" r="2.5" fill="#fff" style={{
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
