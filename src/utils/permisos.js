export const normalizarAsignacion = (asignacion) => String(asignacion || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export const esSoporte = (asignacion) => normalizarAsignacion(asignacion) === 'soporte';

const ASIGNACIONES_TELEFONICA = new Set([
    'telefonica',
    'telefonico',
    'telefonia',
    'territorio telefonico',
    'territorios telefonicos',
    'territorios telefonicos/personales',
    'territorios telefonicos y personales',
    'telefonica/personales',
    'telefonica y personales',
    'personales telefonicos',
    'personales'
]);

export const obtenerPermisosAdmin = (usuario = {}) => {
    const asignacion = normalizarAsignacion(usuario.asignacion);
    const soporte = asignacion === 'soporte';
    const administracionGeneral = soporte ||
        ['servicio', 'territorios', 'servicio y territorios'].includes(asignacion);

    return {
        puedeGestionarUsuarios: usuario.privilegio === 'ROLE_ANC' || soporte,
        puedeAdministrarTelefonica: administracionGeneral ||
            ASIGNACIONES_TELEFONICA.has(asignacion) ||
            asignacion === 'territorios personales',
        puedeAdministrarPublica: administracionGeneral || ['publica'].includes(asignacion),
        puedeAdministrarEdificios: administracionGeneral || [
            'edificios',
            'territorios edificios'
        ].includes(asignacion),
        puedeAdministrarTodo: administracionGeneral
    };
};
