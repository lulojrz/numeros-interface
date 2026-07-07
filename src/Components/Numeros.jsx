import React, { useEffect, useState } from 'react'
import {NumerosContext} from '../context/NumerosContext'
import { useContext } from 'react'
import PantallaNumero from './PantallaNumero'
const Numeros = () => {
    const {numeros,setNumero,numero,cambiarEstadoNumero}=useContext(NumerosContext)
    const [numeroAzar,setnumeroAzar]=useState(0); 
    const filtrador = numeros.filter((num)=> num.contesta===false && num.tocar !== false)
    
    useEffect(()=>{
      if (filtrador.length > 0) {
        const numerosito = Math.floor(Math.random() * filtrador.length)
        setnumeroAzar(numerosito);
        setNumero(filtrador[numerosito]?.number);
      }
     } ,[numeros])

    
   
     
   

  return (
    <>
      <PantallaNumero numero = {numero} cambiarEstadoNumero={cambiarEstadoNumero} objeto={filtrador[numeroAzar]}></PantallaNumero>
      
    </>
  
  )
}

export default Numeros