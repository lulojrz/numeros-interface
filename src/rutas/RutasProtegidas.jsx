import React from 'react'
import { Navigate } from 'react-router'
import Swal from 'sweetalert2'

const RutasProtegidas = ({isAuthenticated, rolesPermitidos, children}) => {
  if(!isAuthenticated){
    return <Navigate to='/login' replace/>
  }

  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const userRole = localStorage.getItem('privilegio');
    if (!rolesPermitidos.includes(userRole)) {
      // Use setTimeout to avoid triggering Swal during render cycle
      setTimeout(() => {
          Swal.fire({
              icon: 'error',
              title: 'Acceso Denegado',
              text: 'No tienes permisos suficientes para acceder a esta sección.',
              confirmButtonColor: '#0d6efd'
          });
      }, 100);
      return <Navigate to='/admin' replace/>
    }
  }
  
  return children
}

export default RutasProtegidas