import React from 'react';
import Header from '../Components/Header';
import PredicacionTelefonicaComponent from '../Components/PredicacionTelefonica';

const PredicacionTelefonica = ({ defaultTab = 'llamar' }) => {
    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary">
                <PredicacionTelefonicaComponent defaultTab={defaultTab} />
            </main>
        </>
    );
};

export default PredicacionTelefonica;
