import React, { useState, useEffect } from 'react';

const ProgramaPredicacion = () => {
    const api = import.meta.env.VITE_API_URL;
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalidas = async () => {
            try {
                const res = await fetch(`${api}/salidas/traer`, { credentials: 'include' });
                if (res.ok) setSalidas(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSalidas();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    // Filtrar para mostrar solo las salidas desde hoy en adelante (o mostrar todas pero ordenadas)
    const hoy = new Date().toISOString().split('T')[0];
    const salidasFuturas = salidas.filter(s => s.fecha >= hoy).sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: '800px' }}>
            <h2 className="h4 text-primary fw-bold mb-4 text-center">
                <i className="bi bi-calendar3 me-2"></i>Programa de Salidas
            </h2>
            
            {salidasFuturas.length === 0 ? (
                <div className="alert alert-info text-center shadow-sm border-0">
                    <i className="bi bi-info-circle me-2"></i>No hay salidas programadas para los próximos días.
                </div>
            ) : (
                <div className="row g-3">
                    {salidasFuturas.map(s => {
                        const d = new Date(s.fecha + 'T12:00:00'); // Evitar problemas de zona horaria
                        const diaStr = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                        
                        return (
                            <div className="col-12" key={s.id}>
                                <div className="card shadow-sm border-0 border-start border-primary border-4 rounded-3 h-100">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="fw-bold m-0 text-dark text-capitalize">{diaStr}</h5>
                                            <span className="badge bg-primary fs-6"><i className="bi bi-clock me-1"></i> {s.hora} hs</span>
                                        </div>
                                        <hr className="my-2 opacity-25" />
                                        <div className="row g-2 align-items-center">
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center text-muted">
                                                    <div className="bg-light rounded-circle p-2 me-3 text-danger">
                                                        <i className="bi bi-geo-alt-fill fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="small fw-bold text-uppercase">Encuentro</div>
                                                        <div className="text-dark">{s.puntoEncuentro}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <div className="d-flex align-items-center text-muted">
                                                    <div className="bg-light rounded-circle p-2 me-3 text-info">
                                                        <i className="bi bi-person-fill fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="small fw-bold text-uppercase">Conductor</div>
                                                        <div className="text-dark">{s.conductor?.nombre} {s.conductor?.apellido}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-4">
                                                {s.territorio ? (
                                                    <div className="d-flex align-items-center text-muted">
                                                        <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 text-success">
                                                            <i className="bi bi-map-fill fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <div className="small fw-bold text-uppercase text-success">Territorio</div>
                                                            <div className="text-dark fw-bold">N° {s.territorio.numero}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center text-muted opacity-50">
                                                        <div className="bg-light rounded-circle p-2 me-3">
                                                            <i className="bi bi-map fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <div className="small fw-bold text-uppercase">Territorio</div>
                                                            <div className="small">A designar</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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

export default ProgramaPredicacion;
