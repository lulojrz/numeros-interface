export const normalizarAsignacion = (asignacion) => String(asignacion || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export const esSoporte = (asignacion) => normalizarAsignacion(asignacion) === 'soporte';

export const obtenerPermisosAdmin = (usuario = {}) => {
    const asignacion = normalizarAsignacion(usuario.asignacion);
    const soporte = asignacion === 'soporte';
    const administracionGeneral = soporte ||
        ['servicio', 'territorios', 'servicio y territorios'].includes(asignacion);

    return {
        puedeGestionarUsuarios: usuario.privilegio === 'ROLE_ANC' || soporte,
        puedeAdministrarTelefonica: administracionGeneral || [
            'territorios telefonicos/personales',
            'territorios telefonicos',
            'personales',
            'territorios personales'
        ].includes(asignacion),
        puedeAdministrarPublica: administracionGeneral || ['publica'].includes(asignacion),
        puedeAdministrarEdificios: administracionGeneral || [
            'edificios',
            'territorios edificios'
        ].includes(asignacion),
        puedeAdministrarTodo: administracionGeneral
    };
};
