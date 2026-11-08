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

export const fetchConCsrf = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfHeaders = await obtenerHeadersCsrf();
    Object.entries(csrfHeaders).forEach(([name, value]) => headers.set(name, value));
  }

  return fetch(url, {
    ...options,
    method,
    headers,
    credentials: options.credentials || 'include'
  });
};
