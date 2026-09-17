import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GestionEdificios = () => {
    const [territorios, setTerritorios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [territorioSeleccionado, setTerritorioSeleccionado] = useState(null);
    
    const api = import.meta.env.VITE_API_URL;
    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const resTerr = await fetch(`${api}/territorios/traer`, { credentials: 'include' });
            if (resTerr.ok) setTerritorios(await resTerr.json());

            const resUsu = await fetch(`${api}/usuarios`, { credentials: 'include' });
            if (resUsu.ok) setUsuarios(await resUsu.json());
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const agregarTerritorio = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Territorio (Edificios)',
            html: `
                <input id="swal-num" class="swal2-input" placeholder="Número o Nombre (Ej: 15)">
                <div class="mt-3 text-start" style="width: 80%; margin: 0 auto;">
                    <label class="form-label text-muted small mb-1">Imagen del mapa (Opcional)</label>
                    <input type="file" id="swal-img-file" class="form-control" accept="image/*">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            preConfirm: () => {
                const numero = document.getElementById('swal-num').value;
                const fileInput = document.getElementById('swal-img-file');
                
                if (!numero) {
                    Swal.showValidationMessage('El número de territorio es obligatorio');
                    return false;
                }
                
                return new Promise((resolve) => {
                    if (fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        // Comprobar tamaño (opcional, ej: max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                            Swal.showValidationMessage('La imagen es muy pesada (Máximo 5MB)');
                            resolve(false);
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            resolve({ numero: numero, imagen: e.target.result });
                        };
                        reader.onerror = () => {
                            Swal.showValidationMessage('Error al leer la imagen');
                            resolve(false);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        resolve({ numero: numero, imagen: null });
                    }
                });
            }
        });

        if (formValues && formValues.numero) {
            try {
                const res = await fetch(`${api}/territorios/agregar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formValues)
                });
                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'Territorio creado' });
                    fetchData();
                } else throw new Error("Error backend");
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'No se pudo crear el territorio' });
            }
        }
    };

    const editarAsignacion = async (territorio, asignadoAId) => {
        const usuarioAsignado = usuarios.find(u => u.id === parseInt(asignadoAId));
        const updated = {
            ...territorio,
            asignadoA: usuarioAsignado || null
        };
        try {
            const res = await fetch(`${api}/territorios/editar/${territorio.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                Toast.fire({ icon: 'success', title: 'Asignación actualizada' });
                fetchData();
            }
        } catch (e) {
            Toast.fire({ icon: 'error', title: 'Error al actualizar' });
        }
    };

    const borrarTerritorio = async (id) => {
        const result = await Swal.fire({
            title: '¿Borrar Territorio?',
            text: "Se borrarán también todas sus manzanas. Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, borrar'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${api}/territorios/borrar/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'Territorio borrado' });
                    setTerritorioSeleccionado(null);
                    fetchData();
                }
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'No se pudo borrar' });
            }
        }
    };

    const agregarManzana = async (territorioId) => {
        const { value: formValues } = await Swal.fire({
            title: 'Nueva Manzana',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre (Ej: Manzana 1)">
                <input id="swal-norte" class="swal2-input" placeholder="Calle Norte">
                <input id="swal-sur" class="swal2-input" placeholder="Calle Sur">
                <input id="swal-este" class="swal2-input" placeholder="Calle Este">
                <input id="swal-oeste" class="swal2-input" placeholder="Calle Oeste">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-nombre').value,
                    calleNorte: document.getElementById('swal-norte').value,
                    calleSur: document.getElementById('swal-sur').value,
                    calleEste: document.getElementById('swal-este').value,
                    calleOeste: document.getElementById('swal-oeste').value,
                    territorio: { id: territorioId }
                }
            }
        });

        if (formValues && formValues.nombre) {
            try {
                const res = await fetch(`${api}/manzanas/agregar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formValues)
                });
                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'Manzana creada' });
                    fetchData();
                }
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'No se pudo crear la manzana' });
            }
        }
    };

    const borrarManzana = async (id) => {
        if (confirm("¿Seguro que deseas borrar esta manzana?")) {
            try {
                const res = await fetch(`${api}/manzanas/borrar/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'Manzana borrada' });
                    fetchData();
                }
            } catch (e) {
                Toast.fire({ icon: 'error', title: 'Error al borrar' });
            }
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

    const currentTerritorioFull = territorioSeleccionado ? territorios.find(t => t.id === territorioSeleccionado.id) : null;

    return (
        <div className="mt-3">
            <h3 className="h5 text-primary mb-3">Gestión de Territorios (Edificios)</h3>
            
            <div className="row g-4">
                {/* LISTA DE TERRITORIOS */}
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="card shadow-sm border-0 bg-body-tertiary">
                        <div className="card-header bg-transparent border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0"><i className="bi bi-map text-warning me-2"></i>Territorios</h5>
                            <button className="btn btn-sm btn-outline-success rounded-circle" onClick={agregarTerritorio} title="Agregar Territorio">
                                <i className="bi bi-plus-lg"></i>
                            </button>
                        </div>
                        <div className="card-body">
                            {territorios.length === 0 ? (
                                <p className="text-muted small text-center">No hay territorios creados.</p>
                            ) : (
                                <div className="list-group list-group-flush border-0">
                                    {territorios.map(t => (
                                        <button 
                                            key={t.id} 
                                            onClick={() => setTerritorioSeleccionado(t)}
                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center rounded-3 mb-1 border-0 ${territorioSeleccionado?.id === t.id ? 'active shadow-sm' : 'bg-white'}`}
                                        >
                                            <div>
                                                <div className="fw-bold">Territorio {t.numero}</div>
                                                <small className={territorioSeleccionado?.id === t.id ? 'text-white-50' : 'text-muted'}>
                                                    {t.manzanas?.length || 0} manzanas
                                                </small>
                                            </div>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* DETALLE DEL TERRITORIO SELECCIONADO */}
                <div className="col-12 col-md-7 col-lg-8">
                    {currentTerritorioFull ? (
                        <div className="card shadow-sm border-0 animate__animated animate__fadeIn">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                                    <div>
                                        <h4 className="fw-bold text-primary m-0">Territorio {currentTerritorioFull.numero}</h4>
                                        <p className="text-muted mb-0 small">ID: {currentTerritorioFull.id}</p>
                                    </div>
                                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => borrarTerritorio(currentTerritorioFull.id)}>
                                        <i className="bi bi-trash3 me-1"></i> Eliminar Territorio
                                    </button>
                                </div>

                                <div className="row mb-4 bg-body-tertiary p-3 rounded-3 g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold text-secondary small mb-1">Asignar a:</label>
                                        <select 
                                            className="form-select border-0 shadow-sm"
                                            value={currentTerritorioFull.asignadoA?.id || ""}
                                            onChange={(e) => editarAsignacion(currentTerritorioFull, e.target.value)}
                                        >
                                            <option value="">-- Disponible (Sin asignar) --</option>
                                            {usuarios.map(u => (
                                                <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        {currentTerritorioFull.imagen && (
                                            <a href={currentTerritorioFull.imagen} target="_blank" rel="noreferrer" className="btn btn-outline-info w-100 h-100 d-flex align-items-center justify-content-center border-0 shadow-sm bg-white">
                                                <i className="bi bi-image me-2"></i> Ver Mapa del Territorio
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold m-0"><i className="bi bi-grid-3x3 text-secondary me-2"></i>Manzanas</h5>
                                    <button className="btn btn-success btn-sm px-3 rounded-pill fw-semibold shadow-sm" onClick={() => agregarManzana(currentTerritorioFull.id)}>
                                        <i className="bi bi-plus-lg me-1"></i> Nueva Manzana
                                    </button>
                                </div>

                                {(!currentTerritorioFull.manzanas || currentTerritorioFull.manzanas.length === 0) ? (
                                    <div className="alert alert-light border text-center py-4 text-muted">
                                        <i className="bi bi-building fs-1 d-block mb-2 text-secondary opacity-50"></i>
                                        No hay manzanas creadas en este territorio.
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {currentTerritorioFull.manzanas.map(m => (
                                            <div className="col-12 col-xl-6" key={m.id}>
                                                <div className="card h-100 border bg-body rounded-3 shadow-sm position-relative">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="fw-bold text-primary m-0">{m.nombre}</h6>
                                                            <button className="btn btn-link text-danger p-0" onClick={() => borrarManzana(m.id)}>
                                                                <i className="bi bi-x-circle-fill fs-5"></i>
                                                            </button>
                                                        </div>
                                                        <div className="text-muted small lh-sm">
                                                            <div className="mb-1"><span className="fw-semibold">N:</span> {m.calleNorte || '-'}</div>
                                                            <div className="mb-1"><span className="fw-semibold">S:</span> {m.calleSur || '-'}</div>
                                                            <div className="mb-1"><span className="fw-semibold">E:</span> {m.calleEste || '-'}</div>
                                                            <div><span className="fw-semibold">O:</span> {m.calleOeste || '-'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-0 h-100 bg-body-tertiary d-flex align-items-center justify-content-center py-5">
                            <div className="text-center text-muted">
                                <i className="bi bi-map fs-1 mb-3 d-block opacity-50"></i>
                                <h5>Selecciona un territorio</h5>
                                <p className="small">Haz clic en un territorio de la lista para gestionar sus manzanas y asignaciones.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionEdificios;
