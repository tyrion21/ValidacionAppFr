// This file contains API service functions for the validacion module
import { API_URL } from '@/constants/constantes';

// Configuración para APKs - manejo de errores SSL
const createFetchWithTimeout = (timeout = 10000) => {
  return async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Network error for ${url}:`, error);
      throw error;
    }
  };
};

const fetchWithTimeout = createFetchWithTimeout(15000); // 15 segundos timeout

/**
 * Función para probar la conectividad con el servidor
 * @returns Promise<boolean> true si el servidor está disponible
 */
export const testServerConnection = async () => {
  try {
    console.log('Testing connection to:', `${API_URL}/health`);
    const response = await fetchWithTimeout(`${API_URL}/health`, {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
};

/**
 * Obtiene la lista de motivos de rechazo disponibles
 * @returns Promise con los motivos de rechazo
 */
export const getMotivosRechazo = async () => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/validacion/motivos-rechazo`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rejection reasons:', error);
    throw new Error(`No se pudieron obtener los motivos de rechazo: ${error.message}`);
  }
};

/**
 * Envía un rechazo de pallet al servidor
 * @param {Object} rechazoData - Datos del rechazo
 * @param {string} rechazoData.Folio - Folio del pallet
 * @param {Array} rechazoData.Motivos - Motivos de rechazo seleccionados
 * @param {string} rechazoData.Usuario - Usuario que rechaza
 * @param {string} rechazoData.Especie - Especie del pallet
 * @param {number|string} rechazoData.Cajas - Número de cajas
 * @param {string} rechazoData.Camara - Cámara donde está el pallet
 * @param {string} rechazoData.Packing - Packing del pallet
 * @returns Promise con la respuesta del servidor
 */
export const rechazarPallet = async (rechazoData) => {
  try {
    // Asegúrate de que los datos sean del tipo correcto
    const dataToSend = {
      ...rechazoData,
      Folio: String(rechazoData.Folio || ''),
      Motivos: Array.isArray(rechazoData.Motivos) ? rechazoData.Motivos : [],
      Usuario: String(rechazoData.Usuario || 'jason'),
      Especie: String(rechazoData.Especie || ''),
      Cajas: typeof rechazoData.Cajas === 'number' ? rechazoData.Cajas : parseInt(rechazoData.Cajas, 10) || 0,
      Camara: String(rechazoData.Camara || ''),
      Packing: String(rechazoData.Packing || '')
    };
    
    const requestUrl = `${API_URL}/validacion/rechazar`;
    console.log('API URL for rejection:', requestUrl);
    console.log('Enviando datos de rechazo:', dataToSend);
      const response = await fetchWithTimeout(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || 'Error en la solicitud';
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting pallet:', error);
    throw error;
  }
};

/**
 * Verifica si un pallet está en estado de rechazo
 * @param {string} folio - Folio del pallet a verificar
 * @returns Promise con la información del estado de rechazo
 */
export const verificarRechazo = async (folio) => {
  try {
    const response = await fetch(`${API_URL}/validacion/verificar-rechazo/${folio}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error verificando estado de rechazo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error verificando rechazo:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un pallet rechazado a aprobado ('A')
 * @param {string} folio - Folio del pallet a actualizar
 * @returns Promise con el resultado de la operación
 */
export const actualizarRechazo = async (folio) => {
  try {
    const response = await fetch(`${API_URL}/validacion/actualizar-rechazo/${folio}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error actualizando estado de rechazo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error actualizando rechazo:', error);
    throw error;
  }
};

/**
 * Verifica si un pallet ya ha sido validado
 * @param {string} folio - Folio del pallet a verificar
 * @returns Promise con la información del estado de validación
 */
export const verificarValidacion = async (folio) => {
  try {
    const response = await fetch(`${API_URL}/validacion/verificar-validacion/${folio}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error verificando estado de validación');
    }
    return await response.json();
  } catch (error) {
    console.error('Error verificando validación:', error);
    throw error;
  }
};
