import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import Numeros from '../Components/Numeros'
import { useContext } from 'react'
import { NumerosContext } from '../context/NumerosContext'
import Loading from '../Components/Loading'
import TerritoriosPersonales from '../Components/TerritoriosPersonales'
import { Link } from 'react-router-dom'



const CampanasBanners = () => {
  const [campanas, setCampanas] = useState([]);
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        const response = await fetch(`${api}/campanas/traer`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          // Filtrar solo las que están activas o próximas, y que preferentemente tengan imagen
          const banners = data.filter(c => c.estado === 'Activa' || c.estado === 'Próxima');
          setCampanas(banners);
        }
      } catch (error) {
        console.error("Error cargando campañas en inicio", error);
      }
    };
    fetchCampanas();
  }, [api]);

  if (campanas.length === 0) return null;

  return (
    <div className="mb-5">
      {campanas.map((campana, index) => (
        <div key={campana.id} className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          {campana.imagen ? (
            <img src={campana.imagen} alt={campana.titulo} className="img-fluid w-100" style={{ maxHeight: '300px', objectFit: 'cover' }} />
          ) : (
            <div className="bg-primary bg-gradient p-4 text-white text-center">
              <i className="bi bi-megaphone-fill display-4 mb-2 d-block"></i>
              <h3 className="fw-bold m-0">{campana.titulo}</h3>
            </div>
          )}
          {/* Opcional: mostrar título o fecha si se desea, aunque si es una imagen diseñada puede que no haga falta */}
          <div className="p-3 bg-white d-flex justify-content-between align-items-center">
            <h5 className="m-0 fw-bold text-primary">{campana.titulo}</h5>
            <span className={`badge ${campana.estado === 'Activa' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill`}>
              {campana.estado}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const {numero,numeros,error,loading,setNumero, isAuthenticated} = useContext(NumerosContext)
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <>
      <Header></Header>
      <main className="min-vh-100 bg-body-tertiary pb-5">
        {!isAuthenticated ? (
            <div className="container py-5 mt-5 text-center">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h1 className="display-4 fw-bold text-primary mb-4">Bienvenido a CRM Panel</h1>
                        <p className="lead text-secondary mb-5">
                            La herramienta definitiva para gestionar tus contactos y campañas telefónicas. 
                            Inicia sesión para acceder a los números asignados y comenzar a realizar llamadas.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg px-5 rounded-pill shadow">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        ) : activeTab === 'dashboard' ? (
            <div className="container py-5" style={{ maxWidth: '900px' }}>
                <div className="mb-4">
                    <p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                        BIENVENIDO A COLEGIALES CRM
                    </p>
                    <h1 className="fw-bold" style={{ color: '#1e293b', fontSize: '2.5rem' }}>
                        ¡Hola, {localStorage.getItem('usuario') || 'Usuario'}!
                    </h1>
                </div>

                {/* Banner de Campañas Activas */}
                <CampanasBanners />

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

                    {/* Botón Llamados Telefónicos */}
                    <div className="col-12 col-md-6">
                        <button 
                            onClick={() => setActiveTab('llamar')}
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-telephone-fill me-3 fs-4"></i>
                                Llamados Telefónicos
                            </div>
                            <i className="bi bi-chevron-right fs-5 fw-bold"></i>
                        </button>
                    </div>

                    {/* Botón Territorios Personales */}
                    <div className="col-12 col-md-6">
                        <button 
                            onClick={() => setActiveTab('territorios')}
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
                        </button>
                    </div>

                    {/* Botón Experiencias */}
                    <div className="col-12 col-md-6">
                        <Link 
                            to="/experiencias" 
                            className="btn w-100 text-start shadow-sm d-flex justify-content-between align-items-center text-decoration-none"
                            style={{ backgroundColor: '#4b6cb7', color: 'white', borderRadius: '12px', padding: '24px 20px', border: 'none', transition: 'transform 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="d-flex align-items-center fw-bold fs-5">
                                <i className="bi bi-book-fill me-3 fs-4"></i>
                                Experiencias
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
        ) : (
            <div className="container py-4">
                <div className="mb-4">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="btn btn-outline-secondary rounded-pill shadow-sm px-4 fw-semibold d-inline-flex align-items-center"
                    >
                        <i className="bi bi-arrow-left me-2"></i> Volver al Inicio
                    </button>
                </div>
                {activeTab === 'llamar' ? (
                    <>
                        <div className="text-center mb-4">
                            <h3 className="fw-semibold text-secondary">Número a llamar:</h3>
                        </div>
                        {loading ? <Loading /> : <Numeros setNumero={setNumero} />}
                    </>
                ) : (
                    <TerritoriosPersonales />
                )}
            </div>
        )}
      </main>
    </>
  )
}

export default Home
