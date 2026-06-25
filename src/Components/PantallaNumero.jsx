import React from 'react'
import { useContext } from 'react'
import { NumerosContext } from '../context/NumerosContext'

const PantallaNumero = ({ objeto }) => {
    const { numero, cambiarEstadoNumero, actualizarNumero, eliminarNumero } = useContext(NumerosContext)
    const handleContestaClick = async () => {
        let objetoActualizado ={
            ...objeto,
            ultimaFecha: new Date().toISOString().split('T')[0]
        }

        let objetoAEditar = cambiarEstadoNumero(objetoActualizado, 'Contesta');
        
        if (objetoAEditar) {
            await actualizarNumero(objetoAEditar);
        }
    }
    const handleClickFecha = async () => {
        const objetoActualizado = {
            ...objeto,
            ultimaFecha: new Date().toISOString().split('T')[0]
        };
        try {
            await actualizarNumero(objetoActualizado);
            console.log("Actualización exitosa en el contexto");
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    }

    return (
        <div className="container p-3">

            <div
                className="card p-4 mb-4 bg-white"
                style={{
                    maxWidth: '450px',
                    margin: '0 auto',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    borderRadius: '12px'
                }}
            >
                <div className="card-body text-center p-0">
                    {objeto ? (
                        <>

                            <h2 className="card-title text-dark mb-3 fw-bold" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
                                {objeto.numero}
                            </h2>

                            <hr className="my-3" style={{ opacity: 0.1 }} />


                            <div className="text-start">
                                <p className="mb-2 text-dark" style={{ fontSize: '1.1rem' }}>
                                    <span className="text-muted fw-semibold me-2">Dirección:</span> 
                                    {objeto.direccion}
                                </p>
                                <p className="mb-2 text-dark" style={{ fontSize: '1.1rem' }}>
                                    <span className="text-muted fw-semibold me-2">Territorio:</span> 
                                    {objeto.territorio} - {objeto.manzana}
                                </p>
                                <p className="mb-0 text-dark" style={{ fontSize: '1.1rem' }}>
                                    <span className="text-muted fw-semibold me-2">Último llamado:</span> 
                                    {
                                        objeto.ultimaFecha 
                                        ? (() => {
                                            const fechaStr = objeto.ultimaFecha.split('T')[0];
                                            const partes = fechaStr.split('-');
                                            return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : objeto.ultimaFecha;
                                        })()
                                        : "No registrado"
                                    }
                                </p>
                            </div>
                        </>
                    ) : (

                        <h5 className="text-danger my-auto">No hay número para llamar</h5>
                    )}
                </div>
            </div>
            <div className="d-grid gap-3 col-10 mx-auto d-md-flex justify-content-md-center mt-4">

                {
                    objeto ? (
                        <>
                            <button
                                className="btn btn-success px-4 py-2 fw-semibold shadow-sm"
                                onClick={handleContestaClick}
                            >
                                Contesta
                            </button>
                            <button
                                className="btn btn-warning px-4 py-2 fw-semibold text-dark shadow-sm"
                                onClick={handleClickFecha}
                            >
                                No Contesta
                            </button>
                            <button
                                className="btn btn-danger px-4 py-2 fw-semibold shadow-sm"
                                onClick={() => eliminarNumero(objeto.id)}
                            >
                                Fuera de Servicio
                            </button>
                        </>
                    ) : null
                }

            </div>
        </div>

    )
}
export default PantallaNumero;