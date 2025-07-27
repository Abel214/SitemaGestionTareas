// src/services/cicloService.js
import api from "./api.js";

export const cicloService = {
  async getCiclos() {
    try {
      const response = await api.get('ciclos/', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciclos:', error);
      throw error;
    }
  }
};