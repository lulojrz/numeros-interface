import React from 'react'
import { Link } from 'react-router'
import Login from '../Pages/Login'

const Header = () => {
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

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">

                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to={'/login'}>
                        <button className="btn btn-outline-primary px-4 fw-semibold">Iniciar Sesión</button>
                    </Link>
                </li>
              
            </ul>

        </div>
    </div>
</nav>
    </>
  )
}

export default Header