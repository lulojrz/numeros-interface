export const TAMANO_PAGINA_TERRITORIOS = 100;

const MAX_PAGINAS_TERRITORIOS = 1000;

export const traerPaginaTerritorios = async (apiUrl, page) => {
    const response = await fetch(
        `${apiUrl}/territorios/traer?page=${page}&size=${TAMANO_PAGINA_TERRITORIOS}&t=${Date.now()}`,
        { credentials: 'include' }
    );
    if (!response.ok) {
        throw new Error(`No se pudieron cargar los territorios (HTTP ${response.status}).`);
    }

    const territorios = await response.json();
    if (!Array.isArray(territorios)) {
        throw new Error('El backend no devolvió una lista de territorios válida.');
    }

    return territorios;
};

export const traerTodosLosTerritorios = async (apiUrl) => {
    const territorios = [];

    for (let page = 0; page < MAX_PAGINAS_TERRITORIOS; page += 1) {
        const territoriosPagina = await traerPaginaTerritorios(apiUrl, page);
        territorios.push(...territoriosPagina);
        if (territoriosPagina.length < TAMANO_PAGINA_TERRITORIOS) return territorios;
    }

    throw new Error(`La consulta de territorios superó el límite de ${MAX_PAGINAS_TERRITORIOS} páginas.`);
};
