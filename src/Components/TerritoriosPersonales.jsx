import React, { useState, useEffect } from 'react';
import MisReservas from './MisReservas';
import Swal from 'sweetalert2';

const normalizarTexto = (texto) =>
    String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

const formatearTelefonoWhatsApp = (telefonoRaw) => {
    const digitos = String(telefonoRaw || '').replace(/\D/g, '');
    if (!digitos) return '';
    if (digitos.startsWith('549')) return digitos;
    if (digitos.startsWith('54')) return `549${digitos.slice(2)}`;
    if (digitos.startsWith('0')) return `549${digitos.slice(1)}`;
    return `549${digitos}`;
};

const TerritoriosPersonales = () => {
    const loggedInUsername = localStorage.getItem('usuario');
    const privilegio = localStorage.getItem('privilegio');
    const isAdmin = privilegio === 'ROLE_ANC' || privilegio === 'ROLE_SM';

    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);
    const [tabActiva, setTabActiva] = useState('telefonica');

    const [misReservas, setMisReservas] = useState([]);
    const [usuariosConTerritorios, setUsuariosConTerritorios] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(true);
    const [encargado, setEncargado] = useState(null);

    // 1. Cargar reservas reales del usuario, resumen admin (si aplica) y encargado
    useEffect(() => {
        const api = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        const cargarDatos = async () => {
            setLoadingReservas(true);
            try {
                const peticiones = [
                    fetch(`${api}/api/numeros/mis-reservas?usuario=${encodeURIComponent(loggedInUsername)}`),
                    fetch(`${api}/usuarios?page=0&size=200`)
                ];

                if (isAdmin) {
                    peticiones.push(fetch(`${api}/api/numeros/resumen-reservas`));
                }

                const [resMisReservas, resUsuarios, resResumen] = await Promise.all(peticiones);

                if (resMisReservas.ok) {
                    setMisReservas(await resMisReservas.json());
                }

                if (resUsuarios.ok) {
                    const dataUsuarios = await resUsuarios.json();
                    if (Array.isArray(dataUsuarios)) {
                        const encargadoEncontrado = dataUsuarios.find(u => {
                            const asig = normalizarTexto(u.asignacion);
                            return (
                                asig.includes('telefonica') ||
                                asig.includes('telefonicos') ||
                                asig.includes('personales')
                            );
                        });
                        setEncargado(encargadoEncontrado || null);
                    }
                }

                if (isAdmin && resResumen && resResumen.ok) {
                    const resumen = await resResumen.json();
                    setUsuariosConTerritorios(resumen.map(r => ({
                        usuario: r.usuario,
                        territorios: r.territorios,
                        fechaAsignacion: r.fechaAsignacion
                            ? new Date(r.fechaAsignacion).toLocaleDateString()
                            : 'Sin fecha'
                    })));
                }
            } catch (e) {
                console.error("Error al cargar datos de territorios personales:", e);
            } finally {
                setLoadingReservas(false);
            }
        };

        if (loggedInUsername) {
            cargarDatos();
        }
    }, [loggedInUsername, isAdmin]);

    // 2. Cálculos de progreso y vencimiento sobre misReservas reales
    const tieneReservas = misReservas.length > 0;
    let fechaAsignacion = null;
    let diasRestantes = 0;
    let progreso = 0;
    let colorProgreso = 'bg-success';
    const DIAS_TOTALES = 90;

    if (tieneReservas) {
        const fechasValidas = misReservas
            .map(n => n.fechaReserva)
            .filter(f => f != null)
            .map(f => new Date(f).getTime());

        if (fechasValidas.length > 0) {
            const fechaMinima = Math.min(...fechasValidas);
            fechaAsignacion = new Date(fechaMinima);

            const fechaLimite = new Date(fechaAsignacion.getTime() + (DIAS_TOTALES * 24 * 60 * 60 * 1000));
            const hoy = new Date();
            const diferenciaMs = fechaLimite.getTime() - hoy.getTime();
            diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

            if (diasRestantes < 0) diasRestantes = 0;

            progreso = ((DIAS_TOTALES - diasRestantes) / DIAS_TOTALES) * 100;
            if (progreso > 100) progreso = 100;

            if (diasRestantes <= 15) {
                colorProgreso = 'bg-danger';
            } else if (diasRestantes <= 30) {
                colorProgreso = 'bg-warning';
            }
        }
    }

    const nombreEncargado = encargado
        ? [encargado.nombre, encargado.apellido].filter(Boolean).join(' ').trim() || encargado.usuario
        : null;

    const telefonoEncargadoWhatsApp = encargado ? formatearTelefonoWhatsApp(encargado.telefono) : '';

    const enviarMensaje = (e) => {
        e.preventDefault();
        const especificacion = e.target.querySelector('input[type="text"]').value.trim();

        if (!telefonoEncargadoWhatsApp) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin teléfono configurado',
                text: nombreEncargado
                    ? `El encargado (${nombreEncargado}) aún no tiene un teléfono cargado en su perfil.`
                    : 'No hay un hermano asignado como encargado de predicación telefónica en el sistema.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        const saludo = nombreEncargado ? `Hola ${nombreEncargado}!` : 'Hola!';
        const mensaje = encodeURIComponent(`${saludo} Me gustaría pedir un territorio personal en la zona de ${especificacion}`);
        const url = `https://api.whatsapp.com/send?phone=${telefonoEncargadoWhatsApp}&text=${mensaje}`;
        window.open(url, '_blank');
    };

    return (
        <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '1rem' }}>
            {tieneReservas ? (
                <div className="mt-2">
                    {fechaAsignacion && (
                        <div className="card shadow-sm mb-4 border-0 bg-body-tertiary" style={{ borderRadius: '0.75rem' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <h5 className="card-title text-primary fw-bold mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Progreso del Territorio
                                    </h5>
                                    <div>
                                        <button
                                            className="btn btn-outline-primary btn-sm rounded-pill me-2 fw-semibold shadow-sm"
                                            onClick={() => setMostrarModalAyuda(true)}
                                        >
                                            <i className="bi bi-question-circle me-1"></i>
                                            ¿Cómo trabajarlo?
                                        </button>
                                        <span className={`badge ${diasRestantes <= 15 ? 'bg-danger' : diasRestantes <= 30 ? 'bg-warning text-body' : 'bg-success'} fs-6 px-3 py-2 shadow-sm rounded-pill`}>
                                            {diasRestantes} días restantes
                                        </span>
                                    </div>
                                </div>

                                <div className="progress mb-3 shadow-sm bg-secondary-subtle" style={{ height: '1.5rem', borderRadius: '1rem' }}>
                                    <div
                                        className={`progress-bar progress-bar-striped progress-bar-animated ${colorProgreso}`}
                                        role="progressbar"
                                        style={{ width: `${progreso}%` }}
                                        aria-valuenow={progreso}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>

                                <div className="d-flex justify-content-between text-muted small fw-semibold px-1">
                                    <span>
                                        <i className="bi bi-calendar-check me-1 text-primary"></i>
                                        Asignado: {fechaAsignacion.toLocaleDateString()}
                                    </span>
                                    <span>
                                        <i className="bi bi-calendar-x me-1 text-danger"></i>
                                        Vence: {new Date(fechaAsignacion.getTime() + (DIAS_TOTALES * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <MisReservas hideEmpty={false} />
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '3rem' }}></i>
                        <h3 className="text-primary mt-2">Territorios Personales</h3>
                    </div>

                    <div className="alert alert-primary shadow-sm mb-4 mx-auto" style={{ maxWidth: '700px', borderRadius: '0.75rem' }}>
                        <h5 className="alert-heading fw-bold"><i className="bi bi-info-circle me-2"></i>¿Cómo funciona?</h5>
                        <p className="mb-0">
                            Al solicitar un territorio, los números correspondientes a esa zona quedarán reservados a tu nombre y ningún otro usuario podrá verlos o llamarlos.
                            ¿Cómo lo devuelvo? Simplemente contacta al hermano encargado y pídele que lo libere para que otros puedan usarlo.
                        </p>
                    </div>

                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                        <form onSubmit={enviarMensaje} className="p-3 bg-body border rounded-3 shadow-sm">
                            <label htmlFor="territorio" className="form-label fw-semibold text-body-secondary mb-3">
                                <i className="bi bi-whatsapp text-success me-2"></i>
                                {loadingReservas
                                    ? 'Buscando encargado de telefónica...'
                                    : nombreEncargado
                                        ? <>Solicita tu territorio a <span className="text-body fw-bold">{nombreEncargado}</span>{encargado?.telefono ? ` (${encargado.telefono})` : ''}:</>
                                        : 'No hay un encargado de telefónica asignado actualmente'}
                            </label>

                            <div className="input-group input-group-lg mb-2">
                                <span className="input-group-text bg-body-tertiary text-body-secondary">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    id="territorio"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Cabildo al 2000, cerca del Parque..."
                                    disabled={loadingReservas || !telefonoEncargadoWhatsApp}
                                    required
                                />
                                <button
                                    className="btn btn-success fw-semibold px-4"
                                    type="submit"
                                    disabled={loadingReservas || !telefonoEncargadoWhatsApp}
                                >
                                    Enviar
                                </button>
                            </div>
                            <div className="form-text text-muted small text-center mt-2">
                                {telefonoEncargadoWhatsApp
                                    ? `Serás redirigido a WhatsApp para enviar tu solicitud a ${nombreEncargado}.`
                                    : !loadingReservas && 'Para habilitar el envío, un administrador debe asignar "Telefónica" y cargar un teléfono en el usuario encargado.'}
                            </div>
                        </form>
                    </div>

                    <div className="mt-4 mx-auto text-center">
                        <button
                            className="btn btn-outline-primary mb-3 fw-semibold"
                            onClick={() => setMostrarMapa(true)}
                        >
                            <i className="bi bi-map me-2"></i>
                            Ver mapa de zonas
                        </button>

                        {mostrarMapa && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                zIndex: 9999,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '1rem'
                            }}>
                                <div className="shadow-lg bg-body" style={{
                                    width: '100%',
                                    maxWidth: '1200px',
                                    height: '90vh',
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-body-tertiary">
                                        <h5 className="m-0 fw-bold text-primary">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            Mapa de Territorios
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setMostrarMapa(false)}
                                            aria-label="Cerrar"
                                        ></button>
                                    </div>
                                    <div className="flex-grow-1 position-relative">
                                        <iframe
                                            src="https://www.google.com/maps/d/embed?mid=1Q2YLge2FsHV1aUYzNV4fzLL8MHNwV2Y&ehbc=2E312F"
                                            title="Mapa de territorios"
                                            style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {mostrarModalAyuda && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '600px', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-lightbulb me-2"></i>Formas de predicar</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalAyuda(false)}></button>
                        </div>
                        <div className="card-body p-0">
                            <ul className="nav nav-tabs nav-fill bg-body-secondary pt-2" style={{ borderBottom: '2px solid var(--bs-border-color)' }}>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'telefonica' ? 'active text-primary' : 'text-body-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'telefonica' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('telefonica')}>
                                        <i className="bi bi-telephone-fill me-2"></i>Telefónica
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'cartas' ? 'active text-primary' : 'text-body-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'cartas' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('cartas')}>
                                        <i className="bi bi-envelope-paper-fill me-2"></i>Cartas
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link fw-bold ${tabActiva === 'publica' ? 'active text-primary' : 'text-body-secondary'}`} style={{ border: 'none', borderBottom: tabActiva === 'publica' ? '3px solid #0d6efd' : '3px solid transparent' }} onClick={() => setTabActiva('publica')}>
                                        <i className="bi bi-signpost-split-fill me-2"></i>Pública
                                    </button>
                                </li>
                            </ul>

                            <div className="p-4 bg-body" style={{ minHeight: '200px' }}>
                                {tabActiva === 'telefonica' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación Telefónica</h6>
                                        <p className="text-muted">Utiliza la lista de números que aparece abajo en <strong>"Mis Reservas"</strong>. Tienes los números telefónicos exclusivos de tu territorio.</p>
                                        <ul className="text-muted small">
                                            <li>Al llamar, anota si la persona contesta o no usando el botón correspondiente.</li>
                                            <li>Puedes marcarlo como NO TOCAR si la persona pidió que no la llamen más.</li>
                                            <li>Recuerda ser amable y breve en tu presentación.</li>
                                        </ul>
                                    </div>
                                )}
                                {tabActiva === 'cartas' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación por Cartas</h6>
                                        <p className="text-muted">Junto a los números telefónicos, también puedes ver la <strong>dirección y edificio</strong>.</p>
                                        <ul className="text-muted small mb-0">
                                            <li>Usa estas direcciones postales para enviar cartas a los vecinos de tu territorio.</li>
                                            <li>Es ideal para aquellos números que nunca contestan o donde es difícil encontrar gente en casa.</li>
                                            <li>Recuerda incluir un folleto o tratado y usar remitentes adecuados.</li>
                                        </ul>
                                    </div>
                                )}
                                {tabActiva === 'publica' && (
                                    <div className="animate__animated animate__fadeIn">
                                        <h6 className="text-primary fw-bold mb-3">Predicación Pública (Carritos/Banners)</h6>
                                        <p className="text-muted">Si las condiciones lo permiten, puedes organizar la predicación pública dentro de los límites de tu territorio.</p>
                                        <ul className="text-muted small mb-0">
                                            <li>Ponte de acuerdo con un hermano/a para ubicar un exhibidor portátil (carrito) en una zona transitada de este territorio.</li>
                                            <li>Es una excelente manera de abordar a las personas de esta zona de forma directa.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card-footer bg-body-tertiary text-end p-3">
                            <button className="btn btn-secondary px-4 shadow-sm" onClick={() => setMostrarModalAyuda(false)}>Entendido</button>
                        </div>
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className="mt-5 border-top pt-4">
                    <h4 className="text-primary fw-bold mb-3">
                        <i className="bi bi-people-fill me-2"></i>
                        Usuarios con Territorios Asignados
                    </h4>
                    {usuariosConTerritorios.length === 0 ? (
                        <div className="alert alert-info shadow-sm border-0" style={{ borderRadius: '0.75rem' }}>
                            <i className="bi bi-info-circle me-2"></i>No hay territorios asignados a ningún usuario actualmente.
                        </div>
                    ) : (
                        <div className="table-responsive shadow-sm rounded-3">
                            <table className="table table-hover table-striped align-middle mb-0 bg-body">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-body-secondary fw-semibold border-0 py-3 ps-4 rounded-start">Usuario</th>
                                        <th className="text-body-secondary fw-semibold border-0 py-3">Territorios</th>
                                        <th className="text-body-secondary fw-semibold border-0 py-3 pe-4 rounded-end">Fecha de Asignación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosConTerritorios.map((u, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-bold ps-4">{u.usuario}</td>
                                            <td>{u.territorios}</td>
                                            <td className="pe-4">{u.fechaAsignacion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TerritoriosPersonales;