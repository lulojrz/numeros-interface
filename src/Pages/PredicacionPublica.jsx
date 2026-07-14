import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import { NumerosContext } from '../context/NumerosContext';

const PredicacionPublica = () => {
    // Auth info
    const usuarioActual = localStorage.getItem('usuario');
    const privilegio = localStorage.getItem('privilegio');
    const isAdmin = privilegio === 'ROLE_ANC' || privilegio === 'ROLE_ADMIN'; // adjust if needed
    const api = import.meta.env.VITE_API_URL;

    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // We use a date object to track the current week we are viewing
    // Start with today's date
    const [fechaActual, setFechaActual] = useState(new Date());

    // Format date as YYYY-MM-DD for the backend
    const formatearFecha = (fecha) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate Monday of the current week (useful for UI or if you want to explicitly pass Monday)
    const getLunes = (fecha) => {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        return d;
    };

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

    useEffect(() => {
        // Create a copy of the date to avoid mutating the state object directly during fetch
        fetchTurnos(new Date(fechaActual));
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
            cancelButtonText: 'Cancelar'
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

    const anotarse = async (idTurno) => {
        try {
            const response = await fetch(`${api}/api/turnos/anotarse/${idTurno}?usuario=${usuarioActual}`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (response.ok) {
                // Refresh list
                fetchTurnos(new Date(fechaActual));
            } else {
                const text = await response.text();
                Swal.fire('Atención', text || 'No se pudo realizar la acción.', 'warning');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Problema de red al actualizar el turno.', 'error');
        }
    };

    // Group turnos by date for rendering
    const agruparPorFecha = () => {
        const grupos = {};
        turnos.forEach(turno => {
            if (!grupos[turno.fecha]) {
                grupos[turno.fecha] = [];
            }
            grupos[turno.fecha].push(turno);
        });
        return grupos;
    };

    const turnosAgrupados = agruparPorFecha();

    const renderBotonAnotarse = (turno) => {
        const estaAnotado1 = turno.publicador1 && turno.publicador1.usuario === usuarioActual;
        const estaAnotado2 = turno.publicador2 && turno.publicador2.usuario === usuarioActual;
        const estaAnotado = estaAnotado1 || estaAnotado2;
        
        const estaLleno = turno.publicador1 && turno.publicador2;

        if (estaAnotado) {
            return (
                <button onClick={() => anotarse(turno.id)} className="btn btn-outline-danger w-100 mt-2 fw-bold">
                    Desanotarme
                </button>
            );
        }

        if (estaLleno) {
            return (
                <button className="btn btn-secondary w-100 mt-2 fw-bold" disabled>
                    Lleno
                </button>
            );
        }

        return (
            <button onClick={() => anotarse(turno.id)} className="btn btn-primary w-100 mt-2 fw-bold">
                Anotarme
            </button>
        );
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 className="fw-bold mb-3 mb-md-0" style={{ color: '#334155' }}>Predicación Pública</h2>
                {isAdmin && (
                    <button onClick={generarTurnos} className="btn btn-success shadow-sm">
                        Generar Turnos (Semana Actual)
                    </button>
                )}
            </div>

            {/* Controles de Semana */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm flex-wrap gap-2">
                <button onClick={() => cambiarSemana(-7)} className="btn btn-outline-primary">
                    &laquo; Ant
                </button>
                <h5 className="mb-0 fw-semibold text-muted text-center" style={{fontSize: '1.1rem'}}>
                    Semana del {new Date(getLunes(new Date(fechaActual)).getTime() + Math.abs(getLunes(new Date(fechaActual)).getTimezoneOffset()*60000)).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </h5>
                <button onClick={() => cambiarSemana(7)} className="btn btn-outline-primary">
                    Sig &raquo;
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : turnos.length === 0 ? (
                <div className="alert alert-info text-center shadow-sm">
                    No hay turnos generados para esta semana.
                </div>
            ) : (
                <div className="row g-4">
                    {Object.keys(turnosAgrupados).map((fechaStr, index) => {
                        // Avoid timezone issues with string dates
                        const [yyyy, mm, dd] = fechaStr.split('-');
                        const dateObj = new Date(yyyy, mm - 1, dd);
                        return (
                            <div key={index} className="col-12">
                                <h4 className="border-bottom pb-2 mb-3 mt-3 text-capitalize" style={{ color: '#475569', fontSize: '1.25rem' }}>
                                    {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h4>
                                <div className="row g-3">
                                    {turnosAgrupados[fechaStr].map(turno => (
                                        <div key={turno.id} className="col-md-6 col-lg-4">
                                            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '0.75rem' }}>
                                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}>
                                                    <span className="fw-bold fs-5">{turno.horaInicio.slice(0, 5)} - {turno.horaFin.slice(0, 5)}</span>
                                                    <small className="badge bg-light text-primary fs-6">{turno.punto.nombre}</small>
                                                </div>
                                                <div className="card-body bg-light">
                                                    <div className="mb-2 d-flex align-items-center gap-2">
                                                        <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center" style={{width: '24px', height:'24px', fontSize: '0.8rem'}}>1</div> 
                                                        {turno.publicador1 ? <span className="fw-medium">{turno.publicador1.usuario}</span> : <span className="text-muted fst-italic">Libre</span>}
                                                    </div>
                                                    <div className="mb-3 d-flex align-items-center gap-2">
                                                        <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center" style={{width: '24px', height:'24px', fontSize: '0.8rem'}}>2</div> 
                                                        {turno.publicador2 ? <span className="fw-medium">{turno.publicador2.usuario}</span> : <span className="text-muted fst-italic">Libre</span>}
                                                    </div>
                                                    {renderBotonAnotarse(turno)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
