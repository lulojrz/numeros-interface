import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import Numeros from '../Components/Numeros'
import { useContext } from 'react'
import { NumerosContext } from '../context/NumerosContext'
import Loading from '../Components/Loading'
import TerritoriosPersonales from '../Components/TerritoriosPersonales'
import { Link } from 'react-router-dom'


const Home = () => {
  const {numero,numeros,error,loading,setNumero, isAuthenticated} = useContext(NumerosContext)
  const [activeTab, setActiveTab] = useState('llamar')

  return (
    <>
      <Header></Header>
      <main className="min-vh-100 bg-light pb-5">
        {!isAuthenticated ? (
            <div className="container py-5 mt-5 text-center">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h1 className="display-4 fw-bold text-primary mb-4">Bienvenido a CRM Panel</h1>
                        <p className="lead text-secondary mb-5">
                            La herramienta definitiva para gestionar tus contactos y campañas telefónicas. 
                            Inicia sesión para acceder a los números asignados y comenzar a realizar llamadas.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg px-5 rounded-pill shadow">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        ) : (
            <div className="container py-4">
                <div className="d-flex flex-wrap justify-content-center mb-4 gap-3">
                    <button 
                        className={`btn fw-semibold px-4 rounded-pill ${activeTab === 'llamar' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('llamar')}
                    >
                        Realizar Llamadas
                    </button>
                    <button 
                        className={`btn fw-semibold px-4 rounded-pill ${activeTab === 'territorios' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('territorios')}
                    >
                        Territorios Personales
                    </button>
                </div>

                {activeTab === 'llamar' ? (
                    <>
                        <div className="text-center mb-4">
                            <h3 className="fw-semibold text-secondary">Número a llamar:</h3>
                        </div>
                        {loading ? <Loading /> : <Numeros setNumero={setNumero} />}
                    </>
                ) : (
                    <TerritoriosPersonales />
                )}
            </div>
        )}
      </main>
    </>
  )
}

export default Home