import React, { useEffect, useState, useContext } from 'react'
import Header from '../Components/Header'
import { NumerosContext } from '../context/NumerosContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const estaHabilitado = (valor) => valor === true || valor === 'true' || valor === 1 || valor === '1';

const MisSalidasBanner = () => {
  const [misSalidas, setMisSalidas] = useState([]);
  const api = import.meta.env.VITE_API_URL;
  const usuarioId = localStorage.getItem('usuarioId');

  useEffect(() => {
    if (!usuarioId) return;
    const fetchSalidas = async () => {
      try {
        const res = await fetch(`${api}/salidas/traer`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const hoy = new Date().toISOString().split('T')[0];
          
          // Filtrar salidas del usuario logueado que sean desde hoy en adelante
          const salidasFuturas = data.filter(s => s.conductor?.id.toString() === usuarioId && s.fecha >= hoy)
                                     .sort((a,b) => a.fecha.localeCompare(b.fecha));
          
          // Mostrar solo la más próxima
          if (salidasFuturas.length > 0) {
            setMisSalidas([salidasFuturas[0]]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSalidas();
  }, [api, usuarioId]);

  if (misSalidas.length === 0) return null;
  const s = misSalidas[0];
  const d = new Date(s.fecha + 'T12:00:00');
  const diaStr = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' });
  const esHoy = s.fecha === new Date().toISOString().split('T')[0];

  return (
    <div className="alert alert-info border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center justify-content-between p-4" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
      <div>
        <h4 className="fw-bold mb-1">
          <i className="bi bi-bell-fill text-warning me-2"></i>
          {esHoy ? '¡Hoy tienes una salida programada!' : 'Próxima salida a tu cargo'}
        </h4>
        <p className="m-0 mb-2">Has sido asignado para conducir el grupo de predicación.</p>
        <div className="d-flex gap-3 flex-wrap">
          <span className="badge bg-body text-body border shadow-sm px-3 py-2"><i className="bi bi-calendar3 me-2 text-primary"></i>{diaStr} - {s.hora} hs</span>
          <span className="badge bg-body text-body border shadow-sm px-3 py-2"><i className="bi bi-geo-alt-fill me-2 text-danger"></i>{s.puntoEncuentro}</span>
          {s.territorio && (
            <Link 
              to="/edificios" 
              state={{ territorioId: s.territorio.id, territorioNumero: s.territorio.numero }} 
              className="badge bg-success text-white shadow-sm px-3 py-2 text-decoration-none"
            >
              <i className="bi bi-map-fill me-2"></i>Territorio {s.territorio.numero} <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { isAuthenticated, abrirBuscador } = useContext(NumerosContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [esConductor, setEsConductor] = useState(() => localStorage.getItem('conductor') === 'true');

  // Redireccionar si venía con estado previo apuntado a llamadas o territorios
  useEffect(() => {
    if (location.state?.activeTab === 'llamar' || location.state?.numeroId) {
      navigate('/telefonica', { state: location.state, replace: true });
    } else if (location.state?.activeTab === 'territorios') {
      navigate('/territorios-personales', { state: location.state, replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      setEsConductor(false);
      return () => { isMounted = false; };
    }
    setEsConductor(localStorage.getItem('conductor') === 'true');

    const cargarConductor = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Error al consultar el usuario: ${response.status}`);
        }

        const usuarioActual = await response.json();
        const conductorHabilitado = estaHabilitado(usuarioActual?.conductor);
        if (isMounted) {
          localStorage.setItem('conductor', String(conductorHabilitado));
          setEsConductor(conductorHabilitado);
        }
      } catch (error) {
        console.error('Error verificando si el usuario es conductor:', error);
      }
    };

    cargarConductor();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <main className="min-vh-100 bg-body-tertiary pb-5">
        {!isAuthenticated ? (
            <div className="container py-5 mt-5 text-center">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h1 className="display-4 fw-bold text-primary mb-4">Bienvenido a Colegiales Panel</h1>
                        <p className="lead text-body-secondary mb-5">
                            La herramienta definitiva para disfrutar de la predicación, en todas sus facetas. 
                            Inicia sesión para acceder. 
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg px-5 rounded-pill shadow">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        ) : (
            <div className="container py-5" style={{ maxWidth: '900px' }}>
                <div className="mb-4">
                    <h1 className="fw-bold text-body" style={{ fontSize: '2.5rem' }}>
                        ¡Hola, {localStorage.getItem('usuario') || 'Usuario'}!
                    </h1>
                </div>

                {/* Buscador Rápido en Inicio */}
                <div 
                    className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-body"
                    onClick={abrirBuscador}
                    style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.classList.add('shadow'); }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.classList.remove('shadow'); }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                            <i className="bi bi-search fs-5"></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold text-body mb-0 text-truncate">
                                Buscar calle, edificio o territorio...
                            </div>
                            <small className="text-body-secondary d-none d-sm-block">
                                Escribe una dirección para saltar directo a su portero o manzana
                            </small>
                        </div>
                        <span className="badge bg-body-tertiary text-body-secondary border px-2 py-1 d-none d-sm-inline">
                            Ctrl + K
                        </span>
                    </div>
                </div>

                {/* Banner de Salidas Propias (Si es conductor) */}
                <MisSalidasBanner />

                <div className="row g-3">
                    {/* Botón Predicación Pública (Turnos) */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/predicacion" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-calendar3 me-3 fs-4"></i>
                                Predicación Pública
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Predicación Edificios */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/edificios" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-building me-3 fs-4"></i>
                                Predicación Edificios
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Predicación Telefónica */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/telefonica" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-telephone-fill me-3 fs-4"></i>
                                Predicación Telefónica
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Programa de Salidas */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/programa" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-calendar-range me-3 fs-4"></i>
                                Programa de Salidas
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Mis Días de Salida (Disponibilidad) */}
                    {esConductor && (
                        <div className="col-12 col-md-6">
                            <Link 
                                to="/admin/disponibilidad" 
                                className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                                style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div className="d-flex align-items-center fw-bold fs-5">
                                    <i className="bi bi-clock-history me-3 fs-4"></i>
                                    Mis Días de Salida
                                </div>
                                <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                            </Link>
                        </div>
                    )}

                    {/* Botón Mis Revisitas */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/revisitas" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-star-fill text-warning me-3 fs-4"></i>
                                Mis Revisitas
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Territorios Personales */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/territorios-personales" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-map-fill me-3 fs-4"></i>
                                Territorios Personales
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>

                    {/* Botón Administración */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/admin" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-gear-fill me-3 fs-4"></i>
                                Administración
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </Link>
                    </div>
                </div>
            </div>
        )}
      </main>
    </>
  )
}

export default Home
