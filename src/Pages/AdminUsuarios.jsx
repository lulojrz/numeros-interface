import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clickAgregar, setClickAgregar] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        usuario: '',
        contrasena: 'prueba123',
        privilegio: 'usuario'
    });

    const api = 'http://localhost:8080';

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

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/usuarios`);
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${api}/usuarios/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                Toast.fire({
                    icon: 'success',
                    title: 'Usuario agregado con éxito'
                });
                setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' });
                setClickAgregar(false);
                cargarUsuarios();
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'Error al agregar usuario'
                });
            }
        } catch (error) {
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: 'Error de conexión'
            });
        }
    };

    const handleEditar = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${api}/usuarios/editar/${usuarioEditando.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...usuarioEditando, ...formData })
            });
            
            if (response.ok) {
                Toast.fire({
                    icon: 'success',
                    title: 'Usuario editado con éxito'
                });
                setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' });
                setUsuarioEditando(null);
                cargarUsuarios();
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'Error al editar usuario'
                });
            }
        } catch (error) {
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: 'Error de conexión'
            });
        }
    };

    const eliminarUsuario = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Deseas eliminar este usuario? Esta acción no se puede revertir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${api}/usuarios/borrar/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                Toast.fire({
                    icon: 'success',
                    title: 'Usuario eliminado con éxito'
                });
                cargarUsuarios();
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'Error al eliminar usuario'
                });
            }
        }
        catch (error) {
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: 'Error de conexión'
            });
        }
    };

    const abrirFormularioEditar = (user) => {
        setUsuarioEditando(user);
        setFormData({ 
            nombre: user.nombre || '', 
            apellido: user.apellido || '', 
            usuario: user.usuario || '', 
            contrasena: '',
            privilegio: user.privilegio || 'usuario'
        }); // Option to not show password
        setClickAgregar(false);
    };

    const cancelarEdicion = () => {
        setUsuarioEditando(null);
        setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' });
    };

    return (
        <div className='container my-5'>
            <div className='card shadow-lg p-4'>
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                    <h1 className="h2 mb-2 mb-md-0">Gestión de Usuarios</h1>
                    <Link to="/admin" className='btn btn-secondary'>
                        Volver al Panel
                    </Link>
                </div>

                <div className='container-buttons d-grid gap-3 d-md-flex mt-3 mb-4'>
                    <button
                        className={`btn flex-fill fw-semibold ${!clickAgregar && !usuarioEditando ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => { setClickAgregar(false); setUsuarioEditando(null); setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' }); }}
                    >
                        Lista de Usuarios
                    </button>
                    <button
                        className={`btn flex-fill fw-semibold ${clickAgregar && !usuarioEditando ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => { setClickAgregar(true); setUsuarioEditando(null); setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' }); }}
                    >
                        Agregar Nuevo
                    </button>
                </div>

                <hr />

                {loading ? (
                    <div className="text-center">Cargando...</div>
                ) : (
                    <>
                        {(!clickAgregar && !usuarioEditando) && (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Apellido</th>
                                            <th>Usuario</th>
                                            <th>Privilegio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.nombre}</td>
                                                <td>{u.apellido}</td>
                                                <td>{u.usuario}</td>
                                                <td>{u.privilegio}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-primary me-2" onClick={() => abrirFormularioEditar(u)}>Editar</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usuarios.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center">No hay usuarios registrados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {(clickAgregar || usuarioEditando) && (
                            <form onSubmit={usuarioEditando ? handleEditar : handleAgregar} className="mt-4">
                                <h4 className="mb-3">{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                       
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Apellido</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        required
                                    
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Usuario</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="usuario"
                                        value={formData.usuario}
                                        onChange={handleInputChange}
                                        required
                                      
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="contrasena"
                                        value={formData.contrasena}
                                        onChange={handleInputChange}
                                        required={!usuarioEditando}
                                        placeholder={usuarioEditando ? 'Dejar en blanco para no cambiar' : ''}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Privilegio</label>
                                    <select
                                        className="form-select"
                                        name="privilegio"
                                        value={formData.privilegio}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="PUB">PUB</option>
                                        <option value="SM">SM</option>
                                        <option value="ANC">ANC</option>
                                        <option value="PR">PR</option>
                                    </select>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className={`btn ${usuarioEditando ? 'btn-primary' : 'btn-success'}`}>
                                        {usuarioEditando ? 'Guardar Cambios' : 'Agregar Usuario'}
                                    </button>
                                    {usuarioEditando && (
                                        <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminUsuarios;
