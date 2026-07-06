import React, { useContext } from 'react';
import { NumerosContext } from '../context/NumerosContext';

const PorEliminar = () => {
    const { numeros, eliminarNumero } = useContext(NumerosContext);
    
    const porEliminar = numeros.filter(n => n.tocar === false);

    return (
        <div className="mt-4">
            <div className="alert alert-warning d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                <div>
                    <strong>¡Atención!</strong> Estos números están marcados para no ser tocados (tocar: false) y deberían ser revisados o eliminados.
                </div>
            </div>
            {porEliminar.length === 0 ? (
                <p className="text-muted">No hay números marcados por eliminar.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Dirección</th>
                                <th>Territorio</th>
                                <th>Manzana</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {porEliminar.map(num => (
                                <tr key={num.id}>
                                    <td className="fw-bold">{num.numero}</td>
                                    <td>{num.direccion}</td>
                                    <td>{num.territorio}</td>
                                    <td>{num.manzana}</td>
                                    <td>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => eliminarNumero(num.id)}
                                        >
                                            <i className="bi bi-trash"></i> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PorEliminar;
