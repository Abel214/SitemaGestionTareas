// components/admin/materias/AsignaturasManager.tsx
import React, { useEffect, useState } from 'react';
import {
    Search, Plus, ChevronDown, ChevronUp, Pencil, Trash2, BookOpen
} from 'lucide-react';
import { message, Spin } from 'antd';
import { authService } from '../../../services/authService';
import ModalAgregarAsignatura from './agregarMateria';
import ModalEditarAsignatura from './editarmateria';

type Asignatura = {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    periodo: number;
    unidades_totales: number | null;
    horas_programadas: number | null;
    is_activa: boolean;
    created_at: string;
    updated_at: string;
};

type Periodo = {
    id: number;
    ciclo: string;
    periodo_inicio: string;
    periodo_fin: string;
};

const AsignaturasManager: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [selectedAsignaturas, setSelectedAsignaturas] = useState<number[]>([]);
    const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
    const [closingDropdowns, setClosingDropdowns] = useState<Record<number, boolean>>({});
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentAsignatura, setCurrentAsignatura] = useState<Asignatura | null>(null);
    const [loading, setLoading] = useState(false);
    const [periodosMap, setPeriodosMap] = useState<Record<number, string>>({});
    const loadAsignaturas = async () => {
        try {
            setLoading(true);
            const response = await authService.getSubjects();
            if (response.success) {
                setAsignaturas(response.data);
            } else {
                message.error(response.error || 'Error al cargar asignaturas');
            }
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            message.error('Error al cargar asignaturas');
        } finally {
            setLoading(false);
        }
    };

    const loadPeriodos = async () => {
        try {
            const response = await authService.getPeriodos();
            if (response.success) {
                const map = response.data.reduce((acc: Record<number, string>, p: Periodo) => {
                    acc[p.id] = `${p.ciclo} (${p.periodo_inicio} - ${p.periodo_fin})`;
                    return acc;
                }, {});
                setPeriodosMap(map);
            } else {
                message.error(response.error || 'Error al cargar períodos');
            }
        } catch (error) {
            console.error('Error al cargar períodos:', error);
            message.error('Error al cargar períodos');
        }
    };

    useEffect(() => {
        loadAsignaturas();
        loadPeriodos();
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: true }));
        setClosingDropdowns(prev => ({ ...prev, [id]: false }));
    };

    const toggleDropup = (id: number) => {
        setClosingDropdowns(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setOpenDropdowns(prev => ({ ...prev, [id]: false }));
            setClosingDropdowns(prev => ({ ...prev, [id]: false }));
        }, 100);
    };

    const handleAsignaturaSelection = (id: number) => {
        setSelectedAsignaturas(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedAsignaturas(
            selectedAsignaturas.length === filteredAsignaturas.length
                ? []
                : filteredAsignaturas.map(a => a.id)
        );
    };

    const handleEditClick = (a: Asignatura) => {
        setCurrentAsignatura(a);
        setEditModalOpen(true);
    };

    const handleDeleteAsignatura = async (a: Asignatura) => {
        if (!window.confirm(`¿Eliminar la asignatura "${a.nombre}"?`)) return;
        try {
            const response = await authService.deleteSubject(a.id);
            if (response.success) {
                message.success('Asignatura eliminada');
                loadAsignaturas();
            } else {
                message.error(response.error || 'Error al eliminar asignatura');
            }
        } catch (error) {
            console.error('Error al eliminar asignatura:', error);
            message.error('Error al eliminar asignatura');
        }
    };

    const filteredAsignaturas = asignaturas.filter(a =>
        [a.nombre, a.codigo, a.descripcion].some(
            f => f && f.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="card-header-content">
                    <div className="header-table-actions">
                        <div className="search-container">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar asignaturas..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="primary-button add-user-button"
                            onClick={() => setAddModalOpen(true)}
                        >
                            <Plus className="w-4 h-4" /> Agregar Asignatura
                        </button>
                    </div>
                </div>
            </div>

            <Spin spinning={loading}>
                <div className="table-container">
                    <table className="user-table">
                        <thead className="table-header">
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedAsignaturas.length === filteredAsignaturas.length && filteredAsignaturas.length > 0}
                                        onChange={handleSelectAll}
                                        className="checkbox"
                                    />
                                </th>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Unidades</th>
                                <th>Horas</th>
                                <th>Activa</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredAsignaturas.map((asig) => (
                                <React.Fragment key={asig.id}>
                                    <tr className="table-row">
                                        <td className="table-cell">
                                            <input
                                                type="checkbox"
                                                checked={selectedAsignaturas.includes(asig.id)}
                                                onChange={() => handleAsignaturaSelection(asig.id)}
                                                className="checkbox"
                                            />
                                        </td>
                                        <td className="table-cell">{asig.nombre}</td>
                                        <td className="table-cell">{asig.codigo}</td>
                                        <td className="table-cell">{asig.unidades_totales ?? '—'}</td>
                                        <td className="table-cell">{asig.horas_programadas ?? '—'}</td>
                                        <td className="table-cell">{asig.is_activa ? 'Sí' : 'No'}</td>
                                        <td className="table-cell">
                                            <button
                                                className="user-profile-button"
                                                onClick={() =>
                                                    openDropdowns[asig.id] ? toggleDropup(asig.id) : toggleDropdown(asig.id)
                                                }
                                            >
                                                {openDropdowns[asig.id] ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>

                                    {openDropdowns[asig.id] && (
                                        <tr className="expanded-row">
                                            <td colSpan={7} className="expanded-cell">
                                                <div
                                                    className={`dropdown-card-inline ${closingDropdowns[asig.id] ? 'closing' : ''}`}
                                                >
                                                    <div className="dropdown-header">
                                                        <div className="user-avatar-large">
                                                            <BookOpen className="w-8 h-8 text-blue-600" />
                                                        </div>
                                                        <div className="user-details-single">
                                                            <h3 className="user-full-name-dropdown">{asig.nombre}</h3>
                                                            <div className="user-info-grid">
                                                                <p><span className="label">Código: </span>{asig.codigo}</p>
                                                                <p><span className="label">Descripción: </span>{asig.descripcion || '—'}</p>
                                                                <p><span className="label">Periodo: </span>{periodosMap[asig.periodo] ?? asig.periodo}</p>
                                                                <p><span className="label">Unidades: </span>{asig.unidades_totales ?? '—'}</p>
                                                                <p><span className="label">Horas programadas: </span>{asig.horas_programadas ?? '—'}</p>
                                                                <p><span className="label">Activa: </span>{asig.is_activa ? 'Sí' : 'No'}</p>
                                                                <p><span className="label">Creada: </span>{new Date(asig.created_at).toLocaleString()}</p>
                                                                <p><span className="label">Actualizada: </span>{new Date(asig.updated_at).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="dropdown-content">
                                                        <button
                                                            className="primary-button edit-user-btn"
                                                            onClick={() => handleEditClick(asig)}
                                                        >
                                                            <Pencil className="w-4 h-4" /> Editar
                                                        </button>
                                                        <button
                                                            className="primary-button unsubscribe-user-btn"
                                                            onClick={() => handleDeleteAsignatura(asig)}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAsignaturas.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron asignaturas que coincidan con la búsqueda.
                    </div>
                )}
            </Spin>

            <ModalAgregarAsignatura
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onCreated={() => {
                    setAddModalOpen(false);
                    loadAsignaturas();
                }}
            />

            {editModalOpen && currentAsignatura && (
                <ModalEditarAsignatura
                    isOpen={editModalOpen}
                    materia={currentAsignatura}
                    onClose={() => setEditModalOpen(false)}
                    onSave={() => {
                        setEditModalOpen(false);
                        loadAsignaturas();
                    }}
                    onChange={() => {}}
                />
            )}
        </div>
    );
};

export default AsignaturasManager;