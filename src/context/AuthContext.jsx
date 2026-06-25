import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { NumerosContext } from './NumerosContext.jsx'
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const { setIsAuth } = useContext(NumerosContext)
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    useEffect(()=>{
    const isAuthenticated = localStorage.getItem('isAuth') === 'true'
    if(isAuthenticated){
      setIsAuth(true)
      navigate('/admin')
    }
  },[])

    const handleSubmit = async (e) => {
        e.preventDefault();
        let validationErrors = {};
        if (!user) validationErrors.user = 'Email es requerido';
        if (!password) validationErrors.password = 'Password es requerido';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await fetch('public/data/user.json');
            const users = await res.json();

            const foundUser = users.find(
                (u) => u.user === user && u.password === password
            );

            if (!foundUser) {
                setErrors({ user: 'credenciales invalidas' });
                alert('Credenciales inválidas. Serás redirigido a la página principal.');
                setTimeout(() => {
                     navigate('/');
                }, 1000);
               
            } else {

                if (foundUser.role === 'admin') {
                    setIsAuth(true);
                    localStorage.setItem("isAuth", true)

                    navigate('/admin');
                } else {
                    navigate('/');
                    setIsAuth(false);
                    localStorage.setItem("isAuth", false)
                }
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setErrors({ user: 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.' });
        }

    }

  return(
    <AuthContext.Provider value={{ user, setUser, password, setPassword, handleSubmit,errors, setErrors }}>
        {children}
    </AuthContext.Provider>
  )




}
export const useAuth = () => {
    return useContext(AuthContext)
}