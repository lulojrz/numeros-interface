import React, { useContext } from 'react';
import { NumerosContext } from '../context/NumerosContext';

const MisLlamados = () => {
    const { numeros } = useContext(NumerosContext);
    const loggedInUsername = localStorage.getItem('usuario');

    const misLlamados = numeros
        .filter(n => {
            const usuario = n.ultUsuario;
            const nombreUsuario = typeof usuario === 'string' ? usuario : usuario?.usuario;
            return nombreUsuario === loggedInUsername;
        })
        .sort((a, b) => new Date(b.ultimaFecha || 0) - new Date(a.ultimaFecha || 0));

    return (
        <div className="mt-4">
            <h3 className="mb-4">Mis Llamados Recientes</h3>
            {misLlamados.length === 0 ? (
                <p className="text-muted">No has realizado llamados aún.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Dirección</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {misLlamados.map(llamado => (
                                <tr key={llamado.id}>
                                    <td>{llamado.numero}</td>
                                    <td>{llamado.direccion}</td>
                                    <td>
                                        {llamado.ultimaFecha 
                                            ? (() => {
                                                const fechaStr = llamado.ultimaFecha.split('T')[0];
                                                const partes = fechaStr.split('-');
                                                return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : llamado.ultimaFecha;
                                            })()
                                            : "No registrado"
                                        }
                                    </td>
                                    <td>
                                        {llamado.contesta ? (
                                            <span className="badge bg-success">Contesta</span>
                                        ) : (
                                            <span className="badge bg-warning text-dark">No Contesta</span>
                                        )}
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

export default MisLlamados;
