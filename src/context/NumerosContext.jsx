import React from 'react'
import { createContext, useState, useEffect } from 'react'
import Swal from 'sweetalert2'

export const NumerosContext = createContext()

export const NumerosProvider = ({ children }) => {


    const [numero, setNumero] = useState()
    const [numeros, setNumeros] = useState([])
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuth] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)
    const [busqueda, setBusqueda] = useState("")
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



    const cargarProductos = async () => {
        setLoading(true)
        try {
            const response = await fetch(api+'/numeros')
            const data = await response.json()
            console.log(data)
            setNumeros(data)
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const productosFiltrados = numeros.filter((num) =>
        num?.direccion.toLowerCase().includes(busqueda.toLowerCase())
    )


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
            await fetch(`${api}/${id}`, {
                method: 'DELETE'
            })
            Toast.fire({
                icon: 'success',
                title: 'Número eliminado con éxito'
            });
            cargarProductos();
        }
        catch (error) {
            console.log(error)
            Toast.fire({
                icon: 'error',
                title: 'Error al eliminar el número'
            });
        }
    }


    const actualizarNumero = async (number) => {
        if (!number.id) {
            console.error("Error: El objeto no tiene ID", number);
            return;
        }
        try {
            const response = 
            await fetch(`${api}/editar/${number.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(number)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            Toast.fire({
                icon: 'success',
                title: 'Número actualizado con éxito'
            });
            cargarProductos();
        }
        catch (error) {
            console.log(error)
            Toast.fire({
                icon: 'error',
                title: 'Error al actualizar el número'
            });
        }
    }

    const agregarNumero = async (number) => {
        try {
            await fetch(api, {
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
            console.log(error)
            Toast.fire({
                icon: 'error',
                title: 'Error al agregar el número'
            });
        }
    }



   
    const actualizarReserva = (filtrados) => {
        let filtraditos = filtrados.map((num) => ({ ...num, reservado: true }));
        filtraditos.forEach(async (num) => {
            try {
                fetch(`${api}/${num.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(num)

                })
            } catch (error) {
                console.log(error);
            }
        });
        Toast.fire({
            icon: 'success',
            title: 'Números reservados con éxito'
        });

        cargarProductos();
    }
    const sacarReservados = (filtrados) => {
        let noReservados = filtrados.map((num) => ({ ...num, reservado: false }));;
        noReservados.forEach(async (num) => {
            try {
                fetch(`${api}/${num.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(num)
                })
            } catch (error) {
                console.log(error);
            }
        });
        Toast.fire({
            icon: 'success',
            title: 'Reservados sacados con éxito'
        });

        cargarProductos();
    }


    return (
        <NumerosContext.Provider value={{ numero, setNumero, numeros, setNumeros, error, loading, actualizarNumero, isAuthenticated, setIsAuth, eliminarNumero, seleccionado, setSeleccionado, agregarNumero, cargarProductos, productosFiltrados, busqueda, setBusqueda, actualizarReserva, sacarReservados }}>
            {children}
        </NumerosContext.Provider>
    )

} 