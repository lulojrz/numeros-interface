import React from 'react'
import { NumerosContext } from '../context/NumerosContext'
import { useContext } from 'react'
import {AuthContext}  from '../context/AuthContext'

const Login = () => {

  const {user, setUser, password, setPassword, errors, setErrors, handleSubmit, isLoading, isDoorOpening} = useContext(AuthContext)

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f4f7f6', overflow: isDoorOpening ? 'hidden' : 'auto' }}>
      
      {/* ANIMACIÓN DE PUERTA */}
      {isDoorOpening && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, perspective: '2000px', pointerEvents: 'none',
          display: 'flex', backgroundColor: '#f4f7f6'
        }}>
          {/* Panel Izquierdo (Fijo o Bisagra) */}
          <div style={{
            width: '100%', height: '100%',
            backgroundColor: '#76989d', // Color del logo aprox
            transformOrigin: 'left center',
            animation: 'abrirPuerta 1.5s forwards ease-in-out',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: 'inset -10px 0 30px rgba(0,0,0,0.2)'
          }}>
            {/* Aquí puedes cambiar logo.jpg por el nombre real de la imagen que guardaste */}
            <div style={{
              backgroundColor: 'white', padding: '2rem', borderRadius: '50%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
               <img src="/src/assets/logo.jpg" alt="Logo JW" style={{width: '150px', height: '150px', objectFit: 'contain', borderRadius: '50%'}} onError={(e) => e.target.style.display = 'none'} />
               {/* Si la imagen no se llama logo.jpg, el texto de abajo se mostrará como respaldo */}
               <h1 className="fw-bold m-0" style={{color: '#76989d', textAlign: 'center'}}>JW</h1>
            </div>
          </div>
          
          <style>
            {`
              @keyframes abrirPuerta {
                0% { transform: rotateY(0deg); opacity: 1; }
                70% { transform: rotateY(-110deg); opacity: 1; }
                100% { transform: rotateY(-110deg); opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

      <div className="card shadow-lg p-5" style={{ width: '100%', maxWidth: '420px', borderRadius: '1rem', border: 'none' }}>
        <div className="text-center mb-4">
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