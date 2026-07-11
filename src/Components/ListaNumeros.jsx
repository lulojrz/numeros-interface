import React, { useState, useContext, useEffect } from 'react';

import { NumerosContext } from '../context/NumerosContext';

import FormularioEditar from './FormularioEditar';

const ListaNumeros = () => {
    const {
        numeros,
        eliminarNumero,
        seleccionado,
        setSeleccionado,
        productosFiltrados,
        busqueda,
        setBusqueda,
        filtroTerritorio,
        setFiltroTerritorio,
        filtroEdificio,
        setFiltroEdificio,
        filtroReservado,
        setFiltroReservado,
        actualizarReserva,
        sacarReservados
    } = useContext(NumerosContext);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuariosLista, setUsuariosLista] = useState([]);
    const [usuarioElegido, setUsuarioElegido] = useState("");

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`);
                if (response.ok) {
                    const data = await response.json();
                    setUsuariosLista(data);
                }
            } catch (error) {

            }
        };
        fetchUsuarios();
    }, []);

    const handleConfirmarReserva = () => {
        if (!usuarioElegido) {
            alert("Por favor seleccione un usuario.");
            return;
        }
        const usuarioObj = usuariosLista.find(u => u.usuario === usuarioElegido) || { usuario: usuarioElegido };
        actualizarReserva(productosFiltrados, usuarioObj);
        setMostrarModal(false);
        setUsuarioElegido("");
    };

    const numeroSeleccionado = numeros.find((num) => num.id === seleccionado);


    const territoriosUnicos = [...new Set(numeros.map(n => n.territorio).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    const edificiosUnicos = [...new Set(numeros.map(n => n.edificio).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

    const handleCancelarEdicion = () => {
        setSeleccionado(null);
    };

    return (
        <>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
                <div className="card shadow-sm p-3 border-0 bg-light" style={{ borderRadius: '0.75rem' }}>
                    <h6 className="mb-3 text-secondary fw-bold">Filtros de Búsqueda</h6>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-semibold mb-1">Dirección</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Buscar calle..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-semibold mb-1">Territorio</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroTerritorio}
                                onChange={(e) => setFiltroTerritorio(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {territoriosUnicos.map((t, idx) => (
                                    <option key={idx} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-semibold mb-1">Edificio</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroEdificio}
                                onChange={(e) => setFiltroEdificio(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {edificiosUnicos.map((m, idx) => (
                                    <option key={idx} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-semibold mb-1">Estado</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroReservado}
                                onChange={(e) => setFiltroReservado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="si">Reservados</option>
                                <option value="no">Disponibles</option>
                            </select>
                        </div>

                        <div className="col-12 mt-3 pt-3 border-top">
                            <div className="d-flex flex-wrap gap-2 justify-content-end">
                                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => {
                                    setBusqueda(""); setFiltroTerritorio(""); setFiltroEdificio(""); setFiltroReservado("");
                                }}>
                                    Limpiar Filtros
                                </button>
                                <button type="button" className="btn btn-success btn-sm px-3 shadow-sm" onClick={() => setMostrarModal(true)}>
                                    Reservar Filtrados
                                </button>
                                <button type="button" className="btn btn-danger btn-sm px-3 shadow-sm" onClick={() => sacarReservados(productosFiltrados)}>
                                    Liberar Filtrados
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div>
                <div className="container mt-4">
                    <h2 className="mb-4 text-center text-primary fw-bold">Lista de Números</h2>

                    {/* Vista Desktop */}
                    <div className="table-responsive shadow-sm rounded d-none d-md-block">
                        <table className="table table-hover table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" className="text-secondary fw-semibold">Número</th>
                                    <th scope="col" className="text-secondary fw-semibold">Dirección</th>
                                    <th scope="col" className="text-secondary fw-semibold">Territorio</th>
                                    <th scope="col" className="text-secondary fw-semibold">Edificio</th>
                                    <th scope="col" className="text-secondary fw-semibold">Contesta</th>
                                    <th scope="col" className="text-secondary fw-semibold">Última Fecha (Y-MM-DD)</th>
                                    <th scope="col" className="text-secondary fw-semibold">Último Usuario</th>
                                    <th scope="col" className="text-secondary fw-semibold">Reservado</th>
                                    <th scope="col" className="text-secondary fw-semibold">ReservadoA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados && productosFiltrados.length > 0 ? (
                                    productosFiltrados.map((num) => (
                                        <tr key={num.id}>
                                            <td className="fw-bold text-nowrap">{num.numero}</td>
                                            <td>{num.direccion}</td>
                                            <td>{num.territorio}</td>
                                            <td>{num.edificio}</td>
                                            <td>
                                                {num.contesta ?
                                                    <span className="badge bg-success">Sí</span> :
                                                    <span className="badge bg-secondary">No</span>
                                                }
                                            </td>
                                            <td className="text-muted">{num.ultimaFecha.slice(0, 10)}</td>
                                            <td className="text-muted fw-semibold">
                                                {num.ultUsuario ? (num.ultUsuario.usuario || 'Sí') : '-'}
                                            </td>
                                            <td>
                                                {num.reservado ? <span className="badge bg-success">Sí</span> : <span className="badge bg-secondary">No</span>}
                                            </td>
                                            <td className="text-muted fw-semibold">{num.reservadoA?.usuario || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-muted">
                                            No se encontraron números disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile */}
                    <div className="d-md-none">
                        {productosFiltrados && productosFiltrados.length > 0 ? (
                            productosFiltrados.map((num) => (
                                <div key={num.id} className="card shadow-sm mb-3 border-0 rounded-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title text-primary fw-bold mb-0">{num.numero}</h5>
                                            <span className="badge bg-light text-dark border">Terr: {num.territorio}</span>
                                        </div>
                                        <p className="card-text mb-2 text-muted small">
                                            <strong>Dirección:</strong> {num.direccion}
                                        </p>
                                        <div className="d-flex justify-content-between mb-2 text-muted small">
                                            <span><strong>Últ. Usr:</strong> {num.ultUsuario ? (num.ultUsuario.usuario || 'Sí') : '-'}</span>
                                            <span><strong>Contesta:</strong> {num.contesta ? <span className="badge bg-success">Sí</span> : <span className="badge bg-secondary">No</span>}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 text-muted small">
                                            <span><strong>Últ. Fecha:</strong> {num.ultimaFecha.slice(0, 10)}</span>
                                            <span><strong>Res:</strong> {num.reservado ? <span className="badge bg-success">Sí</span> : <span className="badge bg-secondary">No</span>}</span>
                                        </div>
                                        <p className="card-text mb-0 text-muted small">
                                            <strong>Reservado A:</strong> {num.reservadoA?.usuario || '-'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted border rounded shadow-sm bg-white">
                                No se encontraron números disponibles.
                            </div>
                        )}
                    </div>
                </div>
                {numeroSeleccionado && (
                    <FormularioEditar
                        handleCancelarEdicion={handleCancelarEdicion}
                        numero={numeroSeleccionado}
                    />
                )}
            </div>
            {mostrarModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reservar Números</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Seleccione el usuario para reservar los números filtrados ({productosFiltrados.length}):</p>
                                <select className="form-select" value={usuarioElegido} onChange={(e) => setUsuarioElegido(e.target.value)}>
                                    <option value="">-- Seleccionar Usuario --</option>
                                    {usuariosLista.map((u) => (
                                        <option key={u.id || u.usuario} value={u.usuario}>{u.usuario}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="button" className="btn btn-primary" onClick={handleConfirmarReserva}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default ListaNumeros;