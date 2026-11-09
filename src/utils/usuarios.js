const TAMANO_PAGINA_USUARIOS = 100;
const MAX_PAGINAS_USUARIOS = 100;

export const traerTodosLosUsuarios = async (apiUrl) => {
    const usuarios = [];

    for (let page = 0; page < MAX_PAGINAS_USUARIOS; page += 1) {
        const response = await fetch(
            `${apiUrl}/usuarios?page=${page}&size=${TAMANO_PAGINA_USUARIOS}`,
            { credentials: 'include' }
        );
        if (!response.ok) {
            throw new Error(`No se pudieron cargar los usuarios (HTTP ${response.status}).`);
        }

        const pagina = await response.json();
        if (!Array.isArray(pagina)) {
            throw new Error('El backend no devolvió una lista de usuarios válida.');
        }

        usuarios.push(...pagina);
        if (pagina.length < TAMANO_PAGINA_USUARIOS) return usuarios;
    }

    throw new Error(`La consulta de usuarios superó el límite de ${MAX_PAGINAS_USUARIOS} páginas.`);
};
