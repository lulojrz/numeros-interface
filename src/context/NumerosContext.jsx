import React from 'react'
import { createContext, useState, useEffect } from 'react'
import Swal from 'sweetalert2'

export const NumerosContext = createContext()

export const NumerosProvider = ({ children }) => {


    const [numero, setNumero] = useState()
    const [numeros, setNumeros] = useState([])
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuth] = useState(() => localStorage.getItem('isAuth') === 'true')
    const [seleccionado, setSeleccionado] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroTerritorio, setFiltroTerritorio] = useState("")
    const [filtroEdificio, setFiltroEdificio] = useState("")
    const [filtroReservado, setFiltroReservado] = useState("")
    const api = 'http://localhost:8080/api'

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
        cargarProductos();
    }, [])

    const actualizarNumero = async (objetoActualizado) => {

        try {
            await fetch(`${api}/editar/${objetoActualizado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(objetoActualizado)
            })
            Toast.fire({
                icon: 'success',
                title: 'Número actualizado con éxito'
            });
            cargarProductos();
        }   
        catch (error) {

            Toast.fire({
                icon: 'error',
                title: 'Error al actualizar el número'
            });
        }

    }


    const cargarProductos = async () => {
            setLoading(true)
            try {
                const response = await fetch(api + '/numeros')
                const data = await response.json()

                setNumeros(data)
            }
            catch (error) {
    
            } finally {
                setLoading(false)
            }
        }


        const productosFiltrados = numeros.filter((num) => {
            const matchesDireccion = num?.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false;
            const matchesTerritorio = filtroTerritorio === "" || (num?.territorio && num.territorio.toString().toLowerCase() === filtroTerritorio.toLowerCase());
            const matchesEdificio = filtroEdificio === "" || (num?.edificio && num.edificio.toString().toLowerCase() === filtroEdificio.toLowerCase());

            let matchesReservado = true;
            if (filtroReservado === "si") matchesReservado = num?.reservado === true;
            if (filtroReservado === "no") matchesReservado = num?.reservado === false;

            return matchesDireccion && matchesTerritorio && matchesEdificio && matchesReservado;
        }).sort((a, b) => {
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
                await fetch(`${api}/borrar/${id}`, {
                    method: 'DELETE'
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Número eliminado con éxito'
                });
                cargarProductos();
            }
            catch (error) {
    
                Toast.fire({
                    icon: 'error',
                    title: 'Error al eliminar el número'
                });
            }
        }





        const agregarNumero = async (number) => {

            try {
                await fetch(`${api}/agregar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(number)
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Número agregado con éxito'
                });
                cargarProductos();
            }
            catch (error) {
    
                Toast.fire({
                    icon: 'error',
                    title: 'Error al agregar el número'
                });
            }
        }




        const actualizarReserva = async (filtrados, usuarioSeleccionado) => {


            let filtraditos = filtrados.map((num) => ({
                ...num,
                reservado: true,
                ultUsuario: num.ultUsuario && num.ultUsuario.usuario ? { usuario: num.ultUsuario.usuario } : null,
                reservadoA: usuarioSeleccionado ? { usuario: usuarioSeleccionado.usuario } : null,
                tocar: num.tocar !== undefined ? num.tocar : true
            }));


            // Optimistic UI update
            setNumeros(prev => prev.map(n => {
                const updated = filtraditos.find(f => f.id === n.id);
                return updated ? updated : n;
            }));

            try {
                // Wait for all PUT requests in parallel
                await Promise.all(filtraditos.map(num => 
                    fetch(`${api}/editar/${num.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(num)
                    })
                ));
                
                Toast.fire({
                    icon: 'success',
                    title: 'Números reservados con éxito'
                });
            } catch (error) {
    ;
                Toast.fire({
                    icon: 'error',
                    title: 'Error en el servidor al guardar reservas'
                });
                cargarProductos(); // Sync with server again in case of failure
            }
        }
        
        const sacarReservados = async (filtrados) => {
            let noReservados = filtrados.map((num) => ({
                ...num,
                reservado: false,
                reservadoA: null,
                ultUsuario: num.ultUsuario && num.ultUsuario.usuario ? { usuario: num.ultUsuario.usuario } : null,
                tocar: num.tocar !== undefined ? num.tocar : true
            }));

            // Optimistic UI update
            setNumeros(prev => prev.map(n => {
                const updated = noReservados.find(f => f.id === n.id);
                return updated ? updated : n;
            }));

            try {
                // Wait for all PUT requests in parallel
                await Promise.all(noReservados.map(num => 
                    fetch(`${api}/editar/${num.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(num)
                    })
                ));
                
                Toast.fire({
                    icon: 'success',
                    title: 'Reservados sacados con éxito'
                });
            } catch (error) {
    ;
                Toast.fire({
                    icon: 'error',
                    title: 'Error en el servidor al liberar reservas'
                });
                cargarProductos(); // Sync with server again in case of failure
            }
        }


        return (
            <NumerosContext.Provider value={{ numero, setNumero,actualizarNumero, numeros, setNumeros, error, loading, isAuthenticated, setIsAuth, eliminarNumero, seleccionado, setSeleccionado, agregarNumero, cargarProductos, productosFiltrados, busqueda, setBusqueda, filtroTerritorio, setFiltroTerritorio, filtroEdificio, setFiltroEdificio, filtroReservado, setFiltroReservado, actualizarReserva, sacarReservados }}>
                {children}
            </NumerosContext.Provider>
        )

    } 