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
        actualizarReserva,
        sacarReservados
    } = useContext(NumerosContext);


    const numeroSeleccionado = numeros.find((num) => num.id === seleccionado);

    const handleCancelarEdicion = () => {
        setSeleccionado(null);
    };

    return (
        <>
            <form className="mb-3" onSubmit={(e) => e.preventDefault()}>
                <label className="form-label"><strong>Búsqueda</strong></label>
                <div className="row g-2">
                    <div className="col-md">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="buscar calle..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                            <button type="submit" className="btn btn-primary" onClick={() => actualizarReserva(productosFiltrados)}>
                                Reservar
                            </button>
                            <button type="submit" className="btn btn-secondary" onClick={() => sacarReservados(productosFiltrados)}>
                                Sacar Reservados
                            </button>
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
                                    <th scope="col" className="text-secondary fw-semibold">Última Fecha</th>
                                    <th scope="col" className="text-secondary fw-semibold">Reservado</th>
                                    <th scope="col" className="text-center text-secondary fw-semibold">Acciones</th>
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
                                            <td className="text-muted">{num.ultimaFecha}</td>
                                            <td>
                                                {num.reservado ? <span className="badge bg-success">Sí</span> : <span className="badge bg-secondary">No</span>}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className='btn btn-outline-secondary btn-sm'
                                                        onClick={() => setSeleccionado(num.id)}
                                                    >
                                                        <i className="bi bi-pencil"></i> Editar
                                                    </button>
                                                    <button
                                                        className='btn btn-outline-danger btn-sm'
                                                        onClick={() => eliminarNumero(num.id)}
                                                    >
                                                        <i className="bi bi-trash"></i> Borrar
                                                    </button>
                                                </div>
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