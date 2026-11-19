import { Link } from 'react-router-dom'
import { useState } from 'react'
import CartWidget from './CartWidget'
import useAuth from '../context/useAuth'

// Menu principal con las rutas de navegación de la tienda.
const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Productos', to: '/productos' },
  { label: 'Carrito', to: '/carrito' },
]

export default function Header() {
  const { user, isAdmin, authMessage, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    setLogoutError('')

    try {
      await logout()
    } catch (error) {
      setLogoutError(`No se pudo cerrar la sesión: ${error.message}`)
    }
  }

  return (
    <header className="site-header">
      <div className="header-branding">
        <Link to="/" className="brand-link">
          <span className="brand-mark">E</span>
          <div>
            <strong>Efrain Store</strong>
            <small>Home & Tech</small>
          </div>
        </Link>
      </div>

      <nav className="main-nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="nav-link">
            {item.label}
          </Link>
        ))}
        {isAdmin && <Link to="/gestion" className="nav-link">Gestión</Link>}
      </nav>

      <div className="header-actions">
        <span className="mini-badge">Envío gratis</span>
        {user ? (
          <>
            <p className="auth-status" role="status" aria-live="polite">
              <span className="auth-status-indicator" aria-hidden="true" />
              {authMessage || `Sesión activa: ${user.email}`}
            </p>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="secondary-button">Iniciar sesión</Link>
        )}
        <CartWidget />
        {logoutError && <span className="auth-error" role="alert">{logoutError}</span>}
      </div>
    </header>
  )
}
