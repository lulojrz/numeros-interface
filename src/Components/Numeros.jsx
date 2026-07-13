import React, { useEffect, useState } from 'react'
import {NumerosContext} from '../context/NumerosContext'
import { useContext } from 'react'
import PantallaNumero from './PantallaNumero'
const Numeros = () => {
    const {numeros,setNumero,numero,cambiarEstadoNumero}=useContext(NumerosContext)
    const [numeroAzar,setnumeroAzar]=useState(0); 
    const loggedInUsername = localStorage.getItem('usuario');
    const filtrador = numeros.filter((num) => {
      const isReservedForOther = num.reservado && num.reservadoA?.usuario !== loggedInUsername;
      return num.contesta === false && num.tocar !== false && !isReservedForOther;
    }).sort((a, b) => new Date(a.ultimaFecha || 0) - new Date(b.ultimaFecha || 0));
    
    useEffect(()=>{
      if (filtrador.length > 0) {
        setnumeroAzar(0);
        setNumero(filtrador[0]?.numero);
      }
     } ,[numeros])

  return (
    <>
      <PantallaNumero numero = {numero} cambiarEstadoNumero={cambiarEstadoNumero} objeto={filtrador[numeroAzar]}></PantallaNumero>
      
    </>
  
  )
}

export default Numeros