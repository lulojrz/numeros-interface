import React from 'react'
import { NumerosContext } from '../context/NumerosContext'
import { useContext } from 'react'
import {AuthContext}  from '../context/AuthContext'
const Login = () => {

  const {user,setUser,password,setPassword,errors,setErrors,handleSubmit} = useContext(AuthContext)

  return (
    <>
   
     <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '400px',
        margin: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="user" style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Usuario
        </label>
        <input
          id="user"
          type="username"
          placeholder="Ingresar Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{
            padding: '0.5rem',
            border: `1px solid ${errors.user ? 'red' : '#ced4da'}`,
            borderRadius: '0.25rem',
          }}
        />
        {errors.user && (
          <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.user}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="formBasicPassword" style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Password
        </label>
        <input
          id="formBasicPassword"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '0.5rem',
            border: `1px solid ${errors.password ? 'red' : '#ced4da'}`,
            borderRadius: '0.25rem',
          }}
        />
        {errors.password && (
          <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.password}
          </div>
        )}
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '0.75rem',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Submit
      </button>
    </form>
  </>
  )
}

export default Login