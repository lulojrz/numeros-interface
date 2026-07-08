import React, { useContext , useState, useEffect} from 'react'
import { NumerosContext } from '../context/NumerosContext'
import FormularioAgregar from '../Components/FormularioAgregar.jsx'
import ListaNumeros from '../Components/ListaNumeros.jsx'
import MisLlamados from '../Components/MisLlamados.jsx'
import MisReservas from '../Components/MisReservas.jsx'
import PorEliminar from '../Components/PorEliminar.jsx'
import { Link } from 'react-router'

const Admin = () => {
  const {numeros}= useContext(NumerosContext)
  const numerosContestados = numeros.filter(numero => numero.contesta);
  const [clickeditar,setClickeditar]= useState(false)
  const [clickagregar,setClickagregar]= useState(false)
  const [clickllamados,setClickllamados]= useState(false)
  const [clickReservas, setClickReservas] = useState(false)
  const [clickPorEliminar,setClickPorEliminar]= useState(false)
  const [isANC, setIsANC] = useState(false)
  const [isPrivileged, setIsPrivileged] = useState(false)

  useEffect(() => {
    const fetchPrivilegio = async () => {
      try {
        const response = await fetch('http://localhost:8080/usuarios');
        if (response.ok) {
          const data = await response.json();
          const loggedInUsername = localStorage.getItem('usuario');
          const currentUser = data.find(u => u.usuario === loggedInUsername);
          if (currentUser?.privilegio === 'ANC') {
            setIsANC(true);
          }
          if (currentUser?.privilegio === 'ANC' || currentUser?.privilegio === 'SM') {
            setIsPrivileged(true);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrivilegio();
  }, []);

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
            {isPrivileged && (
            <>
                <button 
                    className={`btn flex-fill fw-semibold ${clickeditar ? 'btn-primary' : 'btn-outline-primary'}`} 
                    onClick={()=>{setClickeditar(true); setClickagregar(false); setClickllamados(false); setClickPorEliminar(false); setClickReservas(false);}}
                >
                    Editar/Borrar Producto
                </button>
                <button 
                    className={`btn flex-fill fw-semibold ${clickagregar && !clickeditar && !clickllamados && !clickPorEliminar && !clickReservas ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={()=>{setClickagregar(true); setClickeditar(false); setClickllamados(false); setClickPorEliminar(false); setClickReservas(false);}}
                >
                    Agregar Nuevo
                </button>
            </>
            )}
            <button 
                className={`btn flex-fill fw-semibold ${clickllamados ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                onClick={()=>{setClickllamados(true); setClickeditar(false); setClickagregar(false); setClickPorEliminar(false); setClickReservas(false);}}
            >
                Mis Llamados
            </button>
            <button 
                className={`btn flex-fill fw-semibold ${clickReservas ? 'btn-info text-white' : 'btn-outline-info'}`}
                onClick={()=>{setClickReservas(true); setClickllamados(false); setClickeditar(false); setClickagregar(false); setClickPorEliminar(false);}}
            >
                Mis Reservas
            </button>
            {isPrivileged && (
            <button 
                className={`btn flex-fill fw-semibold ${clickPorEliminar ? 'btn-danger text-white' : 'btn-outline-danger'}`}
                onClick={()=>{setClickPorEliminar(true); setClickeditar(false); setClickagregar(false); setClickllamados(false); setClickReservas(false);}}
            >
                Por Eliminar
            </button>
            )}
            {isANC && (
                <Link to="/admin/usuarios" className="btn btn-outline-info flex-fill fw-semibold">
                    Gestión de Usuarios
                </Link>
            )}
        </div>
        {clickeditar && isPrivileged && (
            <div className="mb-4">
                <h3 className="h4 text-primary">Progreso</h3>
                <h5 className="text-secondary">Números contestados: {
                    numerosContestados.length !== 0 ? 
                    Math.round((numerosContestados.length / numeros.length) * 100) + "%" : "0%"
                }</h5>
                <hr />
            </div>
        )}

      
        {clickPorEliminar && isPrivileged ? (
            <PorEliminar />
        ) : clickllamados ? (
            <MisLlamados />
        ) : clickReservas ? (
            <MisReservas />
        ) : clickeditar && isPrivileged ? (
            <ListaNumeros />
        ) : isPrivileged ? (
            <FormularioAgregar />
        ) : (
            <MisLlamados />
        )}

    </div> 
</div >
  )
}

export default Admin