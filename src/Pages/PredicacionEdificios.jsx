import React from 'react';
import Header from '../Components/Header';

import PredicacionEdificiosComponent from '../Components/PredicacionEdificios';

const PredicacionEdificios = () => {
    return (
        <>
            <Header />
            <main className="min-vh-100 bg-body-tertiary">
                <PredicacionEdificiosComponent />
            </main>
        </>
    );
};

export default PredicacionEdificios;
