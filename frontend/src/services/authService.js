// src/services/authService.js


import api from "./api.js";

export const authService = {
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

  async login(email, password) {
    try {
      // 1. Obtener CSRF token
      const csrfToken = await this.getCsrfToken();

      // 2. Configurar headers
      const config = {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      // 3. Enviar credenciales
      const response = await api.post('login/', { email, password }, config);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error en autenticación');
      }

      return {
        success: true,
        email: response.data.email,
        rol: response.data.rol,
        user_id: response.data.user_id
      };

    } catch (error) {
      console.error('Error en login:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });

      let errorMessage = 'Error de autenticación';
      if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado. Verifica tus credenciales.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión con el servidor';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async logout() {
    try {
      await api.post('logout/');
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  },
  async logout() {
    try {
      const response = await api.post('logout/');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

async registerStaff(userData) {
  try {
    console.group('👨‍💼 Registro de nuevo staff');

    // Validar campos requeridos
    const requiredFields = ['name', 'lastname', 'dni', 'email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Obtener token CSRF
    const csrfToken = await this.getCsrfToken();

    // Preparar datos - asegurar que los nombres coincidan con el backend
    const formattedData = {
      nombre: userData.name,
      apellido: userData.lastname,
      dni: userData.dni,
      correo: userData.email,
      contraseña: userData.password,
      rol: userData.role
    };

    const config = {
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    console.log('Enviando datos de registro:', formattedData);
    const response = await api.post('register-staff/', formattedData, config);

    if (!response.data.success) {
      throw new Error(response.data.errors || 'Error al registrar usuario');
    }

    console.groupEnd();
    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.groupEnd();
    console.error('Error en registerStaff:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return {
      success: false,
      error: error.response?.data?.errors ||
            error.response?.data?.error ||
            error.message ||
            'Error desconocido durante el registro'
    };
  }
},
// authService.js
async getUsers() {
  try {
    await this.getCsrfToken();
    const response = await api.get('users/', { withCredentials: true });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Formato de respuesta inválido');
    }

    const formattedUsers = response.data.map(user => ({
      id: user.id,
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      dni: user.dni || '',
      correo: user.correo || user.user?.email || '',
      rol: user.rol || 'user',
      is_active: user.user?.is_active ?? true
    }));

    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return {
      success: false,
      error: error.response?.data?.detail ||
            error.response?.data?.message ||
            'Error al cargar usuarios'
    };
  }
},

async createSubject(subjectData) {
  try {
    console.group('📚 Creando nueva asignatura');

    // Validar campos requeridos
    const requiredFields = {
      codigo: 'Código',
      nombre: 'Nombre',
      periodo: 'Periodo académico'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !subjectData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Obtener token CSRF
    const csrfToken = await this.getCsrfToken();

    // Configurar headers
    const config = {
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    console.log('Enviando datos de asignatura:', subjectData);
    const response = await api.post('asignaturas/', subjectData, config);

    if (response.status !== 201) {
      throw new Error(response.data.message || 'Error al crear asignatura');
    }

    console.groupEnd();
    return {
      success: true,
      message: 'Asignatura creada exitosamente',
      data: response.data
    };

  } catch (error) {
    console.groupEnd();
    console.error('Error al crear asignatura:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    let errorMessage = 'Error desconocido al crear asignatura';

    if (error.response) {
      if (error.response.status === 400) {
        // Manejar errores de validación del backend
        errorMessage = Object.entries(error.response.data.errors || {})
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n') || 'Datos inválidos';
      } else if (error.response.status === 403) {
        errorMessage = 'No tienes permisos para crear asignaturas';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Error de conexión con el servidor';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
},




  async deleteUser(userId) {
  try {
    console.group(`🗑️ Eliminando usuario con ID: ${userId}`);

    // 1. Obtener token CSRF
    const csrfToken = await this.getCsrfToken();

    // 2. Configurar headers
    const config = {
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    // 3. Enviar solicitud DELETE
    console.log(`Enviando DELETE request para usuario ${userId}`);
    const response = await api.delete(`users/${userId}/`, config);

    console.log('Usuario eliminado exitosamente');
    console.groupEnd();

    return {
      success: true,
      message: 'Usuario dado de baja correctamente'
    };

  } catch (error) {
    console.groupEnd();
    console.error('Error al eliminar usuario:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    let errorMessage = 'Error al dar de baja el usuario';

    if (error.response?.status === 404) {
      errorMessage = 'Usuario no encontrado';
    } else if (error.response?.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}
};

 



   