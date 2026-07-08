import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { NumerosContext } from '../context/NumerosContext';

const AdminUsuarios = () => {
    const { numeros } = useContext(NumerosContext);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clickAgregar, setClickAgregar] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [filtroReservas, setFiltroReservas] = useState('todos');
    
    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        usuario: '',
        contrasena: 'prueba123',
        privilegio: 'usuario'
    });

    const api = 'http://localhost:8080';

    const loggedInUsername = localStorage.getItem('usuario');
    const currentUser = usuarios.find(u => u.usuario === loggedInUsername);
    const isANC = currentUser?.privilegio === 'ANC';

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
                
                const loggedUser = data.find(u => u.usuario === localStorage.getItem('usuario'));
                if (loggedUser && loggedUser.privilegio !== 'ANC') {
                    setUsuarioEditando(loggedUser);
                    setFormData({ 
                        nombre: loggedUser.nombre || '', 
                        apellido: loggedUser.apellido || '', 
                        usuario: loggedUser.usuario || '', 
                        contrasena: '',
                        privilegio: loggedUser.privilegio || 'usuario'
                    });
                }
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
                
                // Only reset the form if the user is ANC, otherwise keep them on the edit form
                if (isANC) {
                    setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' });
                    setUsuarioEditando(null);
                }
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
        });
        setClickAgregar(false);
    };

    const cancelarEdicion = () => {
        setUsuarioEditando(null);
        setFormData({ nombre: '', apellido: '', usuario: '', contrasena: 'prueba123', privilegio: 'usuario' });
    };

    const usuariosFiltrados = usuarios.filter(u => {
        if (filtroReservas === 'todos') return true;
        
        const tieneReservas = numeros.some(n => n.reservado === true && n.reservadoA?.usuario === u.usuario);
        
        if (filtroReservas === 'conReservas') return tieneReservas;
        if (filtroReservas === 'sinReservas') return !tieneReservas;
        return true;
    });

    return (
        <div className='container my-5'>
            <div className='card shadow-lg p-4'>
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                    <h1 className="h2 mb-2 mb-md-0">{!isANC ? 'Mi Perfil' : 'Gestión de Usuarios'}</h1>
                    <Link to="/admin" className='btn btn-secondary'>
                        Volver al Panel
                    </Link>
                </div>

                {isANC && (
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
                )}

                {isANC && <hr />}

                {loading ? (
                    <div className="text-center">Cargando...</div>
                ) : (
                    <>
                        {(!clickAgregar && !usuarioEditando && isANC) && (
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                    <h4 className="mb-0">Lista de Usuarios</h4>
                                    <div className="mt-2 mt-md-0 d-flex align-items-center">
                                        <label className="me-2 fw-semibold text-muted small">Filtrar:</label>
                                        <select 
                                            className="form-select form-select-sm w-auto" 
                                            value={filtroReservas}
                                            onChange={(e) => setFiltroReservas(e.target.value)}
                                        >
                                            <option value="todos">Todos los usuarios</option>
                                            <option value="conReservas">Con números reservados</option>
                                            <option value="sinReservas">Sin números reservados</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Vista Desktop */}
                                <div className="table-responsive shadow-sm rounded d-none d-md-block">
                                    <table className="table table-hover table-striped align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-secondary fw-semibold">ID</th>
                                                <th className="text-secondary fw-semibold">Nombre</th>
                                                <th className="text-secondary fw-semibold">Apellido</th>
                                                <th className="text-secondary fw-semibold">Usuario</th>
                                                <th className="text-secondary fw-semibold">Privilegio</th>
                                                <th className="text-secondary fw-semibold text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosFiltrados.map(u => (
                                                <tr key={u.id}>
                                                    <td className="fw-bold">{u.id}</td>
                                                    <td>{u.nombre}</td>
                                                    <td>{u.apellido}</td>
                                                    <td>{u.usuario}</td>
                                                    <td><span className="badge bg-secondary">{u.privilegio}</span></td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-primary me-2" onClick={() => abrirFormularioEditar(u)}>
                                                            <i className="bi bi-pencil"></i> Editar
                                                        </button>
                                                        {isANC && (
                                                            <button className="btn btn-sm btn-danger" onClick={() => eliminarUsuario(u.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {usuariosFiltrados.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-muted">No se encontraron usuarios.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Vista Mobile */}
                                <div className="d-md-none">
                                    {usuariosFiltrados.map(u => (
                                        <div key={u.id} className="card shadow-sm mb-3 border-0 rounded-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 className="card-title text-primary fw-bold mb-0">{u.usuario}</h5>
                                                    <span className="badge bg-secondary">{u.privilegio}</span>
                                                </div>
                                                <p className="card-text mb-1 text-muted small">
                                                    <strong>Nombre:</strong> {u.nombre} {u.apellido}
                                                </p>
                                                <p className="card-text mb-3 text-muted small">
                                                    <strong>ID:</strong> {u.id}
                                                </p>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-outline-primary btn-sm flex-fill fw-semibold" onClick={() => abrirFormularioEditar(u)}>
                                                        <i className="bi bi-pencil"></i> Editar
                                                    </button>
                                                    {isANC && (
                                                        <button className="btn btn-outline-danger btn-sm flex-fill fw-semibold" onClick={() => eliminarUsuario(u.id)}>
                                                            <i className="bi bi-trash"></i> Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {usuariosFiltrados.length === 0 && (
                                        <div className="text-center py-4 text-muted border rounded shadow-sm bg-white">
                                            No se encontraron usuarios.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(clickAgregar || usuarioEditando) && (
                            <form onSubmit={usuarioEditando ? handleEditar : handleAgregar} className="mt-4">
                                <h4 className="mb-3">{usuarioEditando ? (isANC ? 'Editar Usuario' : 'Editar Mi Perfil') : 'Nuevo Usuario'}</h4>
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
                                        disabled={!isANC}
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
                                    {usuarioEditando && isANC && (
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
