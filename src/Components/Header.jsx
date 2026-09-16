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
      <nav className="navbar navbar-expand-lg bg-white shadow-sm mx-auto mt-3 px-2 border-0" style={{ maxWidth: '900px', borderRadius: '1rem' }}>
        <div className="container-fluid px-4"> 
            <Link className="navbar-brand fw-bold text-primary d-lg-none" to={'/'} style={{ letterSpacing: '-0.5px' }}>
                CRM
            </Link>

            <button
                className="navbar-toggler border-0 shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center text-center mt-3 mt-lg-0 gap-lg-4">
                    {isAuthenticated ? (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold text-secondary d-flex align-items-center justify-content-center gap-2" to={'/'}>
                                    <i className="bi bi-house text-primary"></i> Inicio
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold text-secondary d-flex align-items-center justify-content-center gap-2" to={'/predicacion'}>
                                    <i className="bi bi-calendar3 text-primary"></i> Turnos
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link fw-semibold text-secondary d-flex align-items-center justify-content-center gap-2" to={'/campanas'}>
                                    <i className="bi bi-megaphone-fill text-primary"></i> Campañas
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link fw-semibold text-secondary d-flex align-items-center justify-content-center gap-2 border-0 bg-transparent w-100" onClick={() => setShowContacto(true)}>
                                    <i className="bi bi-bell text-primary"></i> Notificaciones
                                </button>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link fw-semibold text-secondary d-flex align-items-center justify-content-center gap-2 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-person text-primary"></i> Perfil
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3 mt-2">
                                    <li><Link className="dropdown-item fw-medium py-2" to={'/admin/perfil'}><i className="bi bi-person-badge me-2 text-primary"></i>Mi Perfil</Link></li>
                                    <li><Link className="dropdown-item fw-medium py-2" to={'/admin'}><i className="bi bi-gear-fill me-2 text-primary"></i>Administración</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item fw-medium py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</button></li>
                                </ul>
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
