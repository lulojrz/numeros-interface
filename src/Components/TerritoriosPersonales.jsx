import React, { useContext, useState } from 'react';
import MisReservas from './MisReservas';
import { NumerosContext } from '../context/NumerosContext';

const TerritoriosPersonales = () => {
    const { numeros } = useContext(NumerosContext);
    const loggedInUsername = localStorage.getItem('usuario');
    const [mostrarMapa, setMostrarMapa] = useState(false);

    const misReservas = numeros.filter(n => n.reservado === true && n.reservadoA?.usuario === loggedInUsername);
    const tieneReservas = misReservas.length > 0;

    let fechaAsignacion = null;
    let diasRestantes = 0;
    let progreso = 0;
    let colorProgreso = 'bg-success';
    const DIAS_TOTALES = 90; // Aprox 3 meses

    if (tieneReservas) {
        // Encontrar la fecha de reserva más antigua (fecha de asignación del territorio)
        const fechasValidas = misReservas
            .map(n => n.fechaReserva)
            .filter(f => f != null)
            .map(f => new Date(f).getTime());
        
        if (fechasValidas.length > 0) {
            const fechaMinima = Math.min(...fechasValidas);
            fechaAsignacion = new Date(fechaMinima);
            
            // Calcular fecha límite sumando los días totales
            const fechaLimite = new Date(fechaAsignacion.getTime() + (DIAS_TOTALES * 24 * 60 * 60 * 1000));
            
            const hoy = new Date();
            const diferenciaMs = fechaLimite.getTime() - hoy.getTime();
            diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) diasRestantes = 0;
            
            progreso = ((DIAS_TOTALES - diasRestantes) / DIAS_TOTALES) * 100;
            if (progreso > 100) progreso = 100;
            
            if (diasRestantes <= 15) {
                colorProgreso = 'bg-danger';
            } else if (diasRestantes <= 30) {
                colorProgreso = 'bg-warning';
            }
        }
    }

    const enviarMensaje = (e) => {
        e.preventDefault();
        const especificacion = e.target.querySelector('input[type="text"]').value;
        const mensaje = encodeURIComponent(`Hola! Me gustaria pedir un territorio personal en la zona de ${especificacion}`);
        const url = `https://api.whatsapp.com/send?phone=5491151030168&text=${mensaje}`;
        window.open(url, '_blank');
    }

    return (
        <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '1rem' }}>
            {tieneReservas ? (
                <div className="mt-2">
                    {fechaAsignacion && (
                        <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: '0.75rem', backgroundColor: '#f8f9fa' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title text-primary fw-bold mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Progreso del Territorio
                                    </h5>
                                    <span className={`badge ${diasRestantes <= 15 ? 'bg-danger' : diasRestantes <= 30 ? 'bg-warning text-dark' : 'bg-success'} fs-6 px-3 py-2 shadow-sm rounded-pill`}>
                                        {diasRestantes} días restantes
                                    </span>
                                </div>
                                
                                <div className="progress mb-3 shadow-sm" style={{ height: '1.5rem', borderRadius: '1rem', backgroundColor: '#e9ecef' }}>
                                    <div 
                                        className={`progress-bar progress-bar-striped progress-bar-animated ${colorProgreso}`} 
                                        role="progressbar" 
                                        style={{ width: `${progreso}%` }} 
                                        aria-valuenow={progreso} 
                                        aria-valuemin="0" 
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                                
                                <div className="d-flex justify-content-between text-muted small fw-semibold px-1">
                                    <span>
                                        <i className="bi bi-calendar-check me-1 text-primary"></i>
                                        Asignado: {fechaAsignacion.toLocaleDateString()}
                                    </span>
                                    <span>
                                        <i className="bi bi-calendar-x me-1 text-danger"></i>
                                        Vence: {new Date(fechaAsignacion.getTime() + (DIAS_TOTALES * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <MisReservas hideEmpty={false} />
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '3rem' }}></i>
                        <h3 className="text-primary mt-2">Territorios Personales</h3>
                    </div>
                    
                    <div className="alert alert-primary shadow-sm mb-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '0.75rem' }}>
                        <h5 className="alert-heading fw-bold"><i className="bi bi-info-circle me-2"></i>¿Cómo funciona?</h5>
                        <p className="mb-0">
                            Los territorios personales son zonas de llamadas que se te asignan de forma exclusiva para que las trabajes durante un tiempo.
                            Al solicitar un territorio, los números correspondientes a esa zona quedarán reservados a tu nombre y ningún otro usuario podrá verlos o llamarlos.
                            Una vez que hayas terminado de realizar los llamados en esa área, deberás "devolver" el territorio para que quede disponible nuevamente en el sistema.
                        </p>
                    </div>

                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                        <form onSubmit={enviarMensaje} className="p-3 bg-white border rounded-3 shadow-sm">
                            <label htmlFor="territorio" className="form-label fw-semibold text-secondary mb-3">
                                <i className="bi bi-whatsapp text-success me-2"></i>
                                Solicita tu territorio por WhatsApp:
                            </label>
                            
                            <div className="input-group input-group-lg mb-2">
                                <span className="input-group-text bg-light text-secondary">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Ej: Cabildo al 2000, cerca del Parque..." 
                                    required
                                />
                                <button className="btn btn-success fw-semibold px-4" type="submit">
                                    Enviar
                                </button>
                            </div>
                            <div className="form-text text-muted small text-center mt-2">
                                Serás redirigido a WhatsApp para enviar tu solicitud al administrador.
                            </div>
                        </form>
                    </div>

                    <div className="mt-4 mx-auto text-center">
                        <button 
                            className="btn btn-outline-primary mb-3 fw-semibold"
                            onClick={() => setMostrarMapa(true)}
                        >
                            <i className="bi bi-map me-2"></i>
                            Ver mapa de zonas
                        </button>
                        
                        {mostrarMapa && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                zIndex: 9999,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1rem'
                            }}>
                                <div className="shadow-lg" style={{ 
                                    width: '100%', 
                                    maxWidth: '1200px', 
                                    height: '90vh', 
                                    backgroundColor: 'white', 
                                    borderRadius: '1rem', 
                                    overflow: 'hidden', 
                                    display: 'flex', 
                                    flexDirection: 'column' 
                                }}>
                                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                                        <h5 className="m-0 fw-bold text-primary">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            Mapa de Territorios
                                        </h5>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setMostrarMapa(false)} 
                                            aria-label="Cerrar"
                                        ></button>
                                    </div>
                                    <div className="flex-grow-1 position-relative">
                                        <iframe 
                                            src="https://www.google.com/maps/d/embed?mid=1Q2YLge2FsHV1aUYzNV4fzLL8MHNwV2Y&ehbc=2E312F" 
                                            title="Mapa de territorios"
                                            style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TerritoriosPersonales;
