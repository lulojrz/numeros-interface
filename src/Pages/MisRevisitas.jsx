import React from 'react';
import Header from '../Components/Header';
import MisRevisitasComponent from '../Components/MisRevisitas';

const MisRevisitas = () => {
    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary">
                <MisRevisitasComponent />
            </main>
        </>
    );
};

export default MisRevisitas;
