import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/products'
import Item from './Item'

const pageSize = 8

// Este componente carga el catálogo publicado en Firestore.
export default function ItemListContainer() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true

    getProducts()
      .then((data) => {
        if (active) setProductos(data)
      })
      .catch((loadError) => {
        if (active) setError(`No se pudo cargar el catálogo: ${loadError.message}`)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => [...new Set(productos.map((product) => product.categoria).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, 'es')),
    [productos],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return productos.filter((product) => {
      const matchesCategory = !selectedCategory || product.categoria === selectedCategory
      const searchableText = [product.nombre, product.categoria, product.descripcion]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      return matchesCategory && searchableText.includes(normalizedSearch)
    })
  }, [productos, search, selectedCategory])

  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const currentPage = Math.min(page, Math.max(totalPages, 1))
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  if (loading) {
    return (
      <section className="catalogue">
        <p>Cargando productos...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="catalogue">
        <p className="catalogue-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="catalogue">
      {productos.length === 0 ? (
        <p className="catalogue-empty">Todavía no hay productos publicados.</p>
      ) : (
        <>
          <section className="catalogue-categories" aria-labelledby="catalogue-categories-title">
            <h3 id="catalogue-categories-title">Categorías</h3>
            <div className="category-options" aria-label="Filtrar por categoría">
              <button
                type="button"
                className={`category-chip${selectedCategory === '' ? ' active' : ''}`}
                aria-pressed={selectedCategory === ''}
                onClick={() => {
                  setSelectedCategory('')
                  setPage(1)
                }}
              >
                Todas <span>{productos.length}</span>
              </button>
              {categories.map((category) => {
                const categoryCount = productos.filter((product) => product.categoria === category).length

                return (
                  <button
                    key={category}
                    type="button"
                    className={`category-chip${selectedCategory === category ? ' active' : ''}`}
                    aria-pressed={selectedCategory === category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setPage(1)
                    }}
                  >
                    {category} <span>{categoryCount}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="catalogue-toolbar">
            <label className="catalogue-search">
              <span>Buscar productos</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Nombre, categoría o descripción"
                aria-label="Buscar por nombre, categoría o descripción"
              />
            </label>
            <p className="catalogue-result-count" aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {visibleProducts.length === 0 ? (
            <p className="catalogue-empty" role="status">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            <div className="products-grid">
              {visibleProducts.map((producto) => (
                <Item key={producto.id} {...producto} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="catalogue-pagination" aria-label="Paginación del catálogo">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span aria-live="polite">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
