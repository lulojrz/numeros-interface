import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GestionPuntos = () => {
    const [puntos, setPuntos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoPunto, setNuevoPunto] = useState({ nombre: '', direccion: '' });
    const api = import.meta.env.VITE_API_URL;

    const fetchPuntos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/api/turnos/puntos`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPuntos(data);
            }
        } catch (error) {
            console.error("Error al cargar puntos", error);
            Swal.fire('Error', 'No se pudieron cargar los puntos de predicación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPuntos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoPunto(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nuevoPunto.nombre.trim()) {
            Swal.fire('Atención', 'El nombre del punto es obligatorio.', 'warning');
            return;
        }

        try {
            const response = await fetch(`${api}/api/puntos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    nombre: nuevoPunto.nombre,
                    direccion: nuevoPunto.direccion,
                    activo: true
                })
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'El punto se ha agregado correctamente.', 'success');
                setNuevoPunto({ nombre: '', direccion: '' });
                fetchPuntos();
            } else {
                Swal.fire('Error', 'No se pudo crear el punto.', 'error');
            }
        } catch (error) {
            console.error("Error al crear punto", error);
            Swal.fire('Error', 'Problema de red al crear el punto.', 'error');
        }
    };

    return (
        <div className="container-fluid p-0 mt-4">
            <div className="row g-4">
                {/* Formulario de Creación */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm border-0 bg-light">
                        <div className="card-body p-4">
                            <h4 className="card-title fw-bold text-primary mb-4">Agregar Punto</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Nombre del Punto *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="nombre"
                                        placeholder="Ej. Estación Colegiales"
                                        value={nuevoPunto.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Dirección</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="direccion"
                                        placeholder="Ej. Av. Federico Lacroze 3000"
                                        value={nuevoPunto.direccion}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">
                                    Guardar Punto
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Lista de Puntos */}
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h4 className="card-title fw-bold text-secondary mb-4">Puntos Disponibles</h4>
                            
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : puntos.length === 0 ? (
                                <div className="alert alert-info border-0 shadow-sm text-center">
                                    No hay puntos de predicación registrados todavía.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">Nombre</th>
                                                <th scope="col">Dirección</th>
                                                <th scope="col" className="text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {puntos.map(punto => (
                                                <tr key={punto.id}>
                                                    <td className="fw-semibold">{punto.nombre}</td>
                                                    <td className="text-muted">{punto.direccion || 'Sin dirección'}</td>
                                                    <td className="text-center">
                                                        {punto.activo ? (
                                                            <span className="badge bg-success rounded-pill px-3">Activo</span>
                                                        ) : (
                                                            <span className="badge bg-danger rounded-pill px-3">Inactivo</span>
                                                        )}
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

export default GestionPuntos;
