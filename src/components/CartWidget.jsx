import { Link } from 'react-router-dom'
import useCart from '../context/useCart'

// Este componente muestra la cantidad total de productos agregados al carrito.
export default function CartWidget() {
  const { totalItems } = useCart()

  return (
    <Link to="/carrito" className="cart-button" aria-label={`Carrito con ${totalItems} productos`}>
      <span className="cart-icon">🛒</span>
      <span>Carrito</span>
      <span className="cart-count">{totalItems}</span>
    </Link>
  )
}
