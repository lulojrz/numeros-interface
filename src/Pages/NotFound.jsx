import { Link } from 'react-router-dom'

const NotFound = () => (
  <main className="container text-center px-3">
    <div>
      <p className="display-1 fw-bold text-primary mb-0">404</p>
      <h1 className="h3 fw-semibold mb-3">Página no encontrada</h1>
      <p className="text-body-secondary mb-4">
        La dirección que buscas no existe o fue movida.
      </p>
      <Link className="btn btn-primary rounded-pill px-4" to="/">
        <i className="bi bi-house me-2" aria-hidden="true"></i>
        Volver al inicio
      </Link>
    </div>
  </main>
)

export default NotFound
