// =====================================================
// CONFIGURACIÓN DE API - FRONTEND
// =====================================================

const API_CONFIG = {
  // URL base de la API - Cambiar según entorno
  BASE_URL: 'http://localhost:3000',
  
  // Endpoints
  ENDPOINTS: {
    VUELOS: '/api/vuelos',
    RESERVAS: '/api/reservas',
    PAYMENTS: '/api/payments'
  },

  // Timeouts
  TIMEOUT: 10000,

  // Headers por defecto
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

/**
 * Hacer request a la API
 * @param {string} ruta - Ruta relativa (ej: '/api/vuelos')
 * @param {Object} opciones - Opciones del fetch (method, headers, body, etc.)
 * @returns {Promise<Object>} Respuesta JSON
 */
async function llamarAPI(ruta, opciones = {}) {
  const url = `${API_CONFIG.BASE_URL}${ruta}`;
  
  const config = {
    method: 'GET',
    headers: { ...API_CONFIG.HEADERS },
    ...opciones
  };

  // Añadir Authorization si existe token en localStorage
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // noop
  }

  try {
    const respuesta = await fetch(url, config);
    
    if (!respuesta.ok) {
      const error = await respuesta.json().catch(() => ({}));
      throw new Error(error.error || `Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    return await respuesta.json();
  } catch (error) {
    console.error(`Error al llamar ${url}:`, error);
    throw error;
  }
}

/**
 * Obtener todos los vuelos o filtrados
 * @param {Object} filtros - {origen, destino, fecha}
 * @returns {Promise<Array>} Lista de vuelos
 */
async function obtenerVuelos(filtros = {}) {
  let url = API_CONFIG.ENDPOINTS.VUELOS;

  // Construir query string
  const params = new URLSearchParams();
  if (filtros.origen) params.append('origen', filtros.origen);
  if (filtros.destino) params.append('destino', filtros.destino);
  if (filtros.fecha) params.append('fecha', filtros.fecha);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const respuesta = await llamarAPI(url);
    return respuesta.data || [];
  } catch (error) {
    console.error('Error al obtener vuelos:', error);
    return [];
  }
}

/**
 * Obtener un vuelo por ID
 * @param {number} id - ID del vuelo
 * @returns {Promise<Object|null>} Vuelo encontrado o null
 */
async function obtenerVueloPorId(id) {
  try {
    const respuesta = await llamarAPI(`${API_CONFIG.ENDPOINTS.VUELOS}/${id}`);
    return respuesta.data || null;
  } catch (error) {
    console.error(`Error al obtener vuelo ${id}:`, error);
    return null;
  }
}
