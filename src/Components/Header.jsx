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
                CRM Panel
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
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                    {isAuthenticated ? (
                        <>
                            <li className="nav-item me-3">
                                <Link className="nav-link fw-semibold text-dark" to={'/admin'}>
                                    Administración
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-outline-danger px-4 fw-semibold" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to={'/login'}>
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