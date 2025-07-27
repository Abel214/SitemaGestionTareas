// src/services/paraleloService.js
import api from "./api.js";
import { authService } from "./authService";

export const paraleloService = {
  async getParalelos() {
    try {
      const response = await api.get('paralelos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener paralelos:', error);
      throw error;
    }
  },

  async createParalelo(paraleloData) {
    try {
      const csrfToken = await authService.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // Adaptamos los datos al modelo del backend
      const formattedData = {
        asignatura: paraleloData.materias[0], // Tomamos la primera materia seleccionada
        nombre: paraleloData.letra,
        docente: paraleloData.docentes[0] || null, // Tomamos el primer docente seleccionado o null
        // estudiantes se manejaría por separado
      };

      const response = await api.post('paralelos/', formattedData, config);
      return response.data;
    } catch (error) {
      console.error('Error al crear paralelo:', error);
      throw error;
    }
  },

  async updateParalelo(id, paraleloData) {
    try {
      const csrfToken = await authService.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await api.put(`paralelos/${id}/`, paraleloData, config);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar paralelo:', error);
      throw error;
    }
  },

  async deleteParalelo(id) {
    try {
      const csrfToken = await authService.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true
      };

      const response = await api.delete(`paralelos/${id}/`, config);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar paralelo:', error);
      throw error;
    }
  },

  async addEstudianteToParalelo(paraleloId, estudianteId) {
    try {
      const csrfToken = await authService.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await api.post(
        `paralelos/${paraleloId}/add_estudiante/`,
        { estudiante_id: estudianteId },
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar estudiante al paralelo:', error);
      throw error;
    }
  },

  async removeEstudianteFromParalelo(paraleloId, estudianteId) {
    try {
      const csrfToken = await authService.getCsrfToken();

      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true
      };

      const response = await api.delete(
        `paralelos/${paraleloId}/remove_estudiante/${estudianteId}/`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error al remover estudiante del paralelo:', error);
      throw error;
    }
  }
};