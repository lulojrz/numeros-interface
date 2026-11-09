import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchConCsrf } from '../utils/csrf';
import { esSoporte } from '../utils/permisos';
import { traerTodosLosUsuarios } from '../utils/usuarios';

const CambiarContrasena = () => {
    const [formData, setFormData] = useState({
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
    });
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loadingInventario, setLoadingInventario] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const api = import.meta.env.VITE_API_URL;
    const usuarioLogueado = localStorage.getItem('usuario');
    const puedeEditarPerfil = localStorage.getItem('privilegio') === 'ROLE_ANC' ||
        esSoporte(localStorage.getItem('asignacion'));

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await traerTodosLosUsuarios(api);
                const loggedIn = data.find(u => u.usuario === usuarioLogueado);
                if (!loggedIn) throw new Error('No se encontró el usuario conectado en la lista recibida.');
                setUserData(loggedIn);
            } catch (error) {
                console.error('Error al cargar los datos del perfil', error);
                Swal.fire('Error', error.message || 'No se pudieron cargar los datos del perfil.', 'error');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchUserData();
    }, [api, usuarioLogueado]);

    const handleGuardarInventario = async (e) => {
        e.preventDefault();
        if (!puedeEditarPerfil || !userData) return;
        setLoadingInventario(true);
        try {
            const response = await fetchConCsrf(`${api}/usuarios/editar/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            if (response.ok) {
                const perfilGuardado = await response.json();
                setUserData(perfilGuardado);
                if (perfilGuardado.usuario !== usuarioLogueado) {
                    localStorage.setItem('usuario', perfilGuardado.usuario);
                }
                localStorage.setItem('privilegio', perfilGuardado.privilegio || '');
                localStorage.setItem('asignacion', perfilGuardado.asignacion || '');
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Los datos del perfil han sido actualizados.',
                    confirmButtonColor: '#007bff'
                });
            } else {
                const detail = await response.text();
                Swal.fire('Error', detail || 'No se pudieron actualizar los datos del perfil.', 'error');
            }
        } catch (error) {
            console.error('Error al guardar el perfil', error);
            Swal.fire('Error', error.message || 'Error de conexión', 'error');
        } finally {
            setLoadingInventario(false);
        }
    };

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar que la nueva contraseña tenga al menos 6 caracteres
        if (formData.nuevaContrasena.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña muy corta',
                text: 'La nueva contraseña debe tener al menos 6 caracteres.',
                confirmButtonColor: '#007bff'
            });
            return;
        }

        // 2. Validar que las contraseñas nuevas coincidan
        if (formData.nuevaContrasena !== formData.confirmarContrasena) {
            Swal.fire({
                icon: 'error',
                title: 'Las contraseñas no coinciden',
                text: 'Asegúrate de escribir la misma contraseña en ambos campos nuevos.',
                confirmButtonColor: '#007bff'
            });
            return;
        }

        // 3. Validar que no sea la misma que la anterior (opcional pero buena práctica)
        if (formData.contrasenaActual === formData.nuevaContrasena) {
            Swal.fire({
                icon: 'error',
                title: 'Sin cambios',
                text: 'La nueva contraseña debe ser diferente a la actual.',
                confirmButtonColor: '#007bff'
            });
            return;
        }

        setLoading(true);

        try {
            // Se envía al backend: usuario (para saber quién es), contraseña actual (para validar) y la nueva
            const response = await fetchConCsrf(`${api}/usuarios/cambiar-contrasena`, {
                method: 'PUT', // o POST, depende del backend
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    usuario: usuarioLogueado,
                    contrasenaActual: formData.contrasenaActual,
                    nuevaContrasena: formData.nuevaContrasena
                })
            });

            if (response.ok) {
                const responseText = await response.text();
                
                // Si el backend devuelve un mensaje específico de error como "Contraseña actual incorrecta"
                if (responseText.toLowerCase().includes("incorrecta") || responseText.toLowerCase().includes("error")) {
                     Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: responseText || 'La contraseña actual es incorrecta.',
                        confirmButtonColor: '#007bff'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Tu contraseña ha sido actualizada correctamente.',
                        confirmButtonColor: '#007bff'
                    });
                    // Limpiar el formulario
                    setFormData({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
                }
            } else {
                // Si la respuesta no fue 2xx
                const errorMessage = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage || 'Hubo un error al intentar cambiar la contraseña.',
                    confirmButtonColor: '#007bff'
                });
            }

        } catch (error) {
            console.error('Error al cambiar la contraseña', error);
            Toast.fire({
                icon: 'error',
                title: 'Error de conexión con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container my-5'>
            <div className='row justify-content-center'>
                <div className='col-md-6 col-lg-5'>
                    <div className='card shadow-lg p-4'>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="h4 mb-0">Mi Perfil</h2>
                            <Link to="/admin" className='btn btn-outline-secondary btn-sm'>
                                Volver
                            </Link>
                        </div>
                        
                        <hr />
                        
                        <p className="text-muted mb-4">Usuario: <strong>{usuarioLogueado}</strong></p>

                        {loadingProfile ? (
                            <div className="text-center py-3" role="status">Cargando datos del perfil...</div>
                        ) : userData && (
                            <form onSubmit={handleGuardarInventario} className="mb-4">
                                <h5 className="mb-3">Mis Datos e Inventario</h5>
                                {!puedeEditarPerfil && (
                                    <p className="text-muted small">Los datos del perfil son de solo lectura. Para editarlos se requiere el rol ROLE_ANC o la asignación de soporte.</p>
                                )}
                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilNombre">Nombre</label>
                                        <input id="perfilNombre" className="form-control" value={userData.nombre || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, nombre: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilApellido">Apellido</label>
                                        <input id="perfilApellido" className="form-control" value={userData.apellido || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, apellido: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilUsuario">Usuario</label>
                                        <input id="perfilUsuario" className="form-control" value={userData.usuario || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, usuario: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilTelefono">Teléfono</label>
                                        <input id="perfilTelefono" className="form-control" value={userData.telefono || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, telefono: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilPrivilegio">Privilegio</label>
                                        <select id="perfilPrivilegio" className="form-select" value={userData.privilegio || 'ROLE_PUB'} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, privilegio: e.target.value })}>
                                            <option value="ROLE_PUB">Publicador (PUB)</option>
                                            <option value="ROLE_PR">Precursor Regular (PR)</option>
                                            <option value="ROLE_SM">Siervo Ministerial (SM)</option>
                                            <option value="ROLE_ANC">Anciano (ANC)</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilAsignacion">Asignación</label>
                                        <input id="perfilAsignacion" className="form-control" value={userData.asignacion || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, asignacion: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium" htmlFor="perfilGrupo">Grupo de Servicio</label>
                                        <input id="perfilGrupo" className="form-control" value={userData.grupo || ''} disabled={!puedeEditarPerfil}
                                            onChange={e => setUserData({ ...userData, grupo: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mb-4 d-flex flex-wrap gap-4">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="checkCarritoUser" 
                                            checked={userData.carrito || false} 
                                            disabled={!puedeEditarPerfil}
                                            onChange={(e) => setUserData({...userData, carrito: e.target.checked})} 
                                        />
                                        <label className="form-check-label" htmlFor="checkCarritoUser">Tengo Carrito 🛒</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="checkBannerUser" 
                                            checked={userData.banner || false} 
                                            disabled={!puedeEditarPerfil}
                                            onChange={(e) => setUserData({...userData, banner: e.target.checked})} 
                                        />
                                        <label className="form-check-label" htmlFor="checkBannerUser">Tengo Banner 🏳️</label>
                                    </div>
                                </div>
                                {puedeEditarPerfil && (
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-success" disabled={loadingInventario}>
                                            {loadingInventario ? 'Guardando...' : 'Guardar Perfil'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                        
                        {userData && <hr className="mb-4" />}

                        <form onSubmit={handleSubmit}>
                            <h5 className="mb-3">Cambiar Contraseña</h5>
                            
                            <div className="mb-3">
                                <label className="form-label">Contraseña Actual</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="contrasenaActual"
                                    value={formData.contrasenaActual}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ingresa tu contraseña actual"
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="nuevaContrasena"
                                    value={formData.nuevaContrasena}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="confirmarContrasena"
                                    value={formData.confirmarContrasena}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>
                            
                            <div className="d-grid">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CambiarContrasena;
