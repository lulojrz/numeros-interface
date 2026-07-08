import React, { useContext } from 'react';
import MisReservas from './MisReservas';
import { NumerosContext } from '../context/NumerosContext';

const TerritoriosPersonales = () => {
    const { numeros } = useContext(NumerosContext);
    const loggedInUsername = localStorage.getItem('usuario');

    const tieneReservas = numeros.some(n => n.reservado === true && n.reservadoA?.usuario === loggedInUsername);

    return (
        <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '1rem' }}>
            {tieneReservas ? (
                <div className="mt-2">
                    <MisReservas hideEmpty={false} />
                </div>
            ) : (
                <>
                    <h3 className="text-primary mb-3 text-center">Territorios Personales</h3>
                    <p className="text-secondary mb-4 text-center" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        Los territorios personales son zonas de llamadas que se te asignan de forma exclusiva para que las trabajes durante un tiempo. 
                        Al solicitar un territorio, los números correspondientes a esa zona quedarán reservados a tu nombre y ningún otro usuario podrá verlos o llamarlos. 
                        Una vez que hayas terminado de realizar los llamados en esa área, deberás "devolver" el territorio para que quede disponible nuevamente en el sistema.
                    </p>
                    <div className="d-flex flex-wrap gap-3 justify-content-center mt-3">
                        <button className="btn btn-success px-4 py-2 fw-semibold shadow-sm">
                            <i className="bi bi-journal-plus me-2"></i>
                            Solicitar territorio personal
                        </button>
                       
                    </div>
                </>
            )}
        </div>
    );
};

export default TerritoriosPersonales;
