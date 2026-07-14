import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NumerosContext } from '../context/NumerosContext'

const Header = () => {
  const { isAuthenticated, setIsAuth } = useContext(NumerosContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container-fluid px-4"> 
            <Link className="navbar-brand fw-bold text-primary" to={'/'} style={{ letterSpacing: '-0.5px' }}>
                Colegiales CRM
            </Link>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center text-center text-lg-start mt-3 mt-lg-0">
                    {isAuthenticated ? (
                        <>
                            {localStorage.getItem('usuario') && (
                                <li className="nav-item mb-3 mb-lg-0 me-lg-3">
                                    <span className="badge bg-info text-dark rounded-pill px-3 py-2">
                                        <i className="bi bi-person-badge me-1"></i>
                                        {localStorage.getItem('usuario')} [{localStorage.getItem('privilegio') || '...'}]
                                    </span>
                                </li>
                            )}
                            <li className="nav-item mb-2 mb-lg-0 me-lg-2">
                                <Link className="nav-link fw-semibold text-dark" to={'/experiencias'}>
                                    Experiencias
                                </Link>
                            </li>
                            <li className="nav-item mb-2 mb-lg-0 me-lg-2">
                                <Link className="nav-link fw-semibold text-dark" to={'/predicacion'}>
                                    Predicación
                                </Link>
                            </li>
                            <li className="nav-item mb-4 mb-lg-0 me-lg-3">
                                <Link className="nav-link fw-semibold text-dark" to={'/admin'}>
                                    Administración
                                </Link>
                            </li>
                            <li className="nav-item mb-2 mb-lg-0">
                                <button className="btn btn-outline-danger px-4 fw-semibold" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item mb-2 mb-lg-0">
                            <Link className="nav-link active d-inline-block p-0" aria-current="page" to={'/login'}>
                                <button className="btn btn-outline-primary px-4 fw-semibold">Iniciar Sesión</button>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </div>
      </nav>
    </>
  )
}

export default Header