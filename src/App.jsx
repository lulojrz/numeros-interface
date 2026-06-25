import { useState } from 'react'
import Home from './Pages/Home'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login'
import Admin from './Pages/Admin'
import { useContext } from 'react'
import { NumerosContext } from './context/NumerosContext'
import RutasProtegidas from './rutas/RutasProtegidas'



function App() {
  
  const {numero,numeros,error,loading,setNumero, isAuthenticated,setIsAuth} = useContext(NumerosContext)
  return (
    <>
     <Routes>
      <Route path="/" element={<Home numero={numero} numeros = {numeros} error = {error} loading ={loading} setNumero = {setNumero} />} />
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/admin' element={
        <RutasProtegidas isAuthenticated={isAuthenticated}><Admin/></RutasProtegidas>
      }/>
     </Routes>
    </>
  )
}

export default App
