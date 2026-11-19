const team = [
  { name: 'Marina López', role: 'Directora de diseño' },
  { name: 'Mateo Ruiz', role: 'Gerente de compras' },
  { name: 'Sofía Alvarez', role: 'Customer experience' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="company-info">
          <h3>Efrain Store</h3>
          <p>
            Diseñamos experiencias de compra modernas para el hogar y la vida digital,
            combinando calidad, estilo y atención cercana.
          </p>
        </div>

        <div className="team-grid">
          {team.map((person) => (
            <article key={person.name} className="team-card">
              <div className="avatar">{person.name.charAt(0)}</div>
              <h4>{person.name}</h4>
              <p>{person.role}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Efrain Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
