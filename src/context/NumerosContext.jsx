import React from 'react'
import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { fetchConCsrf } from '../utils/csrf'
import { traerTodosLosTerritorios } from '../utils/territorios'

export const NumerosContext = createContext()

export const NumerosProvider = ({ children }) => {


    const [numero, setNumero] = useState()
    const [numeros, setNumeros] = useState([])
    const [paginaNumeros, setPaginaNumeros] = useState(0)
    const paginaNumerosRef = useRef(0)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuth] = useState(false)
    const [authReady, setAuthReady] = useState(false)
    const [authCheckError, setAuthCheckError] = useState(null)
    const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0)
    const [seleccionado, setSeleccionado] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroTerritorio, setFiltroTerritorio] = useState("")
    const [filtroEdificio, setFiltroEdificio] = useState("")
    const [filtroReservado, setFiltroReservado] = useState("")
    const [filtroFechaDesde, setFiltroFechaDesde] = useState("")
    const [filtroFechaHasta, setFiltroFechaHasta] = useState("")
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // Estado del Buscador Inteligente Global
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const abrirBuscador = () => setIsSearchOpen(true);
    const cerrarBuscador = () => setIsSearchOpen(false);

    // Territorios en caché global
    const [territorios, setTerritorios] = useState([]);
    const [loadingTerritorios, setLoadingTerritorios] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Atajo global Ctrl+K / Cmd+K para abrir/cerrar buscador
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const api = `${import.meta.env.VITE_API_URL}`

    const limpiarSesionLocal = useCallback(() => {
        ['isAuth', 'usuario', 'usuarioId', 'privilegio', 'asignacion', 'habilitacionPublica', 'conductor']
            .forEach(key => localStorage.removeItem(key));
        setIsAuth(false);
    }, []);

    const reintentarVerificacionSesion = useCallback(() => {
        setSessionCheckAttempt(attempt => attempt + 1);
    }, []);

    useEffect(() => {
        let active = true;

        const verificarSesion = async () => {
            setAuthReady(false);
            setAuthCheckError(null);

            if (localStorage.getItem('isAuth') !== 'true') {
                if (active) {
                    setIsAuth(false);
                    setAuthReady(true);
                }
                return;
            }

            try {
                const response = await fetch(`${api}/usuarios/me`, { credentials: 'include' });
                if (response.status === 401 || response.status === 403) {
                    if (active) {
                        limpiarSesionLocal();
                        setAuthReady(true);
                    }
                    return;
                }
                if (!response.ok) {
                    throw new Error(`No se pudo verificar la sesión (HTTP ${response.status}).`);
                }

                const usuarioActual = await response.json();
                if (!usuarioActual || !usuarioActual.usuario) {
                    throw new Error('El backend devolvió datos de sesión inválidos.');
                }

                if (active) {
                    localStorage.setItem('usuario', usuarioActual.usuario);
                    localStorage.setItem('usuarioId', usuarioActual.id ?? '');
                    localStorage.setItem('privilegio', usuarioActual.privilegio || '');
                    localStorage.setItem('asignacion', usuarioActual.asignacion || '');
                    if (usuarioActual.habilitacionPublica !== undefined) {
                        localStorage.setItem('habilitacionPublica', usuarioActual.habilitacionPublica);
                    }
                    localStorage.setItem(
                        'conductor',
                        String(usuarioActual.conductor === true || usuarioActual.conductor === 'true' || usuarioActual.conductor === 1 || usuarioActual.conductor === '1')
                    );
                    setIsAuth(true);
                    setAuthReady(true);
                }
            } catch (verificationError) {
                console.error('Error al verificar la sesión con el backend', verificationError);
                if (active) {
                    setAuthCheckError(verificationError);
                    setAuthReady(true);
                }
            }
        };

        verificarSesion();
        return () => {
            active = false;
        };
    }, [api, limpiarSesionLocal, sessionCheckAttempt]);

    useEffect(() => {
        const verificarAlVolver = () => {
            if (document.visibilityState === 'visible' && localStorage.getItem('isAuth') === 'true') {
                reintentarVerificacionSesion();
            }
        };
        document.addEventListener('visibilitychange', verificarAlVolver);
        return () => {
            document.removeEventListener('visibilitychange', verificarAlVolver);
        };
    }, [reintentarVerificacionSesion]);

    const cargarTerritorios = async (force = false) => {
        if (!force && territorios.length > 0) return territorios;
        setLoadingTerritorios(true);
        try {
            const data = await traerTodosLosTerritorios(api);
            setTerritorios(data);
            return data;
        } catch (e) {
            console.error("Error al cargar territorios:", e);
            await Swal.fire({
                icon: 'error',
                title: 'No se pudieron cargar los territorios',
                text: e.message || 'Intenta nuevamente.'
            });
        } finally {
            setLoadingTerritorios(false);
        }
        return [];
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
    const actualizarNumero = async (objetoActualizado) => {
        // Actualización optimista de la UI
        setNumeros(prev => prev.map(n => n.id === objetoActualizado.id ? objetoActualizado : n));

        try {
            const res = await fetchConCsrf(`${api}/api/editar/${objetoActualizado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(objetoActualizado)
            });
            if (!res.ok) throw new Error('Error al editar');

            Toast.fire({
                icon: 'success',
                title: 'Número actualizado con éxito'
            });
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Error al actualizar el número'
            });
            // Revertir en caso de error manteniendo la página actual
            cargarProductos(paginaNumerosRef.current);
        }
    };

    const cargarProductos = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                size: '50'
            });

            if (busqueda.trim()) params.append('direccion', busqueda.trim());
            if (filtroTerritorio.trim()) params.append('territorio', filtroTerritorio.trim());
            if (filtroEdificio.trim()) params.append('edificio', filtroEdificio.trim());
            if (filtroReservado === 'si') params.append('reservado', 'true');
            if (filtroReservado === 'no') params.append('reservado', 'false');
            if (filtroFechaDesde) params.append('fechaDesde', filtroFechaDesde);
            if (filtroFechaHasta) params.append('fechaHasta', filtroFechaHasta);

            const response = await fetch(`${api}/api/numeros?${params.toString()}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setNumeros(data);
                    setPaginaNumeros(page);
                    paginaNumerosRef.current = page;
                    return data;
                }
            }
            setNumeros([]);
        } catch (error) {
            setNumeros([]);
        } finally {
            setLoading(false);
        }
        return [];
    }, [api, busqueda, filtroTerritorio, filtroEdificio, filtroReservado, filtroFechaDesde, filtroFechaHasta]);

    // Único useEffect para cargar y filtrar con debounce de 350 ms
    useEffect(() => {
        if (!isAuthenticated) {
            setNumeros([]);
            setPaginaNumeros(0);
            paginaNumerosRef.current = 0;
            setLoading(false);
            return;
        }

        const timer = setTimeout(() => {
            cargarProductos(0);
        }, 350);

        return () => clearTimeout(timer);
    }, [isAuthenticated, cargarProductos]);

    const productosFiltrados = [...numeros].sort((a, b) => {
        const terrA = String(a.territorio || '');
        const terrB = String(b.territorio || '');
        const diffTerr = terrA.localeCompare(terrB, undefined, { numeric: true, sensitivity: 'base' });
        if (diffTerr !== 0) return diffTerr;

        const edificioA = String(a.edificio || '');
        const edificioB = String(b.edificio || '');
        return edificioA.localeCompare(edificioB, undefined, { numeric: true, sensitivity: 'base' });
    });

    const eliminarNumero = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Deseas eliminar este número? Esta acción no se puede revertir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            await fetchConCsrf(`${api}/api/borrar/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            Toast.fire({
                icon: 'success',
                title: 'Número eliminado con éxito'
            });
            cargarProductos(paginaNumerosRef.current);
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Error al eliminar el número'
            });
        }
    };

    const agregarNumero = async (number) => {
        try {
            await fetchConCsrf(`${api}/api/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(number)
            });
            Toast.fire({
                icon: 'success',
                title: 'Número agregado con éxito'
            });
            cargarProductos(paginaNumerosRef.current);
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Error al agregar el número'
            });
        }
    };





    const actualizarReserva = async (filtrados, usuarioSeleccionado) => {
        if (!filtrados || filtrados.length === 0) return;

        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const currentDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

        const ids = filtrados.map(num => num.id);
        const idsSet = new Set(ids);

        // Actualización optimista en la UI
        setNumeros(prev => prev.map(n => idsSet.has(n.id) ? {
            ...n,
            reservado: true,
            fechaReserva: currentDate,
            reservadoA: usuarioSeleccionado ? { usuario: usuarioSeleccionado.usuario } : null
        } : n));

        try {
            const res = await fetchConCsrf(`${api}/api/numeros/reservar-lote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ids,
                    usuario: usuarioSeleccionado ? usuarioSeleccionado.usuario : null
                })
            });
            if (!res.ok) throw new Error('Error al reservar lote');

            Toast.fire({ icon: 'success', title: 'Números reservados con éxito' });
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Error en el servidor al guardar reservas' });
            cargarProductos(paginaNumerosRef.current);
        }
    };

    const sacarReservados = async (filtrados) => {
        if (!filtrados || filtrados.length === 0) return;

        const ids = filtrados.map(num => num.id);
        const idsSet = new Set(ids);

        // Actualización optimista en la UI
        setNumeros(prev => prev.map(n => idsSet.has(n.id) ? {
            ...n,
            reservado: false,
            reservadoA: null,
            fechaReserva: null
        } : n));

        try {
            const res = await fetchConCsrf(`${api}/api/numeros/liberar-lote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids })
            });
            if (!res.ok) throw new Error('Error al liberar lote');

            Toast.fire({ icon: 'success', title: 'Reservados sacados con éxito' });
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Error en el servidor al liberar reservas' });
            cargarProductos(paginaNumerosRef.current);
        }
    };

    const reiniciarContesta = async (filtrados) => {
        if (!filtrados || filtrados.length === 0) return;

        const ids = filtrados.map(num => num.id);
        const idsSet = new Set(ids);

        // Actualización optimista en la UI
        setNumeros(prev => prev.map(n => idsSet.has(n.id) ? {
            ...n,
            contesta: false
        } : n));

        try {
            const res = await fetchConCsrf(`${api}/api/numeros/reiniciar-contesta-lote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids })
            });
            if (!res.ok) throw new Error('Error al reiniciar contesta');

            Toast.fire({ icon: 'success', title: 'Números marcados como "No contesta"' });
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Error al reiniciar contesta' });
            cargarProductos(paginaNumerosRef.current);
        }
    };


    return (
        <NumerosContext.Provider value={{
            numero, setNumero, actualizarNumero, numeros, setNumeros, error, loading,
            paginaNumeros,
            isAuthenticated, setIsAuth, authReady, authCheckError, reintentarVerificacionSesion,
            limpiarSesionLocal, eliminarNumero, seleccionado, setSeleccionado,
            agregarNumero, cargarProductos, productosFiltrados, busqueda, setBusqueda,
            filtroTerritorio, setFiltroTerritorio, filtroEdificio, setFiltroEdificio,
            filtroReservado, setFiltroReservado, filtroFechaDesde, setFiltroFechaDesde,
            filtroFechaHasta, setFiltroFechaHasta, actualizarReserva, sacarReservados,
            reiniciarContesta, theme, setTheme,
            isSearchOpen, setIsSearchOpen, abrirBuscador, cerrarBuscador,
            territorios, setTerritorios, loadingTerritorios, cargarTerritorios
        }}>
            {children}
        </NumerosContext.Provider>
    )

}
