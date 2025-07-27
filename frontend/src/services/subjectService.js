import api from "./api.js";


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