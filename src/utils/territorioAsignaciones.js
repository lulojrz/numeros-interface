export const obtenerReservaDeSalida = (territorio, ahora = new Date()) => {
    const ahoraMs = ahora.getTime();

    return (Array.isArray(territorio?.asignaciones) ? territorio.asignaciones : [])
        .filter(asignacion => {
            if (asignacion.esSalida !== true || !asignacion.fechaAsignacion || !asignacion.fechaDevolucion) return false;
            const finMs = new Date(asignacion.fechaDevolucion).getTime();
            return Number.isFinite(finMs) && finMs >= ahoraMs;
        })
        .sort((a, b) => new Date(a.fechaAsignacion) - new Date(b.fechaAsignacion))[0] || null;
};

export const obtenerEstadoAsignacion = (territorio, ahora = new Date()) => {
    if (territorio?.asignadoA) {
        return { usuario: territorio.asignadoA, tipo: 'habitual' };
    }

    const reserva = obtenerReservaDeSalida(territorio, ahora);
    if (!reserva) return null;

    return { usuario: reserva.usuario, tipo: 'salida', asignacion: reserva };
};

export const obtenerConflictoAsignacion = (territorio, usuarioId, inicio, fin) => {
    if (!usuarioId || !inicio || !fin) return null;

    const usuarioIdNumero = Number(usuarioId);
    const inicioMs = inicio.getTime();
    const finMs = fin.getTime();
    if (!Number.isFinite(inicioMs) || !Number.isFinite(finMs)) return null;
    const asignaciones = Array.isArray(territorio?.asignaciones) ? territorio.asignaciones : [];

    const conflicto = asignaciones.find(asignacion => {
        const asignadoId = Number(asignacion.usuario?.id);
        if (!asignacion.fechaAsignacion) return false;
        const asignadoDesde = new Date(asignacion.fechaAsignacion).getTime();
        const asignadoHasta = asignacion.fechaDevolucion
            ? new Date(asignacion.fechaDevolucion).getTime()
            : Number.POSITIVE_INFINITY;

        return Number.isFinite(asignadoDesde) &&
            asignadoId !== usuarioIdNumero &&
            asignadoDesde <= finMs &&
            asignadoHasta >= inicioMs;
    });

    if (conflicto) return conflicto.usuario;

    const tieneAsignacionAbierta = asignaciones.some(asignacion =>
        !asignacion.fechaDevolucion && Number(asignacion.usuario?.id) === Number(territorio?.asignadoA?.id)
    );
    if (
        territorio?.asignadoA &&
        Number(territorio.asignadoA.id) !== usuarioIdNumero &&
        !tieneAsignacionAbierta &&
        finMs >= Date.now()
    ) {
        return territorio.asignadoA;
    }

    return null;
};
