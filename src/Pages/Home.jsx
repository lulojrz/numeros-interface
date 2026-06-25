import React, { useEffect } from 'react'
import Header from '../components/Header'
import Numeros from '../Components/Numeros'
import { useContext } from 'react'
import { NumerosContext } from '../context/NumerosContext'
import Loading from '../Components/Loading'


const Home = () => {
  const {numero,numeros,error,loading,setNumero, isAuthenticated,setIsAuth} = useContext(NumerosContext)

  return (
    <>
      <Header></Header>
      <main>
        <div>
          <h3>Numero a llamar:</h3>
        </div>
        {
          loading? <Loading /> : <Numeros setNumero={setNumero} ></Numeros>
        }


      </main>



    </>
  )
}

export default Home