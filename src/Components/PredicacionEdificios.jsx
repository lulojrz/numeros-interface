import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const PredicacionEdificios = () => {
    const [territorios, setTerritorios] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Rutas de navegación
    const [vistaActual, setVistaActual] = useState('territorios'); // territorios, manzanas, edificios, portero
    const [territorioSel, setTerritorioSel] = useState(null);
    const [manzanaSel, setManzanaSel] = useState(null);
    const [edificioSel, setEdificioSel] = useState(null);
    const [mapaViewer, setMapaViewer] = useState(null);

    const api = import.meta.env.VITE_API_URL;
    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`${api}/territorios/traer?t=${timestamp}`, { credentials: 'include' });
            if (res.ok) {
                setTerritorios(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Funciones de navegación
    const irAManzanas = (t) => { setTerritorioSel(t); setVistaActual('manzanas'); };
    const irAEdificios = (m) => { setManzanaSel(m); setVistaActual('edificios'); };
    const irAPortero = (e) => { setEdificioSel(e); setVistaActual('portero'); };
    const volver = () => {
        if (vistaActual === 'portero') setVistaActual('edificios');
        else if (vistaActual === 'edificios') setVistaActual('manzanas');
        else if (vistaActual === 'manzanas') setVistaActual('territorios');
    };

    // Actualizar un departamento
    const actualizarDpto = async (dpto, nuevoEstado, nuevoTocar) => {
        const updated = {
            ...dpto,
            estado: nuevoEstado,
            tocar: nuevoTocar,
            ultimaFechaTrabajada: new Date().toISOString()
        };
        try {
            const res = await fetch(`${api}/departamentos/editar/${dpto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                Toast.fire({ icon: 'success', title: 'Guardado' });
                // Refetch silencioso para actualizar en pantalla
                const resTerr = await fetch(`${api}/territorios/traer?t=${new Date().getTime()}`, { credentials: 'include' });
                if (resTerr.ok) setTerritorios(await resTerr.json());
            }
        } catch (e) {
            Toast.fire({ icon: 'error', title: 'Error al guardar' });
        }
    };

    const abrirMenuDpto = (dpto) => {
        Swal.fire({
            title: `Timbre ${dpto.piso}-${dpto.letra}`,
            html: `
                <div class="d-grid gap-2">
                    <button id="btn-revisita" class="btn btn-info text-white fw-bold"><i class="bi bi-star-fill text-warning me-1"></i>Revisita</button>
                    <button id="btn-atendio" class="btn btn-success fw-bold">Atendió</button>
                    <button id="btn-noencasa" class="btn btn-warning fw-bold text-dark">No en casa</button>
                    <button id="btn-ocupado" class="btn btn-secondary fw-bold">Ocupado / Vuelvo Luego</button>
                    <hr/>
                    <button id="btn-notocar" class="btn ${dpto.tocar ? 'btn-danger' : 'btn-outline-danger'} fw-bold">
                        <i class="bi bi-slash-circle me-1"></i> ${dpto.tocar ? 'Marcar como NO TOCAR' : 'Volver a TOCAR'}
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => {
                document.getElementById('btn-revisita').addEventListener('click', async () => {
                    Swal.close();
                    const { value: observaciones } = await Swal.fire({
                        title: 'Observaciones de la Revisita',
                        input: 'textarea',
                        inputPlaceholder: 'Ej: Se llama Juan, dejamos la Atalaya...',
                        showCancelButton: true,
                        confirmButtonText: 'Guardar',
                        cancelButtonText: 'Cancelar'
                    });
                    if (observaciones !== undefined) {
                        const usuarioId = localStorage.getItem('usuarioId'); // Necesitamos sacar el ID del usuario
                        actualizarDpto({...dpto, observaciones, publicador: { id: usuarioId }}, 'Revisita', dpto.tocar);
                    }
                });
                document.getElementById('btn-atendio').addEventListener('click', () => {
                    Swal.close(); actualizarDpto(dpto, 'Atendió', dpto.tocar);
                });
                document.getElementById('btn-noencasa').addEventListener('click', () => {
                    Swal.close(); actualizarDpto(dpto, 'No en casa', dpto.tocar);
                });
                document.getElementById('btn-ocupado').addEventListener('click', () => {
                    Swal.close(); actualizarDpto(dpto, 'Ocupado', dpto.tocar);
                });
                document.getElementById('btn-notocar').addEventListener('click', () => {
                    Swal.close(); actualizarDpto(dpto, dpto.estado, !dpto.tocar);
                });
            }
        });
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

    // Obtener referencias actualizadas
    const tActual = territorioSel ? territorios.find(t => t.id === territorioSel.id) : null;
    const mActual = tActual && manzanaSel ? tActual.manzanas?.find(m => m.id === manzanaSel.id) : null;
    const eActual = mActual && edificioSel ? mActual.edificios?.find(e => e.id === edificioSel.id) : null;

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 text-primary fw-bold m-0">
                    <i className="bi bi-buildings me-2"></i>Predicación de Edificios
                </h2>
            </div>

            {/* BREADCRUMBS */}
            {vistaActual !== 'territorios' && (
                <div className="mb-3 d-flex align-items-center bg-white p-2 rounded shadow-sm border">
                    <button className="btn btn-sm btn-light rounded-circle me-2" onClick={volver}><i className="bi bi-arrow-left"></i></button>
                    <div className="text-muted small fw-semibold overflow-hidden text-truncate">
                        Territorio {tActual?.numero} 
                        {vistaActual !== 'manzanas' && ` > ${mActual?.nombre}`}
                        {vistaActual === 'portero' && ` > ${eActual?.direccion}`}
                    </div>
                </div>
            )}

            {/* VISTA 1: TERRITORIOS */}
            {vistaActual === 'territorios' && (
                <div className="row g-3">
                    {territorios.length === 0 ? (
                        <div className="col-12 text-center text-muted py-5">No hay territorios creados.</div>
                    ) : (
                        territorios.map(t => (
                            <div className="col-12 col-md-6 col-lg-4" key={t.id}>
                                <div className="card h-100 border-0 shadow-sm" onClick={() => irAManzanas(t)} style={{cursor: 'pointer'}}>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="fw-bold mb-1">Territorio {t.numero}</h5>
                                            <div className="text-muted small">
                                                <i className="bi bi-grid-3x3 me-1"></i> {t.manzanas?.length || 0} Manzanas
                                            </div>
                                            {t.asignadoA && (
                                                <div className="badge bg-light text-dark border mt-2">
                                                    Asignado a: {t.asignadoA.nombre}
                                                </div>
                                            )}
                                        </div>
                                        <i className="bi bi-chevron-right text-primary fs-4"></i>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* VISTA 2: MANZANAS */}
            {vistaActual === 'manzanas' && tActual && (
                <div className="row g-3">
                    <div className="col-12">
                        {tActual.imagen && (
                            <button onClick={() => setMapaViewer(tActual.imagen)} className="btn btn-outline-info w-100 bg-white shadow-sm fw-bold mb-3">
                                <i className="bi bi-map me-2"></i> Ver Mapa del Territorio
                            </button>
                        )}
                    </div>
                    {(!tActual.manzanas || tActual.manzanas.length === 0) ? (
                        <div className="col-12 text-center text-muted py-5">Este territorio no tiene manzanas.</div>
                    ) : (
                        tActual.manzanas.map(m => (
                            <div className="col-12 col-md-6" key={m.id}>
                                <div className="card h-100 border-0 shadow-sm" onClick={() => irAEdificios(m)} style={{cursor: 'pointer'}}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <h5 className="fw-bold text-primary">{m.nombre}</h5>
                                            <i className="bi bi-chevron-right text-muted"></i>
                                        </div>
                                        <div className="text-muted small mt-2">
                                            N: {m.calleNorte} | S: {m.calleSur} <br/>
                                            E: {m.calleEste} | O: {m.calleOeste}
                                        </div>
                                        <div className="mt-3">
                                            <span className="badge bg-primary rounded-pill">{m.edificios?.length || 0} Edificios</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* VISTA 3: EDIFICIOS */}
            {vistaActual === 'edificios' && mActual && (
                <div className="row g-3">
                    {(!mActual.edificios || mActual.edificios.length === 0) ? (
                        <div className="col-12 text-center text-muted py-5">Esta manzana no tiene edificios.</div>
                    ) : (
                        mActual.edificios.map(e => {
                            const total = e.departamentos?.length || 0;
                            const trabajados = e.departamentos?.filter(d => d.estado && d.estado !== 'No visitado').length || 0;
                            const efectivos = e.departamentos?.filter(d => d.estado === 'Atendió').length || 0;
                            const progreso = total === 0 ? 0 : Math.round((trabajados / total) * 100);
                            const efectividad = total === 0 ? 0 : Math.round((efectivos / total) * 100);
                            
                            return (
                                <div className="col-12 col-lg-6" key={e.id}>
                                    <div className="card h-100 border-0 shadow-sm" onClick={() => irAPortero(e)} style={{cursor: 'pointer'}}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 className="fw-bold m-0">{e.direccion}</h5>
                                                <span className="badge bg-secondary">{e.categoria}</span>
                                            </div>
                                            <div className="text-muted small mb-3">
                                                <i className="bi bi-bell me-1"></i> {total} timbres en total
                                            </div>
                                            <div className="progress" style={{height: '8px'}}>
                                                <div className="progress-bar bg-success" style={{width: `${progreso}%`}}></div>
                                            </div>
                                            <div className="d-flex justify-content-between small fw-bold mt-2">
                                                <span className="text-warning text-darken"><i className="bi bi-star-fill me-1"></i>{efectividad}% Efectividad</span>
                                                <span className="text-success">{progreso}% Cubierto</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* VISTA 4: PORTERO ELÉCTRICO */}
            {vistaActual === 'portero' && eActual && (
                <div className="card border-0 shadow-sm bg-body-tertiary">
                    <div className="card-body">
                        <div className="alert alert-info text-center fw-bold shadow-sm">
                            <i className="bi bi-door-open me-2"></i> Portero Eléctrico de {eActual.direccion}
                        </div>
                        
                        <div className="row g-2 justify-content-center mt-4">
                            {(eActual.departamentos || []).sort((a,b) => {
                                // Ordenar por piso (PB primero, luego numérico invertido para que pisos altos queden arriba)
                                // Esto es complejo, pero simplificamos con sort alfanumérico estandar
                                return a.piso.localeCompare(b.piso) || a.letra.localeCompare(b.letra);
                            }).map(dpto => {
                                let btnClass = "btn-light border shadow-sm";
                                let icon = "bi-bell";
                                
                                if (!dpto.tocar) {
                                    btnClass = "btn-danger text-white shadow";
                                    icon = "bi-slash-circle";
                                } else if (dpto.estado === 'Atendió') {
                                    btnClass = "btn-success text-white shadow-sm";
                                    icon = "bi-check-circle";
                                } else if (dpto.estado === 'No en casa' || dpto.estado === 'Ocupado') {
                                    btnClass = "btn-warning text-dark shadow-sm";
                                    icon = "bi-house-x";
                                }

                                return (
                                    <div className="col-4 col-sm-3 col-md-2" key={dpto.id}>
                                        <button 
                                            className={`btn w-100 py-3 ${btnClass} d-flex flex-column align-items-center justify-content-center h-100`}
                                            onClick={() => abrirMenuDpto(dpto)}
                                        >
                                            <i className={`bi ${icon} fs-4 mb-1`}></i>
                                            <span className="fw-bold" style={{fontSize: '0.9rem'}}>{dpto.piso}-{dpto.letra}</span>
                                            {dpto.estado && dpto.estado !== 'No visitado' && dpto.tocar && (
                                                <span style={{fontSize: '0.65rem'}} className="mt-1 text-truncate w-100">{dpto.estado}</span>
                                            )}
                                            {dpto.ultimaFechaTrabajada && (
                                                <span style={{fontSize: '0.55rem', opacity: 0.8}} className="text-truncate w-100">
                                                    {new Date(dpto.ultimaFechaTrabajada).toLocaleDateString()}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {mapaViewer && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', maxWidth: '95%', maxHeight: '95%' }}>
                        <button onClick={() => setMapaViewer(null)} className="btn btn-danger position-absolute shadow" style={{ top: '-15px', right: '-15px', borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <img src={mapaViewer} alt="Mapa del Territorio" className="img-fluid rounded shadow-lg" style={{ maxHeight: '90vh', objectFit: 'contain' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredicacionEdificios;
