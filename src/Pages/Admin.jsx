import React, { useContext , useState, useEffect} from 'react'
import { NumerosContext } from '../context/NumerosContext'
import FormularioAgregar from '../Components/FormularioAgregar.jsx'
import ListaNumeros from '../Components/ListaNumeros.jsx'
import MisLlamados from '../Components/MisLlamados.jsx'
import PorEliminar from '../Components/PorEliminar.jsx'
import TerritoriosPersonales from '../Components/TerritoriosPersonales.jsx'
import GestionPuntos from '../Components/GestionPuntos.jsx'
import GestionPlantillas from '../Components/GestionPlantillas.jsx'
import MisTurnosPublicos from '../Components/MisTurnosPublicos.jsx'
import EstadisticasDashboard from '../Components/EstadisticasDashboard.jsx'
import { Link } from 'react-router-dom'

const Admin = () => {
  const {numeros}= useContext(NumerosContext)
  const numerosContestados = numeros.filter(numero => numero.contesta);
  const [clickeditar,setClickeditar]= useState(false)
  const [clickagregar,setClickagregar]= useState(false)
  const [clickllamados,setClickllamados]= useState(false)
  const [clickReservas, setClickReservas] = useState(false)
  const [clickPorEliminar,setClickPorEliminar]= useState(false)
  const [isANC, setIsANC] = useState(() => localStorage.getItem('privilegio') === 'ROLE_ANC')
  const [isFullAdmin, setIsFullAdmin] = useState(() => {
    const asig = (localStorage.getItem('asignacion') || '').trim().toLowerCase();
    return asig === 'soporte' || asig === 'servicio' || asig === 'territorios' || asig === 'servicio y territorios';
  })
  const [isTelefonicaAdmin, setIsTelefonicaAdmin] = useState(() => {
    const asig = (localStorage.getItem('asignacion') || '').trim().toLowerCase();
    return asig === 'soporte' || asig === 'servicio' || asig === 'territorios' || asig === 'servicio y territorios' || asig === 'territorios telefonicos/personales' || asig === 'territorios telefónicos/personales' || asig === 'territorios telefonicos' || asig === 'personales' || asig === 'territorios personales';
  })
  const [isPublicaAdmin, setIsPublicaAdmin] = useState(() => {
    const asig = (localStorage.getItem('asignacion') || '').trim().toLowerCase();
    return asig === 'soporte' || asig === 'servicio' || asig === 'territorios' || asig === 'servicio y territorios' || asig === 'publica' || asig === 'pública';
  })
  const [tabActiva, setTabActiva] = useState('telefonica')
  const [subTabPublica, setSubTabPublica] = useState('puntos')

  useEffect(() => {
    const fetchPrivilegio = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const loggedInUsername = localStorage.getItem('usuario');
          const currentUser = data.find(u => u.usuario === loggedInUsername);
          if (currentUser) {
            localStorage.setItem('asignacion', currentUser.asignacion || '');
            localStorage.setItem('privilegio', currentUser.privilegio || '');
            const asig = (currentUser.asignacion || '').trim().toLowerCase();
            
            if (asig === 'soporte' || asig === 'servicio' || asig === 'territorios' || asig === 'servicio y territorios') {
                setIsFullAdmin(true);
                setIsTelefonicaAdmin(true);
                setIsPublicaAdmin(true);
                setIsANC(true);
            } else if (asig === 'territorios telefonicos/personales' || asig === 'territorios telefónicos/personales' || asig === 'territorios telefonicos' || asig === 'personales' || asig === 'territorios personales') {
                setIsTelefonicaAdmin(true);
            } else if (asig === 'publica' || asig === 'pública') {
                setIsPublicaAdmin(true);
            }
            
            if (currentUser.privilegio === 'ROLE_ANC') {
              setIsANC(true);
            }
          }
        }
      } catch (error) {

      }
    };
    fetchPrivilegio();
  }, []);

  return (
 

<div className='container my-5'> 
    <div className='card shadow-lg p-4'> 
        
       
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
            <h1 className="h2 mb-2 mb-md-0">Panel de Administracion</h1> 
            <div className="d-flex gap-2 align-items-center flex-wrap">
                {isANC && (
                    <Link to="/admin/usuarios" className="btn btn-info fw-semibold text-body shadow-sm">
                        <i className="bi bi-people-fill me-2"></i>Gestión de Usuarios
                    </Link>
                )}
                <Link to="/admin/perfil" className="btn btn-outline-secondary">
                    Mi Perfil
                </Link>
                <Link to="/" className="btn btn-danger">
                    Cancelar
                </Link>
            </div>
        </div>

        {/* Pestañas Principales */}
        <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'telefonica' ? 'active' : 'text-secondary'}`} 
                    onClick={() => setTabActiva('telefonica')}
                    style={tabActiva === 'telefonica' ? { color: '#0d6efd' } : {}}
                >
                    <i className="bi bi-telephone-fill me-2"></i>Predicación Telefónica
                </button>
            </li>
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'publica' ? 'active' : 'text-secondary'}`} 
                    onClick={() => setTabActiva('publica')}
                    style={tabActiva === 'publica' ? { color: '#198754' } : {}}
                >
                    <i className="bi bi-geo-alt-fill me-2"></i>Predicación Pública
                </button>
            </li>
            {isFullAdmin && (
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'estadisticas' ? 'active' : 'text-secondary'}`} 
                    onClick={() => setTabActiva('estadisticas')}
                    style={tabActiva === 'estadisticas' ? { color: '#6f42c1' } : {}}
                >
                    <i className="bi bi-graph-up me-2"></i>Estadísticas
                </button>
            </li>
            )}
        </ul>

        {tabActiva === 'telefonica' && (
            <>
                <h3 className="h5">Elija una opcion (Telefónica)</h3>

       
        <div className='container-buttons d-grid gap-3 d-md-flex mt-3 mb-4'>
            {isTelefonicaAdmin && (
            <>
                <button 
                    className={`btn flex-fill fw-semibold ${clickeditar ? 'btn-primary' : 'btn-outline-primary'}`} 
                    onClick={()=>{setClickeditar(true); setClickagregar(false); setClickllamados(false); setClickPorEliminar(false); setClickReservas(false);}}
                >
                    Editar Numeros
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
                className={`btn flex-fill fw-semibold ${clickllamados ? 'btn-warning text-body' : 'btn-outline-warning text-body'}`}
                onClick={()=>{setClickllamados(true); setClickeditar(false); setClickagregar(false); setClickPorEliminar(false); setClickReservas(false);}}
            >
                Mis Llamados
            </button>
            <button 
                className={`btn flex-fill fw-semibold ${clickReservas ? 'btn-info text-white' : 'btn-outline-info'}`}
                onClick={()=>{setClickReservas(true); setClickllamados(false); setClickeditar(false); setClickagregar(false); setClickPorEliminar(false);}}
            >
                Territorios Personales
            </button>
            {isTelefonicaAdmin && (
            <button 
                className={`btn flex-fill fw-semibold ${clickPorEliminar ? 'btn-danger text-white' : 'btn-outline-danger'}`}
                onClick={()=>{setClickPorEliminar(true); setClickeditar(false); setClickagregar(false); setClickllamados(false); setClickReservas(false);}}
            >
                Por Eliminar
            </button>
            )}
        </div>
        {clickeditar && isTelefonicaAdmin && (
            <div className="mb-4">
                <h3 className="h4 text-primary">Progreso</h3>
                <h5 className="text-secondary">Números contestados: {
                    numerosContestados.length !== 0 ? 
                    Math.round((numerosContestados.length / numeros.length) * 100) + "%" : "0%"
                }</h5>
                <hr />
            </div>
        )}

      
        {clickPorEliminar && isTelefonicaAdmin ? (
            <PorEliminar />
        ) : clickllamados ? (
            <MisLlamados />
        ) : clickReservas ? (
            <TerritoriosPersonales />
        ) : clickeditar && isTelefonicaAdmin ? (
            <ListaNumeros />
        ) : isTelefonicaAdmin ? (
            <FormularioAgregar />
        ) : (
            <MisLlamados />
        )}
            </>
        )}

        {tabActiva === 'publica' && (
            <>
                {isPublicaAdmin ? (
                    <>
                        <h3 className="h5">Elija una opcion (Pública)</h3>
                        <div className='container-buttons d-grid gap-3 d-md-flex mt-3 mb-4'>
                            <button 
                                className={`btn flex-fill fw-semibold ${subTabPublica === 'puntos' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => setSubTabPublica('puntos')}
                            >
                                Gestión de Puntos
                            </button>
                            <button 
                                className={`btn flex-fill fw-semibold ${subTabPublica === 'plantillas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSubTabPublica('plantillas')}
                            >
                                Plantillas de Turnos
                            </button>
                        </div>
                        
                        {subTabPublica === 'puntos' ? (
                            <GestionPuntos />
                        ) : (
                            <GestionPlantillas />
                        )}
                    </>
                ) : (
                    <MisTurnosPublicos />
                )}
            </>
        )}

        {tabActiva === 'estadisticas' && isFullAdmin && (
            <EstadisticasDashboard />
        )}

    </div> 
</div >
  )
}

export default Admin
