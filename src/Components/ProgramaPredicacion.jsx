import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import Header from './Header';

// Devuelve el lunes (00:00:00 local) de la semana correspondiente a una fecha YYYY-MM-DD
const obtenerInicioSemana = (fechaStr) => {
    const d = new Date(`${fechaStr}T12:00:00`);
    const diaSemana = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diffALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    d.setDate(d.getDate() + diffALunes);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatearRangoSemana = (lunesStr) => {
    const inicio = new Date(`${lunesStr}T12:00:00`);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    const optInicio = { day: 'numeric', month: inicio.getMonth() !== fin.getMonth() ? 'short' : undefined };
    const optFin = { day: 'numeric', month: 'long' };

    return `Del ${inicio.toLocaleDateString('es-AR', optInicio)} al ${fin.toLocaleDateString('es-AR', optFin)}`;
};

const ProgramaPredicacion = () => {
    const navigate = useNavigate();
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [indiceSemana, setIndiceSemana] = useState(0);

    useEffect(() => {
        const fetchSalidas = async () => {
            try {
                const res = await fetch(`${api}/salidas/traer`);
                if (res.ok) setSalidas(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSalidas();
    }, [api]);

    // Fecha local de hoy (evita desfase UTC a partir de las 21:00 hs en Argentina)
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const lunesSemanaActual = obtenerInicioSemana(hoy);

    // Agrupar salidas futuras por semana (Lunes a Domingo)
    const semanas = useMemo(() => {
        const futuras = salidas
            .filter(s => s.fecha >= hoy)
            .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || ''));

        const mapaSemanas = new Map();
        futuras.forEach(salida => {
            const lunes = obtenerInicioSemana(salida.fecha);
            if (!mapaSemanas.has(lunes)) {
                mapaSemanas.set(lunes, []);
            }
            mapaSemanas.get(lunes).push(salida);
        });

        return Array.from(mapaSemanas.entries()).map(([lunes, items]) => ({
            lunes,
            titulo: formatearRangoSemana(lunes),
            esActual: lunes === lunesSemanaActual,
            salidas: items
        }));
    }, [salidas, hoy, lunesSemanaActual]);

    // Ajustar índice si cambia la lista de semanas
    useEffect(() => {
        if (indiceSemana >= semanas.length) {
            setIndiceSemana(0);
        }
    }, [semanas.length, indiceSemana]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-vh-100 bg-body-tertiary">
                    <div className="mt-4"><Loading type="cards" count={3} /></div>
                </main>
            </>
        );
    }

    const semanaActiva = semanas[indiceSemana] || null;

    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary">
                <div className="container mt-4 mb-5 py-1" style={{ maxWidth: '800px' }}>
                    <h2 className="h4 text-primary fw-bold mb-4 text-center">
                        <i className="bi bi-calendar3 me-2"></i>Programa de Salidas
                    </h2>

                    {!semanaActiva ? (
                        <div className="alert alert-info text-center shadow-sm border-0">
                            <i className="bi bi-info-circle me-2"></i>No hay salidas programadas para los próximos días.
                        </div>
                    ) : (
                        <>
                            {/* Selector de Semana */}
                            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '36px', height: '36px' }}
                                        onClick={() => setIndiceSemana(i => Math.max(0, i - 1))}
                                        disabled={indiceSemana === 0}
                                        title="Semana anterior"
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    <div className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                            <span className="fw-bold text-body">{semanaActiva.titulo}</span>
                                            {semanaActiva.esActual && (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                                    Esta semana
                                                </span>
                                            )}
                                        </div>
                                        <small className="text-muted">
                                            Semana {indiceSemana + 1} de {semanas.length} ({semanaActiva.salidas.length} {semanaActiva.salidas.length === 1 ? 'salida' : 'salidas'})
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '36px', height: '36px' }}
                                        onClick={() => setIndiceSemana(i => Math.min(semanas.length - 1, i + 1))}
                                        disabled={indiceSemana >= semanas.length - 1}
                                        title="Semana siguiente"
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>

                                {/* Pills rápidos de semanas si hay más de 1 */}
                                {semanas.length > 1 && (
                                    <div className="card-footer bg-transparent border-top py-2 px-3 d-flex justify-content-center flex-wrap gap-1">
                                        {semanas.map((sem, idx) => (
                                            <button
                                                key={sem.lunes}
                                                type="button"
                                                onClick={() => setIndiceSemana(idx)}
                                                className={`btn btn-sm rounded-pill px-3 ${idx === indiceSemana ? 'btn-primary fw-semibold' : 'btn-outline-secondary border-0'}`}
                                            >
                                                {sem.esActual ? 'Actual' : `Sem. ${idx + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tarjetas de la semana seleccionada */}
                            <div className="row g-3">
                                {semanaActiva.salidas.map(s => {
                                    const d = new Date(`${s.fecha}T12:00:00`);
                                    const diaStr = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                                    const esHoy = s.fecha === hoy;
                                    const territoriosAsignados = [s.territorio, s.territorio2, s.territorio3].filter(Boolean);

                                    return (
                                        <div className="col-12" key={s.id}>
                                            <div className={`card shadow-sm border-0 border-start ${esHoy ? 'border-success' : 'border-primary'} border-4 rounded-3 h-100`}>
                                                <div className="card-body py-3">
                                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2 mb-sm-0">
                                                            <h5 className="fw-bold m-0 text-body text-capitalize">{diaStr}</h5>
                                                            {esHoy && <span className="badge bg-success rounded-pill">Hoy</span>}
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <span className="badge bg-primary fs-6">
                                                                <i className="bi bi-people-fill me-1"></i> {s.grupos || 'Toda la congregación'}
                                                            </span>
                                                            <span className="badge bg-secondary fs-6">
                                                                <i className="bi bi-clock me-1"></i> {s.hora} hs
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <hr className="my-2 opacity-25" />
                                                    <div className="row g-2 align-items-center">
                                                        <div className="col-12 col-md-4">
                                                            <div className="d-flex align-items-center text-muted">
                                                                <div className="bg-body-tertiary rounded-circle p-2 me-3 text-danger">
                                                                    <i className="bi bi-geo-alt-fill fs-5"></i>
                                                                </div>
                                                                <div>
                                                                    <div className="small fw-bold text-uppercase">Encuentro</div>
                                                                    <div className="text-body">{s.puntoEncuentro}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <div className="d-flex align-items-center text-muted">
                                                                <div className="bg-body-tertiary rounded-circle p-2 me-3 text-info">
                                                                    <i className="bi bi-person-fill fs-5"></i>
                                                                </div>
                                                                <div>
                                                                    <div className="small fw-bold text-uppercase">Conductor</div>
                                                                    <div className="text-body">{s.conductor?.nombre} {s.conductor?.apellido}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            {territoriosAsignados.length > 0 ? (
                                                                <div className="d-flex flex-column gap-2 w-100">
                                                                    {territoriosAsignados.map((terr, idx) => (
                                                                        <div
                                                                            key={terr.id || idx}
                                                                            className="d-flex align-items-center justify-content-between text-muted w-100"
                                                                        >
                                                                            <div className="d-flex align-items-center">
                                                                                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 text-success">
                                                                                    <i className="bi bi-map-fill fs-5"></i>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="small fw-bold text-uppercase text-success">
                                                                                        {territoriosAsignados.length > 1 ? `Territorio ${idx + 1}` : 'Territorio'}
                                                                                    </div>
                                                                                    <div className="text-body fw-bold">Nº {terr.numero}</div>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm"
                                                                                onClick={() => navigate('/edificios', { state: { territorioId: terr.id, territorioNumero: terr.numero } })}
                                                                            >
                                                                                <i className="bi bi-box-arrow-in-right me-1"></i> Ir
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex align-items-center text-muted opacity-50">
                                                                    <div className="bg-body-tertiary rounded-circle p-2 me-3">
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
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default ProgramaPredicacion;