import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Swal from 'sweetalert2';

const Experiencias = () => {
    const [experiencias, setExperiencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = import.meta.env.VITE_API_URL;

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        usuario: localStorage.getItem('usuario') || ''
    });

    useEffect(() => {
        cargarExperiencias();
    }, []);

    const cargarExperiencias = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/experiencias/traer`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setExperiencias(data);
            }
        } catch (error) {
            console.error("Error al cargar experiencias", error);
        } finally {
         
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // CONSTRUIMOS EL PAYLOAD CON EL FORMATO CORRECTO PARA JAVA
            const payload = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                fecha: new Date().toISOString(), // Inyectamos la fecha formateada de forma nativa
                usuario: {
                    usuario: formData.usuario // Metemos el string adentro del objeto esperado
                }
            };

            const response = await fetch(`${api}/experiencias/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // <-- Mandamos el payload estructurado
                credentials: 'include'
            });

            if (response.ok) {
                const nuevaExperiencia = await response.json();
                setExperiencias([...experiencias, nuevaExperiencia]);
                setShowModal(false);
                setFormData({
                    titulo: '',
                    descripcion: '',
                    usuario: localStorage.getItem('usuario') || ''
                });
                Swal.fire({
                    icon: 'success',
                    title: '¡Agregada!',
                    text: 'La experiencia se ha guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const errorMsg = await response.text();
                console.error("Detalle del error en el backend:", errorMsg);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la experiencia.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de red.' });
        }
    };

    return (
        <>
            <Header />
            <main className="min-vh-100 bg-light py-5">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-primary fw-bold">Experiencias</h2>
                        <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-semibold" onClick={() => setShowModal(true)}>
                            <i className="bi bi-plus-circle me-2"></i>Nueva Experiencia
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {experiencias.length === 0 ? (
                                <div className="col-12 text-center text-muted mt-5">
                                    <p className="fs-5">No hay experiencias compartidas aún. ¡Sé el primero en agregar una!</p>
                                </div>
                            ) : (
                                experiencias.map((exp, index) => (
                                    <div className="col-md-6 col-lg-4" key={exp.id || index}>
                                        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                                            <div className="card-body p-4">
                                                <h5 className="card-title text-primary fw-bold mb-1">{exp.titulo || 'Sin Título'}</h5>
                                                <h6 className="card-subtitle mb-3 text-muted small">
                                                    <i className="bi bi-person-fill me-1"></i>
                                                    Por: <span className="fw-semibold">{exp.usuario?.usuario || 'Anónimo'}</span>
                                                </h6>
                                                <p className="card-text text-secondary">{exp.descripcion}</p>
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
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary px-2 pt-2">Nueva Experiencia</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary">Título</label>
                                        <input
                                            type="text"
                                            className="form-control p-3 bg-light border-0 rounded-3"
                                            name="titulo"
                                            placeholder="Ingresa un título llamativo"
                                            value={formData.titulo}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold text-secondary">Descripción</label>
                                        <textarea
                                            className="form-control p-3 bg-light border-0 rounded-3"
                                            name="descripcion"
                                            rows="5"
                                            placeholder="Cuéntanos tu experiencia..."
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-semibold" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-semibold shadow-sm">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Experiencias;