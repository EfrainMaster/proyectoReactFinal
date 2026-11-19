import { Link } from 'react-router-dom'
import useCart from '../context/useCart'

// Plantilla reutilizable para cada tarjeta de producto del catálogo.
export default function Item({ id, nombre, categoria, precio, descripcion, imagen }) {
  const { addToCart } = useCart()
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio)

  return (
    <article className="product-card">
      {imagen ? (
        <img src={imagen} alt={nombre} className="product-image" />
      ) : (
        <div className="product-image product-image-placeholder">Sin imagen</div>
      )}

      <div className="product-body">
        <span className="product-category">{categoria}</span>
        <h3>{nombre}</h3>
        <p>{descripcion}</p>

        <div className="product-footer">
          <strong>{formattedPrice}</strong>
          <div className="product-actions">
            <button type="button" className="primary-button" onClick={() => addToCart({
              id,
              nombre,
              categoria,
              precio,
              descripcion,
              imagen,
            })}>
              Agregar
            </button>
            <Link to={`/producto/${id}`} className="secondary-button">
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
