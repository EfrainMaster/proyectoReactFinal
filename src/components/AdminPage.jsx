import { useEffect, useState } from 'react'
import useAuth from '../context/useAuth'
import {
  createProduct,
  deleteProduct,
  getProducts,
  importLegacyProducts,
  updateProduct,
} from '../services/products'

const emptyForm = {
  nombre: '',
  categoria: '',
  precio: '',
  descripcion: '',
  imagen: '',
}

function validateProduct(form) {
  const nombre = form.nombre.trim()
  const categoria = form.categoria.trim()
  const precio = Number(form.precio)
  const imagen = form.imagen.trim()

  if (!nombre) return 'El nombre del producto es obligatorio.'
  if (!categoria) return 'La categoría es obligatoria.'
  if (!Number.isFinite(precio) || precio <= 0) return 'El precio debe ser un número mayor que cero.'

  if (imagen) {
    try {
      const imageUrl = new URL(imagen)
      if (!['http:', 'https:'].includes(imageUrl.protocol)) {
        return 'La imagen debe usar una dirección HTTP o HTTPS.'
      }
    } catch {
      return 'Ingresa una URL válida para la imagen.'
    }
  }

  return ''
}

function firebaseErrorMessage(error) {
  if (error.code === 'permission-denied') {
    return 'Firebase denegó la operación. Verifica las reglas de Firestore y el permiso admin.'
  }
  if (error.code === 'unavailable') {
    return 'Firestore no está disponible. Revisa tu conexión e inténtalo de nuevo.'
  }
  return error.message
}

export default function AdminPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    getProducts()
      .then((data) => {
        if (active) setProducts(data)
      })
      .catch((loadError) => {
        if (active) setError(`No se pudieron cargar los productos: ${firebaseErrorMessage(loadError)}`)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleEdit = (product) => {
    setForm({
      nombre: product.nombre || '',
      categoria: product.categoria || '',
      precio: String(product.precio ?? ''),
      descripcion: product.descripcion || '',
      imagen: product.imagen || '',
    })
    setEditingId(product.id)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateProduct(form)
    if (validationError) {
      setError(validationError)
      return
    }

    const productData = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      precio: Number(form.precio),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
    }

    setSaving(true)
    try {
      if (editingId) {
        const updatedProduct = await updateProduct(editingId, productData)
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingId ? updatedProduct : product,
          ),
        )
        setSuccess('El producto se actualizó correctamente.')
      } else {
        const createdProduct = await createProduct(productData)
        setProducts((currentProducts) => [...currentProducts, createdProduct])
        setSuccess('El producto se agregó correctamente.')
      }
      resetForm()
    } catch (saveError) {
      setError(`No se pudo guardar el producto: ${firebaseErrorMessage(saveError)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${product.nombre}"? Esta acción no se puede deshacer.`)
    if (!confirmed) return

    setError('')
    setSuccess('')
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== product.id),
      )
      if (editingId === product.id) resetForm()
      setSuccess(`Se eliminó "${product.nombre}".`)
    } catch (deleteError) {
      setError(`No se pudo eliminar el producto: ${firebaseErrorMessage(deleteError)}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleImport = async () => {
    const confirmed = window.confirm(
      '¿Importar los productos de public/productos.json a Firestore? Se conservarán sus IDs y los que ya existan no se sobrescribirán.',
    )
    if (!confirmed) return

    setError('')
    setSuccess('')
    setImporting(true)

    try {
      const response = await fetch('/productos.json')
      if (!response.ok) {
        throw new Error('No se pudo leer el catálogo local public/productos.json.')
      }

      const legacyProducts = await response.json()
      if (!Array.isArray(legacyProducts)) {
        throw new Error('El catálogo local no tiene un formato válido.')
      }

      const result = await importLegacyProducts(legacyProducts)
      const importedProducts = await getProducts()
      setProducts(importedProducts)
      setSuccess(
        `Importación completada: ${result.imported} agregados y ${result.skipped} omitidos porque ya existían.`,
      )
    } catch (importError) {
      setError(`No se pudo importar el catálogo: ${firebaseErrorMessage(importError)}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <span className="eyebrow">Administración</span>
        <h1>Gestión de productos</h1>
        <p>Sesión autorizada para {user.email}. Los cambios se guardan en Firestore.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h2>{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
        <div className="admin-form-grid">
          <label>
            Nombre *
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              maxLength={120}
              required
            />
          </label>
          <label>
            Categoría *
            <input
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </label>
          <label>
            Precio (ARS) *
            <input
              name="precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label>
            URL de imagen
            <input
              name="imagen"
              type="url"
              value={form.imagen}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>
          <label className="admin-description">
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
              maxLength={500}
            />
          </label>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="admin-success" role="status">{success}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          {editingId && (
            <button type="button" className="secondary-button" onClick={resetForm} disabled={saving}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="admin-products">
        <div className="admin-products-heading">
          <h2>Productos existentes ({products.length})</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={handleImport}
            disabled={importing || saving || deletingId !== null}
          >
            {importing ? 'Importando catálogo...' : 'Importar catálogo inicial'}
          </button>
        </div>
        {loading ? (
          <p role="status">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>Aún no hay productos en Firestore. Usa el formulario para agregar el primero.</p>
        ) : (
          <div className="admin-product-list">
            {products.map((product) => (
              <article key={product.id} className="admin-product">
                {product.imagen ? (
                  <img src={product.imagen} alt="" className="admin-product-image" />
                ) : (
                  <div className="admin-product-image admin-product-placeholder">Sin imagen</div>
                )}
                <div className="admin-product-info">
                  <h3>{product.nombre}</h3>
                  <p>{product.categoria} · {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 2,
                  }).format(product.precio)}</p>
                </div>
                <div className="admin-product-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleEdit(product)}
                    disabled={saving || deletingId !== null}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleDelete(product)}
                    disabled={saving || deletingId !== null}
                  >
                    {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
