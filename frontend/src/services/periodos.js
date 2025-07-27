// src/services/periodoService.js
import api from "./api.js";

export const periodoService = {
  async getPeriodos() {
    try {
      const response = await api.get('periodos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener períodos:', error);
      throw error;
    }
  },

  async createPeriodo(periodoData) {
    try {
      // Obtener token CSRF
      const csrfToken = await this.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await api.post('periodos/', periodoData, config);
      return response.data;
    } catch (error) {
      console.error('Error al crear período:', error);
      throw error;
    }
  },

  async updatePeriodo(id, periodoData) {
    try {
      const csrfToken = await this.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await api.put(`periodos/${id}/`, periodoData, config);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar período:', error);
      throw error;
    }
  },

  async deletePeriodo(id) {
    try {
      const csrfToken = await this.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await api.delete(`periodos/${id}/`, config);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar período:', error);
      throw error;
    }
  },

  // Reutiliza el mismo método getCsrfToken de authService
  async getCsrfToken() {
    try {
      const response = await api.get('csrf-cookie/');
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      if (!csrfToken) {
        throw new Error('No se pudo obtener el token CSRF');
      }
      return csrfToken;
    } catch (error) {
      console.error('Error al obtener CSRF token:', error);
      throw error;
    }
  },

};
    