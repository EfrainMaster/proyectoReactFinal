import Header from './Header'
import Footer from './Footer'

// Layout base de la tienda: Header, navegación rápida y Footer en todas las páginas.
export default function Layout({ children }) {
  return (
    <div className="layout-shell">
      <Header />
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  )
}
