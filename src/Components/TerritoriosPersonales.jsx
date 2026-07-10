import React, { useContext } from 'react';
import MisReservas from './MisReservas';
import { NumerosContext } from '../context/NumerosContext';

const TerritoriosPersonales = () => {
    const { numeros } = useContext(NumerosContext);
    const loggedInUsername = localStorage.getItem('usuario');

    const tieneReservas = numeros.some(n => n.reservado === true && n.reservadoA?.usuario === loggedInUsername);

    const enviarMensaje = (e) => {
        e.preventDefault();
        const especificacion = e.target.querySelector('input[type="text"]').value;
        const mensaje = encodeURIComponent(`Hola! Me gustaria pedir un territorio personal en la zona de ${especificacion}`);
        const url = `https://api.whatsapp.com/send?phone=5491139562904&text=${mensaje}`;
        window.open(url, '_blank');
    }

    return (
        <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '1rem' }}>
            {tieneReservas ? (
                <div className="mt-2">
                    <MisReservas hideEmpty={false} />
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '3rem' }}></i>
                        <h3 className="text-primary mt-2">Territorios Personales</h3>
                    </div>
                    
                    <div className="alert alert-primary shadow-sm mb-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '0.75rem' }}>
                        <h5 className="alert-heading fw-bold"><i className="bi bi-info-circle me-2"></i>¿Cómo funciona?</h5>
                        <p className="mb-0">
                            Los territorios personales son zonas de llamadas que se te asignan de forma exclusiva para que las trabajes durante un tiempo.
                            Al solicitar un territorio, los números correspondientes a esa zona quedarán reservados a tu nombre y ningún otro usuario podrá verlos o llamarlos.
                            Una vez que hayas terminado de realizar los llamados en esa área, deberás "devolver" el territorio para que quede disponible nuevamente en el sistema.
                        </p>
                    </div>

                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                        <form onSubmit={enviarMensaje} className="p-3 bg-white border rounded-3 shadow-sm">
                            <label htmlFor="territorio" className="form-label fw-semibold text-secondary mb-3">
                                <i className="bi bi-whatsapp text-success me-2"></i>
                                Solicita tu territorio por WhatsApp:
                            </label>
                            
                            <div className="input-group input-group-lg mb-2">
                                <span className="input-group-text bg-light text-secondary">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Ej: Cabildo al 2000, cerca del Parque..." 
                                    required
                                />
                                <button className="btn btn-success fw-semibold px-4" type="submit">
                                    Enviar
                                </button>
                            </div>
                            <div className="form-text text-muted small text-center mt-2">
                                Serás redirigido a WhatsApp para enviar tu solicitud al administrador.
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default TerritoriosPersonales;
