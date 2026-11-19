import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

const firebaseErrorMessages = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/invalid-email': 'Ingresa un correo electrónico válido.',
  'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.',
  'auth/too-many-requests': 'Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
}

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        await register(email, password)
      } else {
        await login(email, password)
      }

      navigate(location.state?.from || '/', { replace: true })
    } catch (authError) {
      setError(firebaseErrorMessages[authError.code] || authError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">{isRegister ? 'Crear cuenta' : 'Tu cuenta'}</span>
        <h1>{isRegister ? 'Registro' : 'Iniciar sesión'}</h1>
        <label htmlFor="auth-email">Correo electrónico</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="auth-password">Contraseña</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
        </button>
        <p className="auth-switch">
          {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
          <Link to={isRegister ? '/login' : '/registro'}>
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </Link>
        </p>
      </form>
    </section>
  )
}
