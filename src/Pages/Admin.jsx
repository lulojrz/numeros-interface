import React, { useContext , useState, useEffect} from 'react'
import { NumerosContext } from '../context/NumerosContext'
import FormularioAgregar from '../Components/FormularioAgregar.jsx'
import ListaNumeros from '../Components/ListaNumeros.jsx'
import MisLlamados from '../Components/MisLlamados.jsx'
import PorEliminar from '../Components/PorEliminar.jsx'
import TerritoriosPersonales from '../Components/TerritoriosPersonales.jsx'
import GestionPuntos from '../Components/GestionPuntos.jsx'
import GestionPlantillas from '../Components/GestionPlantillas.jsx'
import GestionReportes from '../Components/GestionReportes.jsx'
import MisTurnosPublicos from '../Components/MisTurnosPublicos.jsx'
import EstadisticasDashboard from '../Components/EstadisticasDashboard.jsx'
import GestionEdificios from '../Components/GestionEdificios.jsx'
import AdminSalidas from '../Components/AdminSalidas.jsx'
import { Link } from 'react-router-dom'
import { obtenerPermisosAdmin } from '../utils/permisos'
import { traerTodosLosUsuarios } from '../utils/usuarios'
import { exportarInformePublicaPDF } from '../utils/exportPublica.js'

const Admin = () => {
  const {numeros}= useContext(NumerosContext)
  const numerosContestados = numeros.filter(numero => numero.contesta);
  const [clickeditar,setClickeditar]= useState(false)
  const [clickagregar,setClickagregar]= useState(false)
  const [clickllamados,setClickllamados]= useState(false)
  const [clickReservas, setClickReservas] = useState(false)
  const [clickPorEliminar,setClickPorEliminar]= useState(false)
  const [initialPermissions] = useState(() => obtenerPermisosAdmin({
    privilegio: localStorage.getItem('privilegio'),
    asignacion: localStorage.getItem('asignacion')
  }))
  const [isANC, setIsANC] = useState(initialPermissions.puedeGestionarUsuarios)
  const [isFullAdmin, setIsFullAdmin] = useState(initialPermissions.puedeAdministrarTodo)
  const [isTelefonicaAdmin, setIsTelefonicaAdmin] = useState(initialPermissions.puedeAdministrarTelefonica)
  const [isPublicaAdmin, setIsPublicaAdmin] = useState(initialPermissions.puedeAdministrarPublica)
  const [isEdificiosAdmin, setIsEdificiosAdmin] = useState(initialPermissions.puedeAdministrarEdificios)
  const clavePestanaAdmin = `adminTab:${localStorage.getItem('usuarioId') || localStorage.getItem('usuario') || 'session'}`
  const [pestanaSeleccionada, setPestanaSeleccionada] = useState(() => sessionStorage.getItem(clavePestanaAdmin) || 'telefonica')
  const pestanaPermitida = pestanaSeleccionada === 'telefonica' ||
    (pestanaSeleccionada === 'publica' && isPublicaAdmin) ||
    (pestanaSeleccionada === 'edificios' && isEdificiosAdmin) ||
    (['salidas', 'estadisticas'].includes(pestanaSeleccionada) && isFullAdmin)
  const tabActiva = pestanaPermitida ? pestanaSeleccionada : 'telefonica'
  const [subTabPublica, setSubTabPublica] = useState('puntos')
  const cambiarPestana = (pestana) => {
    sessionStorage.setItem(clavePestanaAdmin, pestana)
    setPestanaSeleccionada(pestana)
  }

  useEffect(() => {
    const fetchPrivilegio = async () => {
      try {
        const data = await traerTodosLosUsuarios(import.meta.env.VITE_API_URL);
        const currentUser = data.find(u => u.usuario === localStorage.getItem('usuario'));
        if (currentUser) {
          localStorage.setItem('asignacion', currentUser.asignacion || '');
          localStorage.setItem('privilegio', currentUser.privilegio || '');
          const permissions = obtenerPermisosAdmin(currentUser);
          setIsANC(permissions.puedeGestionarUsuarios);
          setIsFullAdmin(permissions.puedeAdministrarTodo);
          setIsTelefonicaAdmin(permissions.puedeAdministrarTelefonica);
          setIsPublicaAdmin(permissions.puedeAdministrarPublica);
          setIsEdificiosAdmin(permissions.puedeAdministrarEdificios);
        }
      } catch (error) {
        console.error('Error al verificar los permisos administrativos', error);
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
                    className={`nav-link fw-bold ${tabActiva === 'telefonica' ? 'active' : 'text-body-secondary'}`} 
                    onClick={() => cambiarPestana('telefonica')}
                    style={tabActiva === 'telefonica' ? { color: '#0d6efd' } : {}}
                >
                    <i className="bi bi-telephone-fill me-2"></i>Predicación Telefónica
                </button>
            </li>
            {isPublicaAdmin && (
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'publica' ? 'active' : 'text-body-secondary'}`} 
                    onClick={() => cambiarPestana('publica')}
                    style={tabActiva === 'publica' ? { color: '#198754' } : {}}
                >
                    <i className="bi bi-geo-alt-fill me-2"></i>Predicación Pública
                </button>
            </li>
            )}
            {isEdificiosAdmin && (
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'edificios' ? 'active' : 'text-body-secondary'}`} 
                    onClick={() => cambiarPestana('edificios')}
                    style={tabActiva === 'edificios' ? { color: '#fd7e14' } : {}}
                >
                    <i className="bi bi-building me-2"></i>Predicación de Edificios
                </button>
            </li>
            )}
            {isFullAdmin && (
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'salidas' ? 'active' : 'text-body-secondary'}`} 
                    onClick={() => cambiarPestana('salidas')}
                    style={tabActiva === 'salidas' ? { color: '#0dcaf0' } : {}}
                >
                    <i className="bi bi-calendar-range me-2"></i>Salidas de Predicación
                </button>
            </li>
            )}
            {isFullAdmin && (
            <li className="nav-item">
                <button 
                    className={`nav-link fw-bold ${tabActiva === 'estadisticas' ? 'active' : 'text-body-secondary'}`} 
                    onClick={() => cambiarPestana('estadisticas')}
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
                <h5 className="text-body-secondary">Números contestados: {
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
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                    <h3 className="h5 mb-0">Elija una opción (Pública)</h3>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm fw-semibold shadow-sm"
                        onClick={() => exportarInformePublicaPDF()}
                        title="Descargar PDF con hermanos aptos y puntos trabajados hasta hoy"
                    >
                        <i className="bi bi-file-earmark-pdf-fill me-1"></i> Descargar Informe PDF
                    </button>
                </div>

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
                    <button 
                        className={`btn flex-fill fw-semibold ${subTabPublica === 'reportes' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setSubTabPublica('reportes')}
                    >
                        <i className="bi bi-list-task me-1"></i> To-Do Reportes
                    </button>
                </div>
                
                {subTabPublica === 'puntos' ? (
                    <GestionPuntos />
                ) : subTabPublica === 'plantillas' ? (
                    <GestionPlantillas />
                ) : (
                    <GestionReportes />
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

        {tabActiva === 'edificios' && isEdificiosAdmin && (
            <GestionEdificios />
        )}

        {tabActiva === 'salidas' && isFullAdmin && (
            <AdminSalidas />
        )}

    </div> 
</div >
  )
}

export default Admin
