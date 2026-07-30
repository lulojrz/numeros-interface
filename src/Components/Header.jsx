import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NumerosContext } from '../context/NumerosContext'

const Header = () => {
  const { isAuthenticated, setIsAuth, theme, setTheme } = useContext(NumerosContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    navigate('/');
  };

  const [usuarios, setUsuarios] = useState([]);
  const [showContacto, setShowContacto] = useState(false);

  useEffect(() => {
    if (showContacto && usuarios.length === 0) {
      const fetchUsuarios = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setUsuarios(data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchUsuarios();
    }
  }, [showContacto]);

  const contactosServicio = usuarios.filter(u => {
    const asig = (u.asignacion || '').trim().toLowerCase();
    return asig === 'servicio' || asig === 'territorios' || asig === 'servicio y territorios';
  });
  
  const contactosTelefonica = usuarios.filter(u => {
    const asig = (u.asignacion || '').trim().toLowerCase();
    return asig === 'territorios telefonicos/personales' || asig === 'territorios telefónicos/personales' || asig === 'territorios telefonicos' || asig === 'personales' || asig === 'territorios personales';
  });

  const contactosPublica = usuarios.filter(u => {
    const asig = (u.asignacion || '').trim().toLowerCase();
    return asig === 'publica' || asig === 'pública';
  });

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
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
                                    <span className="badge bg-primary text-white rounded-pill px-3 py-2">
                                        <i className="bi bi-person-badge me-1"></i>
                                        {localStorage.getItem('usuario')} [{localStorage.getItem('privilegio') || '...'}]
                                    </span>
                                </li>
                            )}
                            <li className="nav-item mb-2 mb-lg-0 me-lg-2">
                                <Link className="nav-link fw-semibold text-body" to={'/experiencias'}>
                                    Experiencias
                                </Link>
                            </li>
                            <li className="nav-item mb-2 mb-lg-0 me-lg-2">
                                <Link className="nav-link fw-semibold text-body" to={'/predicacion'}>
                                    Predicación
                                </Link>
                            </li>
                            <li className="nav-item mb-4 mb-lg-0 me-lg-3">
                                <Link className="nav-link fw-semibold text-body" to={'/admin'}>
                                    Administración
                                </Link>
                            </li>
                            <li className="nav-item mb-2 mb-lg-0 me-lg-2">
                                <button className="btn btn-outline-info px-3 fw-semibold" onClick={() => setShowContacto(true)}>
                                    <i className="bi bi-person-lines-fill me-1"></i>Contacto
                                </button>
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
                    <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                        <button 
                            className="btn btn-sm btn-outline-secondary rounded-circle" 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        >
                            {theme === 'dark' ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
                        </button>
                    </li>
                </ul>
            </div>
        </div>
      </nav>

      {/* Modal de Contacto */}
      {showContacto && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-info bg-opacity-10 border-bottom-0">
                <h5 className="modal-title fw-bold text-info-emphasis">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Directorio de Contacto
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowContacto(false)}></button>
              </div>
              <div className="modal-body px-4">
                <p className="text-muted mb-4">¿Tienes alguna consulta? Comunícate con los encargados correspondientes según el área:</p>
                
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">Administración (Servicio y Territorios)</h6>
                  {contactosServicio.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {contactosServicio.map((c, i) => (
                        <li key={i} className="mb-1"><i className="bi bi-person-fill me-2 text-primary"></i>{c.nombre} {c.apellido}</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted fst-italic">No hay encargados registrados.</span>}
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">Predicación Pública</h6>
                  {contactosPublica.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {contactosPublica.map((c, i) => (
                        <li key={i} className="mb-1"><i className="bi bi-person-fill me-2 text-success"></i>{c.nombre} {c.apellido}</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted fst-italic">No hay encargados registrados.</span>}
                </div>

                <div className="mb-2">
                  <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">Territorios Telefónicos / Personales</h6>
                  {contactosTelefonica.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {contactosTelefonica.map((c, i) => (
                        <li key={i} className="mb-1"><i className="bi bi-person-fill me-2 text-info"></i>{c.nombre} {c.apellido}</li>
                      ))}
                    </ul>
                  ) : <span className="text-muted fst-italic">No hay encargados registrados.</span>}
                </div>

                <div className="mb-2">
                  <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">Soporte Técnico de la App</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-1"><i className="bi bi-gear-fill me-2 text-warning"></i>Luca Jerez</li>
                  </ul>
                </div>

              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowContacto(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
