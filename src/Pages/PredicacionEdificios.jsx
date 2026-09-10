import React from 'react';
import Header from '../Components/Header';

const PredicacionEdificios = () => {
    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary pb-5">
                <div className="container py-5 text-center">
                    <h1 className="fw-bold text-primary mb-4">
                        <i className="bi bi-building me-3"></i>
                        Predicación Edificios
                    </h1>
                    <p className="text-muted">Próximamente...</p>
                </div>
            </main>
        </>
    );
};

export default PredicacionEdificios;
