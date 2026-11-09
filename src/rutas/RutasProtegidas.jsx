import React from 'react'
import { Navigate } from 'react-router'
import Swal from 'sweetalert2'
import { normalizarAsignacion } from '../utils/permisos'

const RutasProtegidas = ({isAuthenticated, rolesPermitidos, asignacionesPermitidas, children}) => {
  if(!isAuthenticated){
    return <Navigate to='/login' replace/>
  }

  if ((rolesPermitidos && rolesPermitidos.length > 0) ||
      (asignacionesPermitidas && asignacionesPermitidas.length > 0)) {
    const userRole = localStorage.getItem('privilegio');
    const userAssignment = normalizarAsignacion(localStorage.getItem('asignacion'));
    const hasAllowedRole = rolesPermitidos?.includes(userRole) || false;
    const hasAllowedAssignment = asignacionesPermitidas?.some(
      assignment => normalizarAsignacion(assignment) === userAssignment
    ) || false;
    if (!hasAllowedRole && !hasAllowedAssignment) {
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
