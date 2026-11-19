import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import ItemListContainer from './components/ItemListContainer'
import AdminPage from './components/AdminPage'
import AuthPage from './components/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import useCart from './context/useCart'
import { getProduct } from './services/products'
import './App.css'

// Esta página sirve como inicio de la tienda y presenta la bienvenida al cliente.
const HomePage = () => (
  <>
    <section className="hero-banner">
      <div className="hero-copy">
        <span className="eyebrow">Nueva colección</span>
        <h1>Descubre tecnología que mejora cada momento.</h1>
        <p>
          En Efrain Store encontrarás productos premium para trabajar, crear, jugar y vivir
          mejor.
        </p>
        <div className="hero-actions">
          <Link to="/productos" className="primary-button">Ver catálogo</Link>
          <Link to="/carrito" className="secondary-button">Ir al carrito</Link>
        </div>
      </div>
      <div className="hero-visual" aria-label="Productos destacados">
        <div className="visual-card large">4K</div>
        <div className="visual-card small">Audio</div>
      </div>
    </section>

    <section className="features-section" id="destacados">
      <h2>Lo más destacado</h2>
      <div className="features-grid">
        <article>
          <span>⚡</span>
          <h3>Entrega rápida</h3>
          <p>Recibís tus productos en tiempo récord.</p>
        </article>
        <article>
          <span>🛡️</span>
          <h3>Garantía</h3>
          <p>Respaldo real en cada compra.</p>
        </article>
        <article>
          <span>💬</span>
          <h3>Atención</h3>
          <p>Soporte humano para resolver dudas.</p>
        </article>
      </div>
    </section>

    <section className="creator-section">
      <div className="creator-card">
        <p className="creator-label">Hecho por</p>
        <h3>Efrain Alcides Sanchez Pugeo</h3>
        <p>
          Este e-commerce fue desarrollado para mostrar una tienda online moderna con catálogo,
          rutas, detalle de producto y carrito funcional.
        </p>
      </div>
    </section>
  </>
)

// Vista del catálogo general donde se muestran todos los productos.
const ProductsPage = () => (
  <section className="catalogue-page">
    <div className="section-heading">
      <span className="eyebrow">Catálogo</span>
      <h2>Productos destacados</h2>
    </div>
    <ItemListContainer />
  </section>
)

// Detalle individual de cada producto, cargado según el id de la URL.
const ProductDetailPage = () => {
  const { id } = useParams()
  const [productState, setProductState] = useState({
    id: null,
    producto: null,
    loading: true,
    error: '',
  })
  const { addToCart } = useCart()

  useEffect(() => {
    let active = true

    getProduct(id)
      .then((product) => {
        if (active) setProductState({ id, producto: product, loading: false, error: '' })
      })
      .catch((loadError) => {
        if (active) {
          setProductState({
            id,
            producto: null,
            loading: false,
            error: `No se pudo cargar el producto: ${loadError.message}`,
          })
        }
      })

    return () => {
      active = false
    }
  }, [id])

  const loading = productState.id !== id || productState.loading
  const producto = productState.id === id ? productState.producto : null
  const error = productState.id === id ? productState.error : ''

  if (loading) {
    return <section className="product-detail-page"><p>Cargando detalle...</p></section>
  }

  if (!producto) {
    return (
      <section className="product-detail-page">
        <p className={error ? 'catalogue-error' : ''}>
          {error || 'Producto no encontrado.'}
        </p>
      </section>
    )
  }

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(producto.precio)

  return (
    <section className="product-detail-page">
      <div className="detail-card">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="detail-image" />
        ) : (
          <div className="detail-image product-image-placeholder">Sin imagen</div>
        )}

        <div className="detail-info">
          <span className="eyebrow">{producto.categoria}</span>
          <h2>{producto.nombre}</h2>
          <p className="detail-price">{precioFormateado}</p>
          <p>{producto.descripcion}</p>

          <div className="detail-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => addToCart(producto)}
            >
              Agregar al carrito
            </button>
            <Link to="/productos" className="secondary-button">Volver al catálogo</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Carrito de compras: muestra los productos agregados y el total actual.
const CartPage = () => {
  const {
    cart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    totalPrice,
  } = useCart()

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <h2>Tu carrito</h2>
        <div className="cart-empty">
          <p>Aún no agregaste productos.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <div className="cart-header">
        <h2>Tu carrito</h2>
        <button type="button" className="secondary-button" onClick={clearCart}>
          Vaciar carrito
        </button>
      </div>
      <div className="cart-list">
        {cart.map((item) => (
          <article key={item.id} className="cart-item">
            <img src={item.imagen} alt={item.nombre} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{item.nombre}</h3>
              <p>{item.categoria}</p>
              <div className="cart-item-controls">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${item.nombre}`}
                  onClick={() => decrementQuantity(item.id)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Agregar una unidad de ${item.nombre}`}
                  onClick={() => incrementQuantity(item.id)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="cart-item-actions">
              <strong>
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0,
                }).format(item.precio * item.quantity)}
              </strong>
              <button type="button" className="remove-button" onClick={() => removeFromCart(item.id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="cart-summary">
        <p>Total:</p>
        <strong>
          {new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
          }).format(totalPrice)}
        </strong>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* CartProvider hace que todo el sitio comparta el mismo estado del carrito */}
        <CartProvider>
          <Layout>
            {/* Aquí se configuran las rutas de la aplicación */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/registro" element={<AuthPage mode="register" />} />
              <Route
                path="/gestion"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/acceso-denegado"
                element={
                  <section className="auth-page">
                    <div className="auth-card">
                      <h1>Acceso denegado</h1>
                      <p>Tu cuenta no tiene permisos para ingresar al panel de gestión.</p>
                      <Link to="/" className="secondary-button">Volver al inicio</Link>
                    </div>
                  </section>
                }
              />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
