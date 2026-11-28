import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NumerosContext } from '../context/NumerosContext';
import Numeros from './Numeros';
import TerritoriosPersonales from './TerritoriosPersonales';
import Loading from './Loading';

const PredicacionTelefonica = ({ defaultTab = 'llamar' }) => {
    const location = useLocation();
    const { numeros, loading, setNumero } = useContext(NumerosContext);

    const [tabActiva, setTabActiva] = useState(() => {
        return location.state?.tab || location.state?.activeTab || defaultTab;
    });
    const [numeroSeleccionadoId, setNumeroSeleccionadoId] = useState(location.state?.numeroId || null);
    const [misReservasCount, setMisReservasCount] = useState(0);

    const loggedInUsername = localStorage.getItem('usuario');
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

    useEffect(() => {
        if (location.state?.tab) {
            setTabActiva(location.state.tab);
        } else if (location.state?.activeTab) {
            setTabActiva(location.state.activeTab === 'territorios' ? 'territorios' : 'llamar');
        }
        if (location.state?.numeroId) {
            setNumeroSeleccionadoId(location.state.numeroId);
            setTabActiva('llamar');
        }
    }, [location.state]);

    // Cargar únicamente el conteo de reservas personales del usuario actual
    useEffect(() => {
        if (!loggedInUsername) return;
        let activo = true;

        const cargarMisReservas = async () => {
            try {
                const res = await fetch(`${api}/api/numeros/mis-reservas?usuario=${encodeURIComponent(loggedInUsername)}`);
                if (activo && res.ok) {
                    const reservas = await res.json();
                    setMisReservasCount(Array.isArray(reservas) ? reservas.length : 0);
                }
            } catch (e) {
                console.error('Error al cargar mis reservas:', e);
            }
        };

        cargarMisReservas();
        return () => {
            activo = false;
        };
    }, [api, loggedInUsername, numeros]);

    return (
        <div className="container py-4" style={{ maxWidth: '950px' }}>
            {/* Header de la sección */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                <div className="d-flex align-items-center gap-3">
                    <Link
                        to="/"
                        className="btn btn-outline-secondary rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                        style={{ width: '42px', height: '42px', minWidth: '42px' }}
                        title="Volver al inicio"
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </Link>
                    <div>
                        <h2 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                            <i className="bi bi-telephone-fill text-primary"></i>
                            Predicación Telefónica
                        </h2>
                        <p className="text-body-secondary small mb-0">
                            Llamados telefónicos y gestión de territorios personales
                        </p>
                    </div>
                </div>
            </div>

            {/* Pestañas de Navegación */}
            <div className="mb-4">
                <ul className="nav nav-pills gap-2 p-1 bg-body rounded-pill border shadow-sm d-inline-flex flex-wrap">
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2 border-0 ${tabActiva === 'llamar' ? 'active shadow-sm' : 'text-body-secondary bg-transparent'}`}
                            onClick={() => setTabActiva('llamar')}
                        >
                            <i className="bi bi-telephone-outbound-fill"></i>
                            <span>Llamadas Telefónicas</span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2 border-0 ${tabActiva === 'territorios' ? 'active shadow-sm' : 'text-body-secondary bg-transparent'}`}
                            onClick={() => setTabActiva('territorios')}
                        >
                            <i className="bi bi-bookmark-star-fill"></i>
                            <span>Territorios Personales</span>
                            {misReservasCount > 0 && (
                                <span className={`badge rounded-pill ${tabActiva === 'territorios' ? 'bg-white text-primary' : 'bg-success text-white'}`}>
                                    {misReservasCount}
                                </span>
                            )}
                        </button>
                    </li>
                </ul>
            </div>

            {/* Contenido según la pestaña activa */}
            {tabActiva === 'llamar' ? (
                <div>
                    <div className="text-center mb-4">
                        <h4 className="fw-semibold text-body-secondary">Número a llamar:</h4>
                    </div>
                    {loading ? (
                        <Loading />
                    ) : (
                        <Numeros
                            setNumero={setNumero}
                            numeroSeleccionadoId={numeroSeleccionadoId}
                            onLimpiarSeleccionado={() => setNumeroSeleccionadoId(null)}
                        />
                    )}
                </div>
            ) : (
                <div>
                    <TerritoriosPersonales />
                </div>
            )}
        </div>
    );
};

export default PredicacionTelefonica;