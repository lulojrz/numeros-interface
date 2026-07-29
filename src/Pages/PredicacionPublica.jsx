import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Funciones de utilidad movidas fuera del componente para uso global
const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLunes = (fecha) => {
    const d = new Date(fecha);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    d.setDate(diff);
    return d;
};

const PredicacionPublica = () => {
    // Auth info
    const usuarioActual = localStorage.getItem('usuario');
    const privilegio = localStorage.getItem('privilegio');
    const asignacion = localStorage.getItem('asignacion');
    const puedeGenerarSemana = asignacion === 'publica' || asignacion === 'servicio y territorios';
    const api = import.meta.env.VITE_API_URL;

    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTurnoId, setLoadingTurnoId] = useState(null);
    
    const [fechaActual, setFechaActual] = useState(new Date());

    // Filtros y Pestañas
    const [diaActivo, setDiaActivo] = useState(formatearFecha(new Date()));
    const [filtroPunto, setFiltroPunto] = useState('todos');
    const [filtroHorario, setFiltroHorario] = useState('todos');
    const [soloDisponibles, setSoloDisponibles] = useState(false);

    // Generar los 7 días de la semana actual
    const diasSemanaActual = Array.from({ length: 7 }).map((_, i) => {
        const d = getLunes(fechaActual);
        d.setDate(d.getDate() + i);
        return d;
    });

    // Mantener la pestaña activa dentro de la semana visible
    useEffect(() => {
        const lunes = getLunes(fechaActual);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        
        // Creamos la fecha agregando la hora para evitar bugs de zona horaria
        const activo = new Date(diaActivo + "T12:00:00");
        if (activo < lunes || activo > domingo) {
            setDiaActivo(formatearFecha(lunes));
        }
    }, [fechaActual, diaActivo]);

    const fetchTurnos = async (fecha) => {
        setLoading(true);
        try {
            const fechaStr = formatearFecha(fecha);
            const response = await fetch(`${api}/api/turnos/semana?fecha=${fechaStr}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setTurnos(data);
            } else {
                Swal.fire('Error', 'No se pudieron cargar los turnos de la semana.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema de conexión al cargar los turnos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTurnosSilencioso = async (fecha) => {
        try {
            const fechaStr = formatearFecha(fecha);
            const response = await fetch(`${api}/api/turnos/semana?fecha=${fechaStr}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setTurnos(data);
            }
        } catch (error) {
            console.error("Error actualizando turnos en vivo:", error);
        }
    };

    useEffect(() => {
        fetchTurnos(new Date(fechaActual));
        
        const socket = new SockJS(`${api}/ws-turnos`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Conectado a WebSocket de turnos en vivo');
                stompClient.subscribe('/topic/turnos', (message) => {
                    if (message.body) {
                        fetchTurnosSilencioso(new Date(fechaActual));
                    }
                });
            }
        });
        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaActual]);

    const cambiarSemana = (dias) => {
        const nuevaFecha = new Date(fechaActual);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        setFechaActual(nuevaFecha);
    };

    const generarTurnos = async () => {
        const result = await Swal.fire({
            title: '¿Generar turnos?',
            text: "Se generarán los turnos para la semana actual usando la plantilla.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981'
        });

        if (result.isConfirmed) {
            const lunes = getLunes(new Date(fechaActual));
            const lunesStr = formatearFecha(lunes);
            
            try {
                const response = await fetch(`${api}/api/turnos/generar?lunes=${lunesStr}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    Swal.fire('¡Éxito!', 'Los turnos se han generado correctamente.', 'success');
                    fetchTurnos(new Date(fechaActual));
                } else {
                    const text = await response.text();
                    Swal.fire('Error', text || 'Hubo un error al generar los turnos.', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Problema de red al generar turnos.', 'error');
            }
        }
    };

    const manejarTurno = async (turno, isDesanotando) => {
        const idTurno = turno.id;
        if (isDesanotando) {
            const result = await Swal.fire({
                title: '¿Cancelar turno?',
                text: "Acuérdate de avisarle al hermano encargado del carrito en caso de cancelar.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cancelar turno',
                cancelButtonText: 'Volver'
            });

            if (!result.isConfirmed) return;
        }

        setLoadingTurnoId(idTurno);
        try {
            const response = await fetch(`${api}/api/turnos/anotarse/${idTurno}?usuario=${usuarioActual}`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (response.ok) {
                fetchTurnos(new Date(fechaActual));
                
                if (!isDesanotando) {
                    const numeroEncargado = "1139562904";
                    const mensaje = encodeURIComponent(`Hola Luca, te quería avisar que voy a sacar el carrito de ${turno.horaInicio} a ${turno.horaFin}.`);
                    const enlaceWpp = `https://wa.me/549${numeroEncargado}?text=${mensaje}`;
                    Swal.fire({
                        title: '¡Anotado con éxito!',
                        html: `En el caso de querer participar con carrito acuérdate de avisarle al hermano que lo tiene en su casa.<br><br><a href="${enlaceWpp}" target="_blank" class="btn btn-success mt-3" style="text-decoration: none;"><i class="bi bi-whatsapp me-2"></i>Avisar por WhatsApp</a>`,
                        icon: 'success',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#0d6efd'
                    });
                } else {
                    Swal.fire('Cancelado', 'Te has bajado del turno exitosamente.', 'success');
                }
            } else {
                const text = await response.text();
                Swal.fire('No se pudo completar', text || 'Este turno ya fue ocupado o hubo un conflicto. Por favor, recarga los turnos.', 'warning');
                fetchTurnos(new Date(fechaActual));
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error de conexión', 'Hubo un problema al conectar. Verifica tu internet e intenta de nuevo.', 'error');
        } finally {
            setLoadingTurnoId(null);
        }
    };

    // Puntos únicos para el filtro
    const puntosUnicos = [...new Set(turnos.map(t => t.punto.nombre))].sort();

    // Lógica de filtrado
    const turnosFiltrados = turnos
        .filter(turno => {
            if (turno.fecha !== diaActivo) return false;
            if (filtroPunto !== 'todos' && turno.punto.nombre !== filtroPunto) return false;
            
            if (filtroHorario !== 'todos') {
                const hora = parseInt(turno.horaInicio.split(':')[0], 10);
                if (filtroHorario === 'mañana' && hora >= 13) return false;
                if (filtroHorario === 'tarde' && (hora < 13 || hora >= 19)) return false;
                if (filtroHorario === 'noche' && hora < 19) return false;
            }

            const estaLleno = turno.publicador1 && turno.publicador2;
            if (soloDisponibles && estaLleno) return false;
            
            return true;
        })
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    const renderBotonAnotarse = (turno) => {
        const estaAnotado1 = turno.publicador1 && turno.publicador1.usuario === usuarioActual;
        const estaAnotado2 = turno.publicador2 && turno.publicador2.usuario === usuarioActual;
        const estaAnotado = estaAnotado1 || estaAnotado2;
        const estaLleno = turno.publicador1 && turno.publicador2;
        const isLoading = loadingTurnoId === turno.id;

        if (isLoading) {
            return (
                <button className="btn btn-secondary w-100 mt-3 fw-bold rounded-pill shadow-sm opacity-75" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                </button>
            );
        }

        if (estaAnotado) {
            return (
                <button onClick={() => manejarTurno(turno, true)} className="btn btn-outline-danger w-100 mt-3 fw-bold rounded-pill shadow-sm" style={{transition: 'transform 0.1s'}}>
                    <i className="bi bi-x-circle me-2"></i>Desanotarme
                </button>
            );
        }

        if (estaLleno) {
            return (
                <button className="btn btn-secondary w-100 mt-3 fw-bold rounded-pill opacity-75" disabled>
                    <i className="bi bi-lock-fill me-2"></i>Lleno
                </button>
            );
        }

        return (
            <button onClick={() => manejarTurno(turno, false)} className="btn btn-primary w-100 mt-3 fw-bold rounded-pill shadow-sm" style={{transition: 'transform 0.1s'}}>
                <i className="bi bi-check-circle me-2"></i>Anotarme
            </button>
        );
    };

    const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="container py-5" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/" className="btn btn-outline-secondary rounded-circle shadow-sm d-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}} title="Volver al inicio">
                        <i className="bi bi-arrow-left"></i>
                    </Link>
                    <h2 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        Predicación Pública
                    </h2>
                </div>
                {puedeGenerarSemana && (
                    <button onClick={generarTurnos} className="btn btn-success shadow-sm rounded-pill px-4 fw-semibold">
                        <i className="bi bi-magic me-2"></i>Generar Semana
                    </button>
                )}
            </div>

            {/* Panel de Controles: Navegación de Semana y Filtros */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                <div className="card-body p-4">
                    <div className="row align-items-center g-4">
                        {/* Navegador de Semana */}
                        <div className="col-12 col-lg-5">
                            <div className="d-flex justify-content-between align-items-center bg-body-tertiary p-2 rounded-pill">
                                <button onClick={() => cambiarSemana(-7)} className="btn btn-sm btn-white rounded-circle shadow-sm" style={{width: '36px', height: '36px'}}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <h6 className="mb-0 fw-bold text-primary">
                                    Semana del {diasSemanaActual[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </h6>
                                <button onClick={() => cambiarSemana(7)} className="btn btn-sm btn-white rounded-circle shadow-sm" style={{width: '36px', height: '36px'}}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        {/* Filtros */}
                        <div className="col-12 col-lg-7 d-flex flex-column flex-sm-row justify-content-lg-end align-items-sm-center gap-2">
                            <div className="form-check form-switch fs-6 me-sm-2 mb-2 mb-sm-0">
                                <input 
                                    className="form-check-input shadow-sm" 
                                    type="checkbox" 
                                    role="switch" 
                                    id="switchDisponibles"
                                    checked={soloDisponibles}
                                    onChange={(e) => setSoloDisponibles(e.target.checked)}
                                />
                                <label className="form-check-label text-muted" htmlFor="switchDisponibles">Solo disponibles</label>
                            </div>
                            
                            <select 
                                className="form-select form-select-sm shadow-sm border-0 bg-body-tertiary fw-medium text-secondary" 
                                value={filtroHorario} 
                                onChange={(e) => setFiltroHorario(e.target.value)}
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="todos">Cualquier Hora</option>
                                <option value="mañana">Mañana (antes 13hs)</option>
                                <option value="tarde">Tarde (13hs - 19hs)</option>
                                <option value="noche">Noche (después 19hs)</option>
                            </select>

                            <select 
                                className="form-select form-select-sm shadow-sm border-0 bg-body-tertiary fw-medium text-secondary" 
                                value={filtroPunto} 
                                onChange={(e) => setFiltroPunto(e.target.value)}
                                style={{ width: 'auto', minWidth: '140px' }}
                            >
                                <option value="todos">Todos los puntos</option>
                                {puntosUnicos.map((punto, index) => (
                                    <option key={index} value={punto}>{punto}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pestañas de Días */}
            <ul className="nav nav-pills mb-4 flex-nowrap overflow-x-auto pb-2 gap-2" style={{ whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
                {diasSemanaActual.map((dia, index) => {
                    const fechaStr = formatearFecha(dia);
                    const isActivo = diaActivo === fechaStr;
                    return (
                        <li className="nav-item" key={index}>
                            <button
                                className={`nav-link fw-bold px-4 rounded-pill ${isActivo ? 'active shadow' : 'bg-body text-secondary border'}`}
                                onClick={() => setDiaActivo(fechaStr)}
                            >
                                {diasSemanaNombres[dia.getDay()]} {dia.getDate()}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Contenido (Tarjetas) */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-grow text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : turnosFiltrados.length === 0 ? (
                <div className="text-center py-5 bg-body shadow-sm rounded-4 border-0">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3 text-secondary">No hay turnos para mostrar</h5>
                    <p className="text-muted mb-0">Prueba cambiando de día o ajustando los filtros.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {turnosFiltrados.map(turno => {
                        const cuposOcupados = (turno.publicador1 ? 1 : 0) + (turno.publicador2 ? 1 : 0);
                        const isLleno = cuposOcupados === 2;
                        const isAnotado = (turno.publicador1?.usuario === usuarioActual) || (turno.publicador2?.usuario === usuarioActual);
                        
                        // Dynamic borders based on status
                        let cardBorderClass = "border-0";
                        if (isAnotado) cardBorderClass = "border border-primary border-2";
                        else if (isLleno) cardBorderClass = "border border-secondary opacity-75";

                        return (
                            <div key={turno.id} className="col-12 col-md-6 col-xl-4">
                                <div className={`card h-100 shadow-sm ${cardBorderClass}`} style={{ borderRadius: '1rem', transition: 'all 0.2s ease-in-out' }}>
                                    
                                    {/* Header de la Tarjeta */}
                                    <div className="card-header bg-transparent border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                                                <i className="bi bi-clock-fill fs-5"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-body">
                                                    {turno.horaInicio.slice(0, 5)} <span className="text-muted fw-normal mx-1">a</span> {turno.horaFin.slice(0, 5)}
                                                </h5>
                                            </div>
                                        </div>
                                        {/* Badge de estado */}
                                        {isLleno ? (
                                            <span className="badge bg-secondary rounded-pill">Lleno</span>
                                        ) : (
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill border border-success fw-semibold">
                                                {2 - cuposOcupados} {2 - cuposOcupados === 1 ? 'Lugar' : 'Lugares'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Cuerpo de la Tarjeta */}
                                    <div className="card-body px-4 pb-4">
                                        <div className="d-flex align-items-center mb-4 text-secondary">
                                            <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                                            <span className="fw-medium">{turno.punto.nombre}</span>
                                        </div>

                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {/* Slot 1 */}
                                            <div className="d-flex align-items-center p-2 rounded-3 bg-body-tertiary overflow-hidden">
                                                <div className="rounded-circle bg-secondary bg-opacity-25 text-secondary d-flex justify-content-center align-items-center me-3 flex-shrink-0" style={{width: '28px', height:'28px', fontSize: '0.85rem'}}>1</div> 
                                                <div className="text-truncate">
                                                    {turno.publicador1 ? (
                                                        <span className={`fw-semibold ${turno.publicador1.usuario === usuarioActual ? 'text-primary' : 'text-body'}`}>
                                                            {turno.publicador1.nombre} {turno.publicador1.apellido}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted fst-italic">Espacio libre</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Slot 2 */}
                                            <div className="d-flex align-items-center p-2 rounded-3 bg-body-tertiary overflow-hidden">
                                                <div className="rounded-circle bg-secondary bg-opacity-25 text-secondary d-flex justify-content-center align-items-center me-3 flex-shrink-0" style={{width: '28px', height:'28px', fontSize: '0.85rem'}}>2</div> 
                                                <div className="text-truncate">
                                                    {turno.publicador2 ? (
                                                        <span className={`fw-semibold ${turno.publicador2.usuario === usuarioActual ? 'text-primary' : 'text-body'}`}>
                                                            {turno.publicador2.nombre} {turno.publicador2.apellido}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted fst-italic">Espacio libre</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {renderBotonAnotarse(turno)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default PredicacionPublica;
