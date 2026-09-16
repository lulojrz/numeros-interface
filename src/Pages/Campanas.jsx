import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Swal from 'sweetalert2';

const Campanas = () => {
    const [campanas, setCampanas] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = import.meta.env.VITE_API_URL;
    const privilegio = localStorage.getItem('privilegio');
    const esAdmin = privilegio === 'ROLE_ANC' || privilegio === 'ROLE_SM';

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        fechaInicio: '',
        fechaFin: '',
        estado: 'Próxima',
        imagen: ''
    });

    useEffect(() => {
        cargarCampanas();
    }, []);

    const cargarCampanas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/campanas/traer`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setCampanas(data);
            }
        } catch (error) {
            console.error("Error al cargar campañas", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imagen: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${api}/campanas/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                const nuevaCampana = await response.json();
                setCampanas([...campanas, nuevaCampana]);
                setShowModal(false);
                setFormData({
                    titulo: '',
                    fechaInicio: '',
                    fechaFin: '',
                    estado: 'Próxima',
                    imagen: ''
                });
                Swal.fire({
                    icon: 'success',
                    title: '¡Agregada!',
                    text: 'La campaña se ha guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la campaña.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de red.' });
        }
    };

    const eliminarCampana = async (id) => {
        const confirmar = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmar.isConfirmed) {
            try {
                const response = await fetch(`${api}/campanas/borrar/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    setCampanas(campanas.filter(c => c.id !== id));
                    Swal.fire({ icon: 'success', title: 'Borrada', text: 'La campaña ha sido eliminada.', timer: 2000, showConfirmButton: false });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la campaña' });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error de red al intentar eliminar' });
            }
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        // Ajuste simple de zona horaria si la fecha viene como YYYY-MM-DD
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const getBadgeColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activa': return 'bg-success';
            case 'próxima': return 'bg-warning text-dark';
            case 'finalizada': return 'bg-secondary';
            default: return 'bg-primary';
        }
    };

    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary py-4 py-md-5">
                <div className="container">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                        <h2 className="text-primary fw-bold mb-0">Campañas Especiales</h2>
                        {esAdmin && (
                            <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-semibold align-self-start align-self-sm-auto" onClick={() => setShowModal(true)}>
                                <i className="bi bi-plus-circle me-2"></i>Nueva Campaña
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {campanas.length === 0 ? (
                                <div className="col-12 text-center text-muted mt-5">
                                    <p className="fs-5">No hay campañas registradas.</p>
                                </div>
                            ) : (
                                campanas.map((campana) => (
                                    <div className="col-12" key={campana.id}>
                                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden position-relative">
                                            {/* Banner Image */}
                                            {campana.imagen ? (
                                                <img 
                                                    src={campana.imagen} 
                                                    className="card-img-top object-fit-cover" 
                                                    alt={campana.titulo} 
                                                    style={{ height: '200px', width: '100%' }}
                                                />
                                            ) : (
                                                <div className="bg-primary bg-gradient d-flex justify-content-center align-items-center" style={{ height: '120px' }}>
                                                    <i className="bi bi-megaphone text-white opacity-50" style={{ fontSize: '4rem' }}></i>
                                                </div>
                                            )}

                                            {/* Estado Badge Overlay */}
                                            <div className="position-absolute top-0 end-0 p-3">
                                                <span className={`badge ${getBadgeColor(campana.estado)} shadow fs-6 rounded-pill`}>
                                                    {campana.estado}
                                                </span>
                                            </div>

                                            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                                <div>
                                                    <h4 className="card-title text-primary fw-bold mb-2">{campana.titulo}</h4>
                                                    <div className="d-flex flex-wrap gap-3 text-secondary mb-3 mb-md-0">
                                                        <span className="d-flex align-items-center">
                                                            <i className="bi bi-calendar-event me-2"></i>
                                                            Inicio: {formatFecha(campana.fechaInicio)}
                                                        </span>
                                                        <span className="d-flex align-items-center">
                                                            <i className="bi bi-calendar-check me-2"></i>
                                                            Fin: {formatFecha(campana.fechaFin)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {esAdmin && (
                                                    <button 
                                                        className="btn btn-outline-danger rounded-pill px-4 ms-md-3" 
                                                        onClick={() => eliminarCampana(campana.id)}
                                                    >
                                                        <i className="bi bi-trash me-2"></i>Borrar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal para agregar */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable mx-3 mx-sm-auto">
                        <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary px-2 pt-2">Crear Campaña</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary">Título</label>
                                    <input
                                        type="text"
                                        className="form-control p-3 bg-body-tertiary border-0 rounded-3"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-semibold text-secondary">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            className="form-control p-3 bg-body-tertiary border-0 rounded-3"
                                            name="fechaInicio"
                                            value={formData.fechaInicio}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold text-secondary">Fecha Fin</label>
                                        <input
                                            type="date"
                                            className="form-control p-3 bg-body-tertiary border-0 rounded-3"
                                            name="fechaFin"
                                            value={formData.fechaFin}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary">Estado</label>
                                    <select
                                        className="form-select p-3 bg-body-tertiary border-0 rounded-3"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Próxima">Próxima</option>
                                        <option value="Activa">Activa</option>
                                        <option value="Finalizada">Finalizada</option>
                                    </select>
                                </div>

                                <div className="mb-2">
                                    <label className="form-label fw-semibold text-secondary">Imagen (Banner)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control p-3 bg-body-tertiary border-0 rounded-3"
                                        onChange={handleImageChange}
                                    />
                                    {formData.imagen && (
                                        <div className="mt-3 text-center">
                                            <img src={formData.imagen} alt="Preview" className="img-thumbnail rounded-3" style={{ maxHeight: '150px' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                                <button type="button" className="btn btn-light rounded-pill px-4 fw-semibold" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold shadow-sm">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Campanas;
