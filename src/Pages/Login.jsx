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
              {/* Círculo exterior completamente cerrado */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="#76989d" strokeWidth="4" />

              {/* Sombra o Umbral en el piso (Aparece cuando la puerta se abre hacia afuera) */}
              <polygon points="70,144 50,153 130,144" fill="#76989d" style={{
                transition: 'opacity 2s',
                opacity: isDoorOpening ? 1 : 0
              }} />

              {/* Marco de la puerta (En forma de L invertida, como en la nueva imagen) */}
              {/* Poste izquierdo */}
              <rect x="70" y="45" width="10" height="100" fill="#76989d" />
              {/* Viga superior */}
              <rect x="70" y="45" width="60" height="10" fill="#76989d" />

              {/* Texto JW centrado en el hueco de la puerta */}
              <text x="105" y="110" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="32" fill="#76989d" fontWeight="700"
                style={{
                  transition: 'text-shadow 2s ease-in-out',
                  textShadow: isDoorOpening ? '0 0 10px rgba(118,152,157,0.6)' : 'none'
                }}
              >JW</text>

              {/* Puerta animada (Bisagra en x=130) */}
              {/* Se abre hacia AFUERA (rotateY negativo) para coincidir con la perspectiva de la imagen */}
              <g style={{ 
                transformOrigin: '130px 55px', 
                transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDoorOpening ? 'perspective(600px) rotateY(-65deg)' : 'perspective(600px) rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}>
                  {/* Rectángulo de la puerta */}
                  <rect x="79" y="55" width="51" height="90" fill={isDoorOpening ? "#6b8e93" : "#76989d"} style={{ transition: 'fill 2s' }} />
                  {/* Pomo de la puerta */}
                  <circle cx="86" cy="100" r="3.5" fill="#fff" />
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
