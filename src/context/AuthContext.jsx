import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { NumerosContext } from './NumerosContext.jsx'
import Swal from 'sweetalert2'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const { setIsAuth } = useContext(NumerosContext)
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuth') === 'true'
        if (isAuthenticated) {
            setIsAuth(true)
            if (window.location.pathname === '/login') {
                navigate("/")
            }
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
       
        let validationErrors = {};
        if (!user) validationErrors.user = 'Usuario es requerido';
        if (!password) validationErrors.password = 'Contraseña es requerida';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                // CAMBIO CLAVE: Asegurate de que matchee con los atributos de tu objeto Java
                // Si en Java usás 'usuario' y 'contrasena', cambialo acá a: { usuario: user, contrasena: password }
                body: JSON.stringify({ usuario: user, contrasena: password })
            });

            // Si el backend responde con un error (como el 401)
            if (!res.ok) {
                const errorMessage = await res.text(); // <-- CAMBIADO: .text() en vez de .json()
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage || 'Credenciales incorrectas o error en la autenticación',
                    confirmButtonColor: '#007bff'
                });
                return;
            }

            // Si llegó acá, el estado es 200 OK
            const responseText = await res.text(); // <-- CAMBIADO: .text() en vez de .json()

            if (responseText === "correcto") {
                setErrors({});
                setIsAuth(true);
                localStorage.setItem('isAuth', 'true');
                localStorage.setItem('usuario', user);
                
                try {
                    const userRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { credentials: 'include' });
                    if (userRes.ok) {
                        const data = await userRes.json();
                        const currentUser = data.find(u => u.usuario === user);
                        console.log(currentUser)
                        if (currentUser) {
                            localStorage.setItem('privilegio', currentUser.privilegio);
                        }
                    }
                } catch (e) {

                }

                navigate('/');
            }

        } catch (err) {

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.',
                confirmButtonColor: '#007bff'
            });
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <AuthContext.Provider value={{ user, setUser, password, setPassword, handleSubmit, errors, setErrors, isLoading }}>
            {children}
        </AuthContext.Provider>
    )




}
export const useAuth = () => {
    return useContext(AuthContext)
}
