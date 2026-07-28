import React, { useContext, useState } from 'react';
import MisReservas from './MisReservas';
import { NumerosContext } from '../context/NumerosContext';

const TerritoriosPersonales = () => {
    const { numeros } = useContext(NumerosContext);
    const loggedInUsername = localStorage.getItem('usuario');
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);
    const [tabActiva, setTabActiva] = useState('telefonica');

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
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <h5 className="card-title text-primary fw-bold mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Progreso del Territorio
                                    </h5>
                                    <div>
                                        <button 
                                            className="btn btn-outline-primary btn-sm rounded-pill me-2 fw-semibold shadow-sm"
                                            onClick={() => setMostrarModalAyuda(true)}
                                        >
                                            <i className="bi bi-question-circle me-1"></i>
                                            ¿Cómo trabajarlo?
                                        </button>
                                        <span className={`badge ${diasRestantes <= 15 ? 'bg-danger' : diasRestantes <= 30 ? 'bg-warning text-body' : 'bg-success'} fs-6 px-3 py-2 shadow-sm rounded-pill`}>
                                            {diasRestantes} días restantes
                                        </span>
                                    </div>
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
                        <form onSubmit={enviarMensaje} className="p-3 bg-body border rounded-3 shadow-sm">
                            <label htmlFor="territorio" className="form-label fw-semibold text-secondary mb-3">
                                <i className="bi bi-whatsapp text-success me-2"></i>
                                Solicita tu territorio por WhatsApp:
                            </label>
                            
                            <div className="input-group input-group-lg mb-2">
                                <span className="input-group-text bg-body-tertiary text-secondary">
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
                                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-body-tertiary">
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

            {mostrarModalAyuda && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '600px', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-lightbulb me-2"></i>Formas de predicar</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalAyuda(false)}></button>
                        </div>
                        <div className="card-body p-0">
                            <ul className="nav nav-tabs nav-fill bg-light pt-2" style={{ borderBottom: '2px solid #dee2e6' }}>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'telefonica' ? 'active text-primary' : 'text-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'telefonica' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('telefonica')}>
                                        <i className="bi bi-telephone-fill me-2"></i>Telefónica
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'cartas' ? 'active text-primary' : 'text-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'cartas' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('cartas')}>
                                        <i className="bi bi-envelope-paper-fill me-2"></i>Cartas
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'publica' ? 'active text-primary' : 'text-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'publica' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('publica')}>
                                        <i className="bi bi-signpost-split-fill me-2"></i>Pública
                                    </button>
                                </li>
                            </ul>
                            
                            <div className="p-4 bg-white" style={{ minHeight: '200px' }}>
                                {tabActiva === 'telefonica' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación Telefónica</h6>
                                        <p className="text-muted">Utiliza la lista de números que aparece abajo en <strong>"Mis Reservas"</strong>. Tienes los números telefónicos exclusivos de tu territorio.</p>
                                        <ul className="text-muted small">
                                            <li>Al llamar, anota si la persona contesta o no usando el botón correspondiente.</li>
                                            <li>Puedes dejar una nota en el número si la persona pidió que no la llamen más.</li>
                                            <li>Recuerda ser amable y breve en tu presentación.</li>
                                        </ul>
                                    </div>
                                )}
                                {tabActiva === 'cartas' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación por Cartas</h6>
                                        <p className="text-muted">Junto a los números telefónicos, también puedes ver la <strong>dirección y edificio</strong>.</p>
                                        <ul className="text-muted small mb-0">
                                            <li>Usa estas direcciones postales para enviar cartas a los vecinos de tu territorio.</li>
                                            <li>Es ideal para aquellos números que nunca contestan o donde es difícil encontrar gente en casa.</li>
                                            <li>Recuerda incluir un folleto o tratado y usar remitentes adecuados.</li>
                                        </ul>
                                    </div>
                                )}
                                {tabActiva === 'publica' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación Pública (Carritos/Banners)</h6>
                                        <p className="text-muted">Si las condiciones lo permiten, puedes organizar la predicación pública dentro de los límites de tu territorio.</p>
                                        <ul className="text-muted small mb-0">
                                            <li>Ponte de acuerdo con tu grupo para ubicar un exhibidor portátil (carrito) en una zona transitada de este territorio.</li>
                                            <li>Asegúrate de no superponerte con territorios de otros grupos.</li>
                                            <li>Es una excelente manera de abordar a las personas de esta zona de forma directa.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card-footer bg-light text-end p-3">
                            <button className="btn btn-secondary px-4 shadow-sm" onClick={() => setMostrarModalAyuda(false)}>Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TerritoriosPersonales;
