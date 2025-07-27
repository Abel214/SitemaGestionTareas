import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {getCookie} from '../../utils/cookies';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    Search, User, Plus, ChevronDown, ChevronUp, Pencil,
    UserRoundMinus
} from 'lucide-react';

import {getDashboardConfig} from '../../components/sidebar/sidebar';
import MenuDesplegable from '../../components/menuDesplegable/menu';

import './inicioAdmin.css';
import ModalAgregarUsuario from '../../components/admin/Usuarios/agregarUsuario';
import ModalEditarUsuario from '../../components/admin/Usuarios/editarUsuario';
import Asignaturas from '../../components/admin/materias/materias';
import Paralelos from '../../components/admin/Paralelos/paralelo';
import Ciclos from '../../components/admin/Ciclos/ciclos';
import PeriodosManager from '../../components/admin/Ciclos/periodoCiclo';
import {useAuth} from '../../context/AuthContext';
import { authService } from '../../services/authService';


type UIUser = {
  id: number;
  nombre: string;  // Cambiado de 'name' para coincidir con el modelo
  apellido: string; // Cambiado de 'lastname'
  dni: string;
  correo: string;  // Cambiado de 'email'
  rol: string;
  is_active?: boolean;

};
const AdminInterface: React.FC = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
        const [activeMenuItem, setActiveMenuItem] = useState<'users' | 'subjects' | 'parallels' | 'cicles' | 'periods' | 'settings'>('users');
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
        const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
        const [closingDropdowns, setClosingDropdowns] = useState<Record<number, boolean>>({});
        const [addModal, setAddModal] = useState(false);
        const [newUser, setNewUser] = useState({
            name: '', lastname: '', email: '', role: '',
            status: '', phone: '', birthdate: ''
        });
        const [editModal, setEditModal] = useState<{ isOpen: boolean; user: UIUser | null }>({
            isOpen: false,
            user: null
        });
        const [users, setUsers] = useState<UIUser[]>([]);
        const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
        const handleLogout = () => {
            localStorage.clear();
            navigate('/');
        };

    useEffect(() => {
        const fetchUsers = async () => {

            try {
    setIsLoadingUsers(true);
    const result = await authService.getUsers();

    if (result.success) {
      setUsers(result.users.map(user => ({
        ...user,
        // Mantener compatibilidad con campos que podrían esperar otros componentes
        name: user.nombre, // Alias para compatibilidad
        lastname: user.apellido, // Alias
        email: user.correo, // Alias
        // Campos dummy para compatibilidad (puedes eliminarlos si no son necesarios)
        status: user.is_active ? 'Activo' : 'Inactivo',
        phone: '-',
        birthdate: '-'
      })));
    } else {
      console.error('Error al cargar usuarios:', result.error);
      alert('Error al cargar usuarios: ' + result.error);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
    alert('Error inesperado al cargar usuarios');
  } finally {
    setIsLoadingUsers(false);
  }
};

            fetchUsers();
        }, []);

        const toggleDropdown = (userId: number) => {
            setOpenDropdowns(prev => ({...prev, [userId]: true}));
            setClosingDropdowns(prev => ({...prev, [userId]: false}));
        };

        const toggleDropup = (userId: number) => {
            setClosingDropdowns(prev => ({...prev, [userId]: true}));
            setTimeout(() => {
                setOpenDropdowns(prev => ({...prev, [userId]: false}));
                setClosingDropdowns(prev => ({...prev, [userId]: false}));
            }, 100);
        };
        const handleDeleteUser = async (userId: number, userName: string) => {
  // Confirmar la acción
  const confirmed = window.confirm(
    `¿Estás seguro de que deseas dar de baja al usuario "${userName}"?\n\nEsta acción desactivará la cuenta y no podrá acceder al sistema.`
  );

  if (!confirmed) return;

  try {
    // Marcar como "eliminando" para mostrar loading
    setIsDeleting(prev => ({ ...prev, [userId]: true }));

    // Llamar al servicio
    const result = await authService.deleteUser(userId);

    if (result.success) {
      // Mostrar mensaje de éxito
      alert('✅ Usuario dado de baja correctamente');

      // Actualizar la lista de usuarios
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, is_active: false, status: 'Inactivo' }
            : user
        )
      );

      // Cerrar el dropdown
      setOpenDropdowns(prev => ({ ...prev, [userId]: false }));

    } else {
      // Mostrar error
      alert('❌ ' + result.error);
    }

  } catch (error) {
    console.error('Error inesperado:', error);
    alert('❌ Error inesperado al dar de baja el usuario');
  } finally {
    // Quitar el estado de "eliminando"
    setIsDeleting(prev => ({ ...prev, [userId]: false }));
  }
};
        const handleUserSelection = (userId: number) => {
            setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
        };

        const handleSelectAll = () => {
            setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
        };

        const handleEditUser = (user: UIUser) => {
            setEditModal({isOpen: true, user: {...user}});
        };

        const handleCloseEditModal = () => setEditModal({isOpen: false});

        const handleInputChange = (field: string, value: string) => {
            setEditModal(prev => ({
                ...prev,
                user: prev.user ? {...prev.user, [field]: value} : prev.user
            }));
        };

        const renderUsersContent = () => (
            <div className="content-card">
                <div className="card-header">
                    <div className="card-header-content">
                        <div className="header-table-actions">
                            <div className="search-container">
                                <Search className="search-icon"/>
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="primary-button add-user-button" onClick={() => setAddModal(true)}>
                                <Plus className="w-4 h-4"/> Agregar Usuario
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="user-table">
                        <thead className="table-header">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length}
                                    onChange={handleSelectAll}
                                    className="checkbox"
                                />
                            </th>
                            <th>Nombres Completos</th>
                            <th>Correo Institucional</th>
                            <th>Rol</th>
                            <th>Ciclo</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody className="table-body">
                        {users.map(user => (
                            <React.Fragment key={user.id}>
                                <tr className="table-row">
                                    <td className="table-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleUserSelection(user.id)}
                                            className="checkbox"
                                        />
                                    </td>
                                    <td className="table-cell user-name">{user.nombre} {user.apellido}</td>
                                    <td className="table-cell user-email">{user.correo}</td>
                                    <td className="table-cell user-role">{user.rol}</td>
                                    <td className="table-cell user-status">{user.dni}</td>
                                    <td className="table-cell">
                                        <button
                                            className="user-profile-button"
                                            onClick={() => openDropdowns[user.id] ? toggleDropup(user.id) : toggleDropdown(user.id)}
                                        >
                                            {openDropdowns[user.id] ? <ChevronUp className="w-4 h-4"/> :
                                                <ChevronDown className="w-4 h-4"/>}
                                        </button>
                                    </td>
                                </tr>

                                {openDropdowns[user.id] && (
                                    <tr className="expanded-row">
                                        <td colSpan={6} className="expanded-cell">
                                            <div
                                                className={`dropdown-card-inline ${closingDropdowns[user.id] ? 'closing' : ''}`}>
                                                <div className="dropdown-header">
                                                    <div className="user-avatar-large">
                                                        <span className="element-symbol">User Photo</span>
                                                    </div>
                                                    <div className="user-details-single">
                                                        <h3 className="user-full-name-dropdown">{user.nombre} {user.apellido}</h3>
                                                        <div className="user-info-grid">
                                                            <p className="user-email-dropdown"><span
                                                                className="label">Correo: </span>{user.correo}</p>
                                                            <p className="user-role-dropdown"><span
                                                                className="label">Rol: </span>{user.rol}</p>
                                                            <p className="user-cycle-dropdown"><span
                                                                className="label">Dni: </span>{user.dni}</p>

                                                        </div>
                                                    </div>
                                                </div>

                                                <div className=".dropdown-content-dar-de-baja ">
                                                    <button className="edit-user-btn"
                                                            onClick={() => handleEditUser(user)}>
                                                        <Pencil className="w-4 h-4"/> Editar
                                                    </button>
                                                    <button
                                                        className="unsubscribe-user-btn"
                                                        onClick={() => handleDeleteUser(user.id, `${user.nombre} ${user.apellido}`)}
                                                        disabled={isDeleting[user.id] || !user.is_active}
                                                    >
                                                        <UserRoundMinus className="w-4 h-4"/>
                                                        {isDeleting[user.id] ? 'Procesando...' : 'Dar de baja'}
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
            </div>
        );

        const getPageTitle = () => {
            switch (activeMenuItem) {
                case 'users':
                    return 'Gestor de Usuarios';
                case 'subjects':
                    return 'Gestor de Asignaturas';
                case 'parallels':
                    return 'Gestor de Paralelos';
                case 'cicles':
                    return 'Gestor de Ciclos';
                case 'periods':
                    return 'Gestor de Períodos';
                case 'settings':
                    return 'Configuración';
                default:
                    return 'Panel de Administración';
            }
        };

        const renderMainContent = () => {
            switch (activeMenuItem) {
                case 'users':
                    return renderUsersContent();
                case 'subjects':
                    return <Asignaturas/>;
                case 'parallels':
                    return <Paralelos/>;
                case 'cicles':
                    return <Ciclos/>;
                case 'periods':
                    return <PeriodosManager/>;
                case 'settings':
                    return (
                        <div className="content-card">
                            <div className="card-header">
                                <div className="card-header-content">
                                    <h2>Configuración</h2>
                                    <p>Configuración general del sistema.</p>
                                </div>
                            </div>
                            <div className="table-container">
                                <p>Panel de configuración en desarrollo...</p>
                            </div>
                        </div>
                    );
                default:
                    return (
                        <div className="content-card">
                            <div className="card-header">
                                <div className="card-header-content">
                                    <h2>Selecciona una opción del menú</h2>
                                    <p>Elige una opción del menú lateral para comenzar.</p>
                                </div>
                            </div>
                        </div>
                    );
            }
        };

        const SideMenu = ({activeItem, onItemClick}: { activeItem: string; onItemClick: (id: any) => void }) => {
            const adminConfig = getDashboardConfig('admin');
            return (
                <div className="side-menu">
                    <div className="side-menu-header">
                        <div className="header-content">
                            <div className="admin-icon"><User className="w-4 h-4"/></div>
                            <span className="admin-title">Administrador</span>
                        </div>
                    </div>
                    <nav className="side-menu-nav">
                        {adminConfig.menuItems.map((item: any) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onItemClick(item.id)}
                                    className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                                >
                                    <Icon/><span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <div className="side-menu-bottom">
                        {adminConfig.bottomItems.map((item: any) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onItemClick(item.id)}
                                    className={`menu-item bottom-item ${activeItem === item.id ? 'active' : ''}`}
                                >
                                    <Icon className="w-5 h-5"/><span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        };

        return (
            <div className="admin-interface">
                <SideMenu activeItem={activeMenuItem} onItemClick={setActiveMenuItem}/>
                <div className="main-content">
                    <header className="main-header">
                        <div className="header-content">
                            <h1 className="header-title">{getPageTitle()}</h1>
                            <div className="header-actions">
                                <div className="user-profile-container">
                                    <div className="user-profile-info">
                                        <p className="user-profile-name">Luis Medina</p>
                                        <p className="user-profile-email">admin@uni.com</p>
                                    </div>
                                    <MenuDesplegable/>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="main-section">
                        {renderMainContent()}
                    </main>

                    {/* Modales */}
                    <ModalAgregarUsuario
                        isOpen={addModal}
                        onClose={() => setAddModal(false)}
                        newUser={newUser}
                        setNewUser={setNewUser}
                        onUserCreated={() => {
                            console.log('Usuario creado:', newUser);
                            setAddModal(false);
                        }}
                    />

                    <ModalEditarUsuario
                        isOpen={editModal.isOpen}
                        user={editModal.user}
                        onClose={() => setAddModal(false)}
                        onChange={handleInputChange}
                        onSave={() => {
                            console.log('Cambios guardados:', editModal.user);
                            setEditModal({isOpen: false, user: null});
                        }}
                    />
                </div>
            </div>
        );
    };

export default AdminInterface;
