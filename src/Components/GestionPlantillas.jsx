import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GestionPlantillas = () => {
    const [plantillas, setPlantillas] = useState([]);
    const [puntos, setPuntos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevaPlantilla, setNuevaPlantilla] = useState({
        diaSemana: 'LUNES',
        horaInicio: '',
        horaFin: '',
        puntoId: ''
    });
    
    const api = import.meta.env.VITE_API_URL;

    const diasSemana = [
        'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'
    ];

    const fetchPuntos = async () => {
        try {
            const response = await fetch(`${api}/api/turnos/puntos`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                // Solo cargar puntos activos si es posible, o todos
                setPuntos(data.filter(p => p.activo !== false)); // if activo doesn't exist, show it.
            }
        } catch (error) {
            console.error("Error al cargar puntos", error);
        }
    };

    const fetchPlantillas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/api/turnos/obtener`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPlantillas(data);
            }
        } catch (error) {
            console.error("Error al cargar plantillas", error);
            Swal.fire('Error', 'No se pudieron cargar las plantillas de turnos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPuntos();
        fetchPlantillas();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevaPlantilla(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nuevaPlantilla.diaSemana || !nuevaPlantilla.horaInicio || !nuevaPlantilla.horaFin || !nuevaPlantilla.puntoId) {
            Swal.fire('Atención', 'Todos los campos son obligatorios.', 'warning');
            return;
        }
        console.log("Submitting new plantilla:", nuevaPlantilla);

        try {
            const response = await fetch(`${api}/api/turnos/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    diaSemana: nuevaPlantilla.diaSemana,
                    horaInicio: nuevaPlantilla.horaInicio,
                    horaFin: nuevaPlantilla.horaFin,
                    punto: {
                        id: parseInt(nuevaPlantilla.puntoId)
                    }
                })
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'La plantilla se ha agregado correctamente.', 'success');
                setNuevaPlantilla({ 
                    diaSemana: 'LUNES', 
                    horaInicio: '', 
                    horaFin: '', 
                    punto: { id: '' } 
                });
                fetchPlantillas();
            } else {
                Swal.fire('Error', 'No se pudo crear la plantilla.', 'error');
            }
        } catch (error) {
            console.error("Error al crear plantilla", error);
            Swal.fire('Error', 'Problema de red al crear la plantilla.', 'error');
        }
    };

    const eliminarPlantilla = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${api}/api/turnos/eliminar/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    Swal.fire('¡Eliminado!', 'La plantilla ha sido eliminada.', 'success');
                    fetchPlantillas();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar la plantilla.', 'error');
                }
            } catch (error) {
                console.error("Error al eliminar plantilla", error);
                Swal.fire('Error', 'Problema de red al eliminar la plantilla.', 'error');
            }
        }
    };

    return (
        <div className="container-fluid p-0 mt-4">
            <div className="row g-4">
                {/* Formulario de Creación */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm border-0 bg-light">
                        <div className="card-body p-4">
                            <h4 className="card-title fw-bold text-primary mb-4">Crear Plantilla</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Punto de Predicación *</label>
                                    <select 
                                        className="form-select" 
                                        name="puntoId"
                                        value={nuevaPlantilla.punto.id || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un punto...</option>
                                        {puntos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Día de la Semana *</label>
                                    <select 
                                        className="form-select" 
                                        name="diaSemana"
                                        value={nuevaPlantilla.diaSemana}
                                        onChange={handleChange}
                                        required
                                    >
                                        {diasSemana.map(dia => (
                                            <option key={dia} value={dia}>{dia}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Hora de Inicio *</label>
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        name="horaInicio"
                                        value={nuevaPlantilla.horaInicio}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Hora de Fin *</label>
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        name="horaFin"
                                        value={nuevaPlantilla.horaFin}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">
                                    Guardar Plantilla
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Lista de Plantillas */}
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h4 className="card-title fw-bold text-secondary mb-4">Plantillas de Turnos</h4>
                            
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : plantillas.length === 0 ? (
                                <div className="alert alert-info border-0 shadow-sm text-center">
                                    No hay plantillas de turnos registradas.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle text-center">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">Día</th>
                                                <th scope="col">Horario</th>
                                                <th scope="col">Punto</th>
                                                <th scope="col">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plantillas.map(plantilla => (
                                                <tr key={plantilla.id}>
                                                    <td className="fw-semibold">{plantilla.diaSemana}</td>
                                                    <td>{plantilla.horaInicio?.slice(0, 5)} - {plantilla.horaFin?.slice(0, 5)}</td>
                                                    <td className="text-muted">{plantilla.punto?.nombre || 'Desconocido'}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger fw-semibold"
                                                            onClick={() => eliminarPlantilla(plantilla.id)}
                                                        >
                                                            <i className="bi bi-trash-fill me-1"></i> Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionPlantillas;
