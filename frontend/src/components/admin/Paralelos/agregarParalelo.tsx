import React, { useState } from 'react';
import { Layers, X, Hash, BookOpen, User, Users, GraduationCap, Save } from 'lucide-react';
import { paraleloService } from '../../../services/paralelos';

interface ModalAgregarParaleloProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  materias: Array<{ id: number; codigo: string; nombre: string; ciclo: number }>;
  docentes: Array<{ id: number; nombre: string; especialidad: string }>;
}

const ModalAgregarParalelo: React.FC<ModalAgregarParaleloProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  materias,
  docentes
}) => {
  const [newParalelo, setNewParalelo] = useState({
    codigo: '',
    letra: '',
    ciclo: '',
    cupoTotal: '',
    materias: [] as number[],
    docentes: [] as number[],
    estado: 'Activo'
  });

  const handleMateriaChange = (materiaId: number) => {
    setNewParalelo(prev => ({
      ...prev,
      materias: prev.materias.includes(materiaId)
        ? prev.materias.filter(id => id !== materiaId)
        : [materiaId] // Solo permitimos una materia seleccionada
    }));
  };

  const handleDocenteChange = (docenteId: number) => {
    setNewParalelo(prev => ({
      ...prev,
      docentes: prev.docentes.includes(docenteId)
        ? prev.docentes.filter(id => id !== docenteId)
        : [docenteId] // Solo permitimos un docente seleccionado
    }));
  };

  const handleSubmit = async () => {
    if (!newParalelo.letra || !newParalelo.materias.length) {
      alert('Debe seleccionar al menos una letra y una materia');
      return;
    }

    try {
      await paraleloService.createParalelo(newParalelo);
      onSaveSuccess();
      onClose();
      setNewParalelo({
        codigo: '',
        letra: '',
        ciclo: '',
        cupoTotal: '',
        materias: [],
        docentes: [],
        estado: 'Activo'
      });
    } catch (error) {
      console.error('Error al crear paralelo:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            <Layers className="w-5 h-5"/>
            Agregar Paralelo
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="modal-body">
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Hash className="w-4 h-4"/>
                  Código Paralelo
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newParalelo.codigo}
                  onChange={(e) => setNewParalelo({...newParalelo, codigo: e.target.value})}
                  placeholder="Ej: PAR-2023-001"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Layers className="w-4 h-4"/>
                  Letra
                </label>
                <select
                  className="form-select"
                  value={newParalelo.letra}
                  onChange={(e) => setNewParalelo({...newParalelo, letra: e.target.value})}
                >
                  <option value="">Seleccione letra</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(letra => (
                    <option key={letra} value={letra}>{letra}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <GraduationCap className="w-4 h-4"/>
                  Ciclo
                </label>
                <select
                  className="form-select"
                  value={newParalelo.ciclo}
                  onChange={(e) => setNewParalelo({...newParalelo, ciclo: e.target.value})}
                >
                  <option value="">Seleccione ciclo</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Users className="w-4 h-4"/>
                  Cupo Total
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={newParalelo.cupoTotal}
                  onChange={(e) => setNewParalelo({...newParalelo, cupoTotal: e.target.value})}
                  placeholder="Ingrese el cupo total"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  <BookOpen className="w-4 h-4"/>
                  Materias
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {materias.map(materia => (
                    <div key={materia.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`materia-${materia.id}`}
                        checked={newParalelo.materias.includes(materia.id)}
                        onChange={() => handleMateriaChange(materia.id)}
                        className="checkbox"
                      />
                      <label htmlFor={`materia-${materia.id}`} className="ml-2 text-sm">
                        {materia.codigo} - {materia.nombre} (Ciclo {materia.ciclo})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  <User className="w-4 h-4"/>
                  Docentes
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {docentes.map(docente => (
                    <div key={docente.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`docente-${docente.id}`}
                        checked={newParalelo.docentes.includes(docente.id)}
                        onChange={() => handleDocenteChange(docente.id)}
                        className="checkbox"
                      />
                      <label htmlFor={`docente-${docente.id}`} className="ml-2 text-sm">
                        {docente.nombre} ({docente.especialidad})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Estado
                </label>
                <select
                  className="form-select"
                  value={newParalelo.estado}
                  onChange={(e) => setNewParalelo({...newParalelo, estado: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Cancelar</button>
          <button className="primary-button save-btn" onClick={handleSubmit}>
            <Save className="w-4 h-4"/>
            Guardar Paralelo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarParalelo;