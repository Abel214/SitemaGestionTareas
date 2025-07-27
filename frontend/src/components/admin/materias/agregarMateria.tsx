import React, { useEffect, useState } from 'react';
import { BookOpen, X, Calendar, Clock, Save, ToggleLeft } from 'lucide-react';
import { message } from 'antd';
import { authService } from '../../../services/authService'; // Importa tu servicio

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
};

type Periodo = {
    id: number;
    ciclo: string;
    periodo_inicio: string;
    periodo_fin: string;
};

type FormState = {
    codigo: string;
    nombre: string;
    descripcion: string;
    periodo: number | '';
    unidades_totales: number | '';
    horas_programadas: number | '';
    is_activa: boolean;
};

const ModalAgregarAsignatura: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = useState<FormState>({
        codigo: '',
        nombre: '',
        descripcion: '',
        periodo: '',
        unidades_totales: '',
        horas_programadas: '',
        is_activa: true,
    });

    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const loadPeriodos = async () => {
            try {
                const response = await authService.getPeriodos(); // Asume que tienes este método
                if (response.success) {
                    setPeriodos(response.data);
                } else {
                    message.error(response.error || 'No se pudieron cargar los períodos');
                }
            } catch (e) {
                console.error(e);
                message.error('Error al cargar los períodos');
            }
        };

        loadPeriodos();
    }, [isOpen]);

    const handleChange = (key: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // Validación básica
        if (!form.codigo || !form.nombre || !form.periodo) {
            message.warning('Código, Nombre y Período son obligatorios');
            return;
        }

        // Preparar los datos para el servicio
        const subjectData = {
            codigo: form.codigo,
            nombre: form.nombre,
            descripcion: form.descripcion,
            periodo: form.periodo,
            unidades_totales: form.unidades_totales === '' ? null : Number(form.unidades_totales),
            horas_programadas: form.horas_programadas === '' ? null : Number(form.horas_programadas),
            is_activa: form.is_activa
        };

        try {
            setSaving(true);

            // Usar el servicio authService para crear la asignatura
            const result = await authService.createSubject(subjectData);

            if (result.success) {
                message.success(result.message || 'Asignatura creada exitosamente');
                // Limpiar el formulario
                setForm({
                    codigo: '',
                    nombre: '',
                    descripcion: '',
                    periodo: '',
                    unidades_totales: '',
                    horas_programadas: '',
                    is_activa: true,
                });
                onCreated(); // Notificar al componente padre para actualizar la lista
                onClose(); // Cerrar el modal
            } else {
                message.error(result.error || 'Error al crear la asignatura');
            }
        } catch (error) {
            console.error('Error al crear asignatura:', error);
            message.error('Error inesperado al crear la asignatura');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">
                        <BookOpen className="w-5 h-5"/> Agregar Asignatura
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
                                    <BookOpen className="w-4 h-4"/> Código *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.codigo}
                                    onChange={e => handleChange('codigo', e.target.value)}
                                    placeholder="Código único (ej: MAT-101)"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <BookOpen className="w-4 h-4"/> Nombre *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.nombre}
                                    onChange={e => handleChange('nombre', e.target.value)}
                                    placeholder="Nombre completo de la asignatura"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <Calendar className="w-4 h-4"/> Período *
                                </label>
                                <select
                                    className="form-select"
                                    value={form.periodo}
                                    onChange={e => handleChange('periodo', Number(e.target.value))}
                                >
                                    <option value="">Seleccione período</option>
                                    {periodos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.ciclo} ({p.periodo_inicio} - {p.periodo_fin})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <ToggleLeft className="w-4 h-4"/> Activa
                                </label>
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={form.is_activa}
                                        onChange={e => handleChange('is_activa', e.target.checked)}
                                    />
                                    <span>{form.is_activa ? 'Activa' : 'Inactiva'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <Clock className="w-4 h-4"/> Unidades totales
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    value={form.unidades_totales}
                                    onChange={e => handleChange('unidades_totales', e.target.value)}
                                    placeholder="Ej: 5"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Clock className="w-4 h-4"/> Horas programadas
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    value={form.horas_programadas}
                                    onChange={e => handleChange('horas_programadas', e.target.value)}
                                    placeholder="Ej: 64"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">
                                    <BookOpen className="w-4 h-4"/> Descripción
                                </label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={form.descripcion}
                                    onChange={e => handleChange('descripcion', e.target.value)}
                                    placeholder="Descripción detallada de la asignatura"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="secondary-button" onClick={onClose} disabled={saving}>
                        Cancelar
                    </button>
                    <button
                        className="primary-button save-btn"
                        onClick={handleSave}
                        disabled={saving || !form.codigo || !form.nombre || !form.periodo}
                    >
                        <Save className="w-4 h-4"/> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAgregarAsignatura;