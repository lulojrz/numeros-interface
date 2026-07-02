import React, { useContext , useState} from 'react'
import { NumerosContext } from '../context/NumerosContext'
import FormularioAgregar from '../Components/FormularioAgregar.jsx'
import ListaNumeros from '../Components/ListaNumeros.jsx'
import { Link } from 'react-router'

const Admin = () => {
  const {numeros}= useContext(NumerosContext)
  const numerosContestados = numeros.filter(numero => numero.contesta);
  const [clickeditar,setClickeditar]= useState(false)
  const [clickagregar,setClickagregar]= useState(false)

  return (
 

<div className='container my-5'> 
    <div className='card shadow-lg p-4'> 
        
       
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
            <h1 className="h2 mb-2 mb-md-0">Panel de Administracion</h1> 
            <div className="d-flex gap-2 align-items-center">
                <Link to="/admin/perfil" className="btn btn-outline-secondary">
                    Mi Perfil
                </Link>
                <button className='btn btn-danger' >
                    <Link to={"/"} className="text-white text-decoration-none">Cancelar</Link>
                </button>
            </div>
        </div>

        <h3 className="h5">Elija una opcion</h3>

       
        <div className='container-buttons d-grid gap-3 d-md-flex mt-3 mb-4'>
            <button 
                className={`btn flex-fill fw-semibold ${clickeditar && !clickagregar ? 'btn-primary' : 'btn-outline-primary'}`} 
                onClick={()=>{setClickeditar(!clickeditar);setClickagregar(false)}}
            >
                Editar/Borrar Producto
            </button>
            <button 
                className={`btn flex-fill fw-semibold ${clickagregar && !clickeditar ? 'btn-success' : 'btn-outline-success'}`}
                onClick={()=>{setClickagregar(!clickagregar);setClickeditar(false)}}
            >
                Agregar Nuevo
            </button>
            <Link to="/admin/usuarios" className="btn btn-outline-info flex-fill fw-semibold">
                Gestión de Usuarios
            </Link>
        </div>
        <h1>Progreso</h1>
        <h4>Números contestados: {
        numerosContestados!=0? 
         Math.round( (numerosContestados.length / numeros.length)*100) + "%"   : 0  + "% "
    
         }</h4>

        <hr />

      
        {clickeditar && clickagregar==false? 
            <ListaNumeros></ListaNumeros>
            : <FormularioAgregar></FormularioAgregar> 
        }

    </div> 
</div >
  )
}

export default Admin