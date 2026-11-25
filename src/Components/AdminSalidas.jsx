import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { obtenerConflictoAsignacion } from '../utils/territorioAsignaciones';
import { fetchConCsrf } from '../utils/csrf';
import { traerTodosLosUsuarios } from '../utils/usuarios';

const AdminSalidas = () => {
    const api = import.meta.env.VITE_API_URL;
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [salidas, setSalidas] = useState([]);
    const [territorios, setTerritorios] = useState([]);
    const [paginaConductores, setPaginaConductores] = useState(1);
    const [loading, setLoading] = useState(true);
    const [mapaViewer, setMapaViewer] = useState(false);
    const [vistaSemana, setVistaSemana] = useState('actual'); // 'pasadas' | 'actual' | 'proximas'

    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [puntoEncuentro, setPuntoEncuentro] = useState('');
    const [conductorId, setConductorId] = useState('');
    const [territorioId, setTerritorioId] = useState('');
    const [territorio2Id, setTerritorio2Id] = useState('');
    const [territorio3Id, setTerritorio3Id] = useState('');
    const [grupos, setGrupos] = useState('Toda la congregación');
    const [repetirProximaSemana, setRepetirProximaSemana] = useState(false);

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resDisp, usuarios, resSalidas, resTerr] = await Promise.all([
                fetch(`${api}/disponibilidades/traer`, { credentials: 'include' }),
                traerTodosLosUsuarios(api),
                fetch(`${api}/salidas/traer`, { credentials: 'include' }),
                fetch(`${api}/territorios/traer`, { credentials: 'include' })
            ]);
            if (resDisp.ok) setDisponibilidades(await resDisp.json());
            setConductores(usuarios
                .filter(usuario => usuario.conductor === true || usuario.conductor === 'true' || usuario.conductor === 1 || usuario.conductor === '1')
                .sort((a, b) => `${a.apellido || ''} ${a.nombre || ''}`.localeCompare(`${b.apellido || ''} ${b.nombre || ''}`, 'es')));
            if (resSalidas.ok) setSalidas(await resSalidas.json());
            if (resTerr.ok) setTerritorios(await resTerr.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const conductoresPorPagina = 8;
    const totalPaginasConductores = Math.ceil(conductores.length / conductoresPorPagina);
    const conductoresVisibles = conductores.slice(
        (paginaConductores - 1) * conductoresPorPagina,
        paginaConductores * conductoresPorPagina
    );

    useEffect(() => {
        if (totalPaginasConductores > 0 && paginaConductores > totalPaginasConductores) {
            setPaginaConductores(totalPaginasConductores);
        }
    }, [paginaConductores, totalPaginasConductores]);

    const sumarDiasAFecha = (fechaStr, dias) => {
        const fechaObj = new Date(`${fechaStr}T12:00:00`);
        fechaObj.setDate(fechaObj.getDate() + dias);
        const y = fechaObj.getFullYear();
        const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const d = String(fechaObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const crearSalida = async (e) => {
        e.preventDefault();
        try {
            const fechasACrear = repetirProximaSemana
                ? [fecha, sumarDiasAFecha(fecha, 7)]
                : [fecha];

            for (let i = 0; i < fechasACrear.length; i++) {
                const fechaActual = fechasACrear[i];
                const body = {
                    fecha: fechaActual,
                    hora,
                    puntoEncuentro,
                    grupos,
                    conductor: { id: conductorId }
                };
                if (territorioId) body.territorio = { id: territorioId };
                if (territorio2Id) body.territorio2 = { id: territorio2Id };
                if (territorio3Id) body.territorio3 = { id: territorio3Id };

                const res = await fetchConCsrf(`${api}/salidas/agregar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const error = await res.text();
                    Toast.fire({
                        icon: 'error',
                        title: i === 0
                            ? 'No se pudo programar la salida'
                            : `Se guardó el ${fecha}, pero falló la repetición del ${fechaActual}`,
                        text: error || `Error del servidor (${res.status})`
                    });
                    await fetchData();
                    return;
                }
            }

            Toast.fire({
                icon: 'success',
                title: repetirProximaSemana ? 'Salidas programadas (2 semanas)' : 'Salida programada'
            });

            setFecha('');
            setHora('');
            setPuntoEncuentro('');
            setConductorId('');
            setTerritorioId('');
            setTerritorio2Id('');
            setTerritorio3Id('');
            setGrupos('Toda la congregación');
            setRepetirProximaSemana(false);
            await fetchData();
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: 'error', title: 'Error de conexión al programar la salida' });
        }
    };

    const borrarSalida = async (id) => {
        try {
            const res = await fetchConCsrf(`${api}/salidas/borrar/${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                Toast.fire({ icon: 'success', title: 'Borrada' });
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Utilidades de fecha y agrupación semanal (Lunes a Domingo)
    const obtenerLunesDeSemana = (fechaStr) => {
        const fechaObj = new Date(`${fechaStr}T12:00:00`);
        const dia = fechaObj.getDay(); // 0 = Domingo, 1 = Lunes ... 6 = Sábado
        const diffALunes = dia === 0 ? -6 : 1 - dia;
        const lunes = new Date(fechaObj);
        lunes.setDate(fechaObj.getDate() + diffALunes);
        return lunes;
    };

    const formatearClaveSemana = (fechaObj) => {
        const y = fechaObj.getFullYear();
        const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const d = String(fechaObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const obtenerNombreDia = (fechaStr) => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias[new Date(`${fechaStr}T12:00:00`).getDay()];
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    // Agrupar disponibilidades por día
    const dispPorDia = disponibilidades.reduce((acc, d) => {
        if (!acc[d.diaSemana]) acc[d.diaSemana] = [];
        acc[d.diaSemana].push(d);
        return acc;
    }, {});

    // Calcular claves de referencia (Lunes de cada semana)
    const lunesActual = obtenerLunesDeSemana(formatearClaveSemana(new Date()));
    const lunesActualClave = formatearClaveSemana(lunesActual);

    const lunesHaceDosSemanas = new Date(lunesActual);
    lunesHaceDosSemanas.setDate(lunesActual.getDate() - 14);
    const lunesHaceDosSemanasClave = formatearClaveSemana(lunesHaceDosSemanas);

    const lunesEnDosSemanas = new Date(lunesActual);
    lunesEnDosSemanas.setDate(lunesActual.getDate() + 14);
    const lunesEnDosSemanasClave = formatearClaveSemana(lunesEnDosSemanas);

    const salidasOrdenadas = [...salidas].sort((a, b) => {
        const cmpFecha = (a.fecha || '').localeCompare(b.fecha || '');
        return cmpFecha !== 0 ? cmpFecha : (a.hora || '').localeCompare(b.hora || '');
    });

    const semanasMap = salidasOrdenadas.reduce((acc, s) => {
        if (!s.fecha) return acc;
        const lunes = obtenerLunesDeSemana(s.fecha);
        const clave = formatearClaveSemana(lunes);

        // Filtrado según el botón activo
        if (vistaSemana === 'pasadas' && !(clave >= lunesHaceDosSemanasClave && clave < lunesActualClave)) {
            return acc;
        }
        if (vistaSemana === 'actual' && clave !== lunesActualClave) {
            return acc;
        }
        if (vistaSemana === 'proximas' && !(clave > lunesActualClave && clave <= lunesEnDosSemanasClave)) {
            return acc;
        }

        if (!acc[clave]) {
            const domingo = new Date(lunes);
            domingo.setDate(lunes.getDate() + 6);
            acc[clave] = {
                clave,
                esActual: clave === lunesActualClave,
                esPasada: clave < lunesActualClave,
                titulo: `Semana del ${lunes.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} al ${domingo.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`,
                items: []
            };
        }
        acc[clave].items.push(s);
        return acc;
    }, {});

    const semanasAgrupadas = Object.values(semanasMap);

    // Validación de conflictos para los 3 territorios (contemplando la 2da semana si está tildada)
    const fechasAValidar = fecha && hora
        ? (repetirProximaSemana ? [fecha, sumarDiasAFecha(fecha, 7)] : [fecha])
        : [];

    const idsSeleccionados = [territorioId, territorio2Id, territorio3Id]
        .filter(Boolean)
        .map(id => Number(id));

    const conflictosActivos = [];
    idsSeleccionados.forEach(id => {
        const terr = territorios.find(t => Number(t.id) === id);
        if (!terr) return;

        for (const f of fechasAValidar) {
            const inicio = new Date(`${f}T${hora}:00`);
            const fin = new Date(`${f}T23:59:59`);
            const usuarioConf = obtenerConflictoAsignacion(terr, conductorId, inicio, fin);
            if (usuarioConf) {
                conflictosActivos.push({
                    territorio: terr,
                    usuario: usuarioConf,
                    fecha: f
                });
                break;
            }
        }
    });

    // Precalcular sugeridos y otros territorios una sola vez para los 3 selectores
    const territoriosOrdenados = [...territorios].sort((a, b) => {
        if (!a.ultimaFechaTrabajada) return -1;
        if (!b.ultimaFechaTrabajada) return 1;
        return new Date(a.ultimaFechaTrabajada) - new Date(b.ultimaFechaTrabajada);
    });
    const territoriosSugeridos = territoriosOrdenados.slice(0, 3);
    const sugeridosIds = territoriosSugeridos.map(t => t.id);
    const otrosTerritorios = territorios.filter(t => !sugeridosIds.includes(t.id));

    const renderOpcionesTerritorios = (valorActual) => {
        const otrosIdsElegidos = idsSeleccionados.filter(id => id !== Number(valorActual));

        const renderOption = (t, mostrarNuncaTrabajado) => {
            const yaElegidoEnOtroSlot = otrosIdsElegidos.includes(Number(t.id));
            let conflicto = null;
            for (const f of fechasAValidar) {
                const inicio = new Date(`${f}T${hora}:00`);
                const fin = new Date(`${f}T23:59:59`);
                conflicto = obtenerConflictoAsignacion(t, conductorId, inicio, fin);
                if (conflicto) break;
            }

            return (
                <option
                    key={t.id}
                    value={t.id}
                    disabled={yaElegidoEnOtroSlot || Boolean(conflicto)}
                >
                    Territorio {t.numero} - {t.manzanas?.length || 0} manzanas{' '}
                    {t.ultimaFechaTrabajada
                        ? `(Última vez: ${new Date(t.ultimaFechaTrabajada).toLocaleDateString()})`
                        : mostrarNuncaTrabajado ? '(Nunca trabajado)' : ''}
                    {yaElegidoEnOtroSlot ? ' — ya seleccionado en esta salida' : ''}
                    {!yaElegidoEnOtroSlot && conflicto
                        ? ` — asignado a ${conflicto.nombre || 'otro usuario'}`
                        : ''}
                </option>
            );
        };

        return (
            <>
                {territoriosSugeridos.length > 0 && (
                    <optgroup label="Sugeridos (Hace mucho no se trabajan)">
                        {territoriosSugeridos.map(t => renderOption(t, true))}
                    </optgroup>
                )}
                {otrosTerritorios.length > 0 && (
                    <optgroup label="Otros Territorios">
                        {otrosTerritorios.map(t => renderOption(t, false))}
                    </optgroup>
                )}
            </>
        );
    };

    const slotsTerritorios = [
        { label: 'Territorio 1 (Opcional)', value: territorioId, setter: setTerritorioId },
        { label: 'Territorio 2 (Opcional)', value: territorio2Id, setter: setTerritorio2Id },
        { label: 'Territorio 3 (Opcional)', value: territorio3Id, setter: setTerritorio3Id }
    ];

    return (
        <div className="container mt-4 mb-5">
            <h2 className="h4 text-primary fw-bold mb-4">
                <i className="bi bi-calendar-range me-2"></i>Armar Programa de Salidas
            </h2>

            <div className="row g-4">
                <div className="col-12 col-lg-5">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-info bg-opacity-10 border-bottom-0 pt-3 pb-2">
                            <h5 className="fw-bold m-0 text-info-emphasis"><i className="bi bi-calendar-check me-2"></i>Disponibilidades fijas</h5>
                            <small className="text-body-secondary">Hermanos que indicaron un día y horario habitual.</small>
                        </div>
                        <div className="card-body p-0">
                            {Object.keys(dispPorDia).length === 0 ? (
                                <div className="p-4 text-center text-muted">Ningún hermano ha cargado disponibilidades aún.</div>
                            ) : (
                                <div className="accordion accordion-flush" id="accordionDisp">
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => {
                                        const lista = dispPorDia[dia];
                                        if (!lista) return null;
                                        return (
                                            <div className="accordion-item" key={dia}>
                                                <h2 className="accordion-header">
                                                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#col-${dia}`}>
                                                        {dia} ({lista.length})
                                                    </button>
                                                </h2>
                                                <div id={`col-${dia}`} className="accordion-collapse collapse" data-bs-parent="#accordionDisp">
                                                    <div className="accordion-body p-0">
                                                        <ul className="list-group list-group-flush">
                                                            {lista.map(d => (
                                                                <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                    <span><i className="bi bi-person-fill me-2 text-primary"></i>{d.usuario?.nombre} {d.usuario?.apellido}</span>
                                                                    <span className="badge bg-secondary rounded-pill">{d.hora} hs</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success bg-opacity-10 border-bottom-0 pt-3 pb-2">
                            <h5 className="fw-bold m-0 text-success"><i className="bi bi-people-fill me-2"></i>Conductores disponibles</h5>
                            <small className="text-body-secondary">Conductores habilitados en la congregación.</small>
                        </div>
                        <div className="list-group list-group-flush">
                            {conductores.length === 0 ? (
                                <div className="list-group-item text-center text-muted py-4">No hay conductores habilitados.</div>
                            ) : (
                                conductoresVisibles.map(usuario => (
                                    <div key={usuario.id} className="list-group-item d-flex align-items-center">
                                        <i className="bi bi-person-fill text-success me-2"></i>
                                        {usuario.nombre} {usuario.apellido}
                                    </div>
                                ))
                            )}
                        </div>
                        {totalPaginasConductores > 1 && (
                            <div className="card-footer bg-transparent d-flex justify-content-center align-items-center gap-3">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={paginaConductores === 1}
                                    onClick={() => setPaginaConductores(page => page - 1)}
                                >
                                    Anterior
                                </button>
                                <span className="small text-muted">
                                    Página {paginaConductores} de {totalPaginasConductores}
                                </span>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={paginaConductores === totalPaginasConductores}
                                    onClick={() => setPaginaConductores(page => page + 1)}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Formulario y Programa Semanal */}
                <div className="col-12 col-lg-7">
                    <div className="card shadow-sm border-0 mb-4 bg-body-tertiary">
                        <div className="card-body">
                            <h5 className="fw-bold mb-3"><i className="bi bi-plus-circle me-2"></i>Programar Nueva Salida</h5>
                            <form onSubmit={crearSalida} className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Fecha</label>
                                    <input type="date" className="form-control" required value={fecha} onChange={e => setFecha(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Hora</label>
                                    <input type="time" className="form-control" required value={hora} onChange={e => setHora(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Punto de Encuentro</label>
                                    <input type="text" className="form-control" required value={puntoEncuentro} onChange={e => setPuntoEncuentro(e.target.value)} placeholder="Ej: Salón, Casa hno Juan..." />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-primary">Grupo(s) Destinatario(s)</label>
                                    <input type="text" className="form-control border-primary" required value={grupos} onChange={e => setGrupos(e.target.value)} placeholder="Ej: Toda la congregación, Grupo 1 y 2..." />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold">Conductor</label>
                                    <select className="form-select" required value={conductorId} onChange={e => setConductorId(e.target.value)}>
                                        <option value="">Seleccione...</option>
                                        {conductores.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>{usuario.nombre} {usuario.apellido}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selección de hasta 3 Territorios */}
                                <div className="col-md-12">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label small fw-bold text-success m-0">
                                            <i className="bi bi-map-fill me-1"></i> Territorios Asignados (Hasta 3 opcionales)
                                        </label>
                                        <button type="button" className="btn btn-sm btn-outline-success fw-bold py-0" onClick={() => setMapaViewer('/mapa_general.jpg')}>
                                            <i className="bi bi-eye me-1"></i> Ver Mapa General
                                        </button>
                                    </div>

                                    <div className="row g-2">
                                        {slotsTerritorios.map((slot, idx) => {
                                            const terrObj = slot.value ? territorios.find(t => Number(t.id) === Number(slot.value)) : null;
                                            return (
                                                <div className="col-12" key={idx}>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text fw-semibold text-success bg-body">
                                                            #{idx + 1}
                                                        </span>
                                                        <select
                                                            className="form-select"
                                                            value={slot.value}
                                                            onChange={e => slot.setter(e.target.value)}
                                                            aria-label={slot.label}
                                                        >
                                                            <option value="">{slot.label} — Ninguno...</option>
                                                            {renderOpcionesTerritorios(slot.value)}
                                                        </select>
                                                        {terrObj?.imagen && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-info fw-bold"
                                                                onClick={() => setMapaViewer(terrObj.imagen)}
                                                                title={`Ver mapa del Territorio ${terrObj.numero}`}
                                                            >
                                                                <i className="bi bi-image"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {conflictosActivos.length > 0 && (
                                        <div className="form-text text-danger mt-2">
                                            {conflictosActivos.map(({ territorio, usuario, fecha: fechaConf }) => (
                                                <div key={territorio.id}>
                                                    El Territorio {territorio.numero} ya está asignado a {[usuario.nombre, usuario.apellido].filter(Boolean).join(' ')} el {new Date(`${fechaConf}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}.
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 pt-1">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="checkRepetirSemana"
                                            checked={repetirProximaSemana}
                                            onChange={(e) => setRepetirProximaSemana(e.target.checked)}
                                        />
                                        <label className="form-check-label small fw-semibold" htmlFor="checkRepetirSemana">
                                            <i className="bi bi-arrow-repeat me-1 text-primary"></i>
                                            Repetir también la próxima semana
                                            {fecha && (
                                                <span className="text-muted ms-1">
                                                    ({new Date(`${sumarDiasAFecha(fecha, 7)}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })})
                                                </span>
                                            )}
                                        </label>
                                    </div>

                                    <button type="submit" className="btn btn-primary fw-bold px-4" disabled={conflictosActivos.length > 0}>
                                        {repetirProximaSemana ? 'Guardar Ambas Salidas' : 'Guardar Salida'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                        <h5 className="fw-bold m-0">
                            <i className="bi bi-calendar-week me-2 text-primary"></i>Programa Armado
                        </h5>
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                type="button"
                                className={`btn ${vistaSemana === 'pasadas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setVistaSemana('pasadas')}
                            >
                                Últimas 2 semanas
                            </button>
                            <button
                                type="button"
                                className={`btn ${vistaSemana === 'actual' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setVistaSemana('actual')}
                            >
                                Semana actual
                            </button>
                            <button
                                type="button"
                                className={`btn ${vistaSemana === 'proximas' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setVistaSemana('proximas')}
                            >
                                Próximas 2 semanas
                            </button>
                        </div>
                    </div>

                    {semanasAgrupadas.length === 0 ? (
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center text-muted py-4">
                                No hay salidas programadas para este rango de semanas.
                            </div>
                        </div>
                    ) : (
                        semanasAgrupadas.map((semana) => (
                            <div
                                key={semana.clave}
                                className={`card shadow-sm mb-3 ${semana.esActual ? 'border-primary' : 'border-0'}`}
                            >
                                <div className={`card-header d-flex justify-content-between align-items-center py-2 ${semana.esActual ? 'bg-primary bg-opacity-10 text-primary' : 'bg-body-tertiary'}`}>
                                    <span className="fw-bold">
                                        <i className="bi bi-calendar3 me-2"></i>
                                        {semana.titulo}
                                    </span>
                                    <div className="d-flex align-items-center gap-2">
                                        {semana.esActual && (
                                            <span className="badge bg-primary">Semana actual</span>
                                        )}
                                        <span className="badge bg-secondary rounded-pill">
                                            {semana.items.length} {semana.items.length === 1 ? 'salida' : 'salidas'}
                                        </span>
                                    </div>
                                </div>
                                <div className="list-group list-group-flush">
                                    {semana.items.map((s) => {
                                        const territoriosDeSalida = [s.territorio, s.territorio2, s.territorio3].filter(Boolean);
                                        return (
                                            <div
                                                key={s.id}
                                                className="list-group-item list-group-item-action d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2"
                                            >
                                                <div>
                                                    <h6 className="fw-bold mb-1 d-flex flex-wrap align-items-center gap-2">
                                                        <span className="text-primary">{obtenerNombreDia(s.fecha)}</span>
                                                        <span>
                                                            {new Date(`${s.fecha}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} — {s.hora} hs
                                                        </span>
                                                        <span className="badge bg-primary">{s.grupos || 'Toda la congregación'}</span>
                                                    </h6>
                                                    <div className="small text-muted d-flex flex-wrap align-items-center gap-1">
                                                        <span>
                                                            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {s.puntoEncuentro}
                                                        </span>
                                                        {territoriosDeSalida.map((terr, i) => (
                                                            <span key={terr.id || i} className="ms-1 badge bg-success">
                                                                <i className="bi bi-map-fill me-1"></i>Territorio {terr.numero}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="small text-muted mt-1">
                                                        <i className="bi bi-person-fill text-primary me-1"></i> Conduce: {s.conductor?.nombre} {s.conductor?.apellido}
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => borrarSalida(s.id)}
                                                    title="Eliminar salida"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Visor de Mapa */}
            {mapaViewer && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative', maxWidth: '95%', maxHeight: '95%' }}>
                        <button onClick={() => setMapaViewer(false)} className="btn btn-danger position-absolute shadow" style={{ top: '-15px', right: '-15px', borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <img src={typeof mapaViewer === 'string' ? mapaViewer : "/mapa_general.jpg"} alt="Mapa" className="img-fluid rounded shadow-lg" style={{ maxHeight: '90vh', objectFit: 'contain' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSalidas;