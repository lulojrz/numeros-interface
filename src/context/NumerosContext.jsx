import React from 'react'
import { createContext, useState, useEffect } from 'react'

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
        window.confirm('¿Estás seguro de que deseas eliminar este número?')

        try {
            await fetch(`${api}/${id}`, {
                method: 'DELETE'
            })
            alert('Número eliminado con éxito')
            cargarProductos();
        }
        catch (error) {
            console.log(error)
        }
    }


    const actualizarNumero = async (number) => {
        if (!number.id) {
            console.error("Error: El objeto no tiene ID", number);
            return;
        }
        try {
            await fetch(`${api}/${number.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(number)
            })
            alert('Número actualizado con éxito')
            cargarProductos();
        }
        catch (error) {
            console.log(error)
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
            alert('Número agregado con éxito')
            cargarProductos();
        }
        catch (error) {
            console.log(error)
        }
    }



    const cambiarEstadoNumero = (objetoACambiar, campo) => {
        if (!objetoACambiar) return null;
        let objetoActualizado = {};
        if (campo === 'Contesta') {
            objetoActualizado = {
                ...objetoACambiar,
                contesta: !objetoACambiar.contesta
            };


        }

        const nuevosNumeros = numeros.map(n => {
            if (n.id === objetoACambiar.id) {
                return objetoActualizado;
            }
            return n;
        });


        setNumeros(nuevosNumeros);


        return objetoActualizado;
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
        alert('Números reservados con éxito')

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
        alert('Reservados sacados con éxito')

        cargarProductos();
    }


    return (
        <NumerosContext.Provider value={{ numero, setNumero, numeros, setNumeros, error, loading, cambiarEstadoNumero, actualizarNumero, isAuthenticated, setIsAuth, eliminarNumero, seleccionado, setSeleccionado, agregarNumero, cargarProductos, productosFiltrados, busqueda, setBusqueda, actualizarReserva, sacarReservados }}>
            {children}
        </NumerosContext.Provider>
    )

} 