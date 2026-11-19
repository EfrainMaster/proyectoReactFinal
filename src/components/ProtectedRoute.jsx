import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading, authError } = useAuth()
  const location = useLocation()

  if (loading) {
    return <section className="auth-page"><p>Verificando sesión...</p></section>
  }

  if (authError) {
    return <section className="auth-page"><p className="auth-error">{authError}</p></section>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/acceso-denegado" replace />
  }

  return children
}
