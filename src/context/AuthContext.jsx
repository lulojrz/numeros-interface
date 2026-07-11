import React, { createContext, useContext, useState, useEffect } from 'react'
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
    }, [navigate, setIsAuth])

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
                body: JSON.stringify({ usuario: user, contrasena: password })
            });

            if (!res.ok) {
                const errorMessage = await res.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage || 'Credenciales incorrectas o error en la autenticación',
                    confirmButtonColor: '#007bff'
                });
                return;
            }

            const responseText = await res.text();

            if (responseText === "correcto") {
                setErrors({});
                setIsAuth(true);
                localStorage.setItem('isAuth', 'true');
                localStorage.setItem('usuario', user);
                
                // Le damos 150ms al navegador para asentar la cookie JSESSIONID antes de pedir los usuarios
                setTimeout(async () => {
                    try {
                        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { credentials: 'include' });
                        if (userRes.ok) {
                            const data = await userRes.json();
                            // Buscamos contemplando si mapeaste 'usuario' o 'username'
                            const currentUser = data.find(u => u.usuario === user || u.username === user);
                            
                            console.log("Usuario actual encontrado:", currentUser);
                            
                            if (currentUser) {
                                // Guardamos contemplando si en Java se llama 'privilegio' o 'role'
                                const userRole = currentUser.privilegio || currentUser.role;
                                localStorage.setItem('privilegio', userRole);
                            }
                        } else {
                            console.error("Error al traer lista de usuarios. Status:", userRes.status);
                        }
                    } catch (fetchUserError) {
                        console.error("Error de red al buscar el privilegio:", fetchUserError);
                    } finally {
                        // Navegamos al home una vez terminado el proceso
                        navigate('/');
                    }
                }, 150);
            }

        } catch (err) {
            console.error("Error crítico en el login:", err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.',
                confirmButtonColor: '#007bff'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, password, setPassword, handleSubmit, errors, setErrors, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
