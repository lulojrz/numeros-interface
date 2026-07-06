import React from 'react';

const TerritoriosPersonales = () => {
    return (
        <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '1rem' }}>
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
                <button className="btn btn-warning px-4 py-2 fw-semibold text-dark shadow-sm">
                    <i className="bi bi-arrow-return-left me-2"></i>
                    Devolver territorio
                </button>
            </div>
        </div>
    );
};

export default TerritoriosPersonales;
