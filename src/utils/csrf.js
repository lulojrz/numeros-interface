export const obtenerHeadersCsrf = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/csrf`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener el token CSRF (HTTP ${response.status})`);
  }

  const { token, headerName } = await response.json();
  if (typeof token !== 'string' || !token || typeof headerName !== 'string' || !headerName) {
    throw new Error('La respuesta CSRF no contiene un token o nombre de cabecera válidos');
  }

  return { [headerName]: token };
};
