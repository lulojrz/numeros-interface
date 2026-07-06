import React, { useState, useContext } from 'react';

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
        filtroManzana,
        setFiltroManzana,
        filtroReservado,
        setFiltroReservado,
        actualizarReserva,
        sacarReservados
    } = useContext(NumerosContext);


    const numeroSeleccionado = numeros.find((num) => num.id === seleccionado);

    
    const territoriosUnicos = [...new Set(numeros.map(n => n.territorio).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    const manzanasUnicas = [...new Set(numeros.map(n => n.manzana).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

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
                            <label className="form-label text-muted small fw-semibold mb-1">Manzana</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroManzana}
                                onChange={(e) => setFiltroManzana(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {manzanasUnicas.map((m, idx) => (
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
                                    setBusqueda(""); setFiltroTerritorio(""); setFiltroManzana(""); setFiltroReservado("");
                                }}>
                                    Limpiar Filtros
                                </button>
                                <button type="button" className="btn btn-success btn-sm px-3 shadow-sm" onClick={() => actualizarReserva(productosFiltrados)}>
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

                    <div className="table-responsive shadow-sm rounded">
                        <table className="table table-hover table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" className="text-secondary fw-semibold">Número</th>
                                    <th scope="col" className="text-secondary fw-semibold">Dirección</th>
                                    <th scope="col" className="text-secondary fw-semibold">Territorio</th>
                                    <th scope="col" className="text-secondary fw-semibold">Manzana</th>
                                    <th scope="col" className="text-secondary fw-semibold">Contesta</th>
                                    <th scope="col" className="text-secondary fw-semibold">Última Fecha (Y-MM-DD)</th>
                                    <th scope="col" className="text-secondary fw-semibold">Último Usuario</th>
                                    <th scope="col" className="text-secondary fw-semibold">Reservado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados && productosFiltrados.length > 0 ? (
                                    productosFiltrados.map((num) => (
                                        <tr key={num.id}>
                                            <td className="fw-bold text-nowrap">{num.numero}</td>
                                            <td>{num.direccion}</td>
                                            <td>{num.territorio}</td>
                                            <td><span className="badge bg-light text-dark border" style={{ "textTransform": "uppercase" }}>{num.manzana}</span></td>
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
                                          
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No se encontraron números disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {numeroSeleccionado && (
                    <FormularioEditar
                        handleCancelarEdicion={handleCancelarEdicion}
                        numero={numeroSeleccionado}
                    />
                )}
            </div>
        </>
    );
}
export default ListaNumeros;