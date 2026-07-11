import { useState } from 'react'
import Home from './Pages/Home'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login'
import Admin from './Pages/Admin'
import AdminUsuarios from './Pages/AdminUsuarios'
import CambiarContrasena from './Pages/CambiarContrasena'
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
      <Route path='/admin/usuarios' element={
        <RutasProtegidas isAuthenticated={isAuthenticated} rolesPermitidos={['ROLE_ANC']}><AdminUsuarios/></RutasProtegidas>
      }/>
      <Route path='/admin/perfil' element={
        <RutasProtegidas isAuthenticated={isAuthenticated}><CambiarContrasena/></RutasProtegidas>
      }/>
     </Routes>
    </>
  )
}

export default App
