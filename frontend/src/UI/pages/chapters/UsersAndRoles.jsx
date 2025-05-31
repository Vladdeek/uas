import { useState, useEffect } from 'react'
import { Input, Submit, SelectInput } from '../../components/Components.jsx'
import ApiClient from '../../../api/api.js'
import Loader1 from '../../components/Loader.jsx'

// Фирменные цвета
const brandColors = {
    primary: '#770002', // основной бордовый
    secondary: '#8B0003', // светлее бордовый для ховера
    accent: '#FF9999', // светло-розовый для акцентов
    background: '#FFF5F5', // очень светлый розовый для фона
    surface: '#ffffff', // белый
    text: {
        primary: '#2D0001', // темно-бордовый
        secondary: '#4A0002', // бордовый
        light: '#980003' // светло-бордовый
    }
}

const UsersAndRoles = () => {
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateRoleForm, setShowCreateRoleForm] = useState(false)
    const [showEditUserForm, setShowEditUserForm] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    // Состояние для формы создания роли
    const [newRoleName, setNewRoleName] = useState('')
    const [newRoleDisplayName, setNewRoleDisplayName] = useState('')
    const [newRoleDescription, setNewRoleDescription] = useState('')

    // Состояние для формы редактирования пользователя
    const [selectedRoles, setSelectedRoles] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [usersData, rolesData] = await Promise.all([
                ApiClient.getUsers(),
                ApiClient.getRoles()
            ])
            setUsers(usersData)
            setRoles(rolesData)
        } catch (err) {
            setError('Ошибка загрузки данных')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRole = async () => {
        if (!newRoleName.trim() || !newRoleDisplayName.trim()) return

        try {
            await ApiClient.createRole({
                name: newRoleName,
                display_name: newRoleDisplayName,
                description: newRoleDescription
            })
            setShowCreateRoleForm(false)
            setNewRoleName('')
            setNewRoleDisplayName('')
            setNewRoleDescription('')
            await loadData()
        } catch (err) {
            setError('Ошибка при создании роли')
        }
    }

    const handleUpdateUserRoles = async () => {
        if (!selectedUser) return

        try {
            await ApiClient.updateUserRoles(selectedUser.id, selectedRoles)
            setShowEditUserForm(false)
            setSelectedUser(null)
            setSelectedRoles([])
            await loadData()
        } catch (err) {
            setError('Ошибка при обновлении ролей пользователя')
        }
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setSelectedRoles(user.roles.map(role => role.id))
        setShowEditUserForm(true)
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-full w-full'>
                <Loader1 />
            </div>
        )
    }

    return (
        <div className='h-full w-full overflow-auto p-4' style={{ background: brandColors.background }}>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold' style={{ color: brandColors.text.primary }}>
                    Пользователи и роли
                </h1>
                <button
                    onClick={() => setShowCreateRoleForm(true)}
                    className='flex items-center gap-2 px-4 py-2 rounded-xl transition-colors'
                    style={{ 
                        background: brandColors.primary,
                        color: brandColors.surface,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = brandColors.secondary}
                    onMouseOut={e => e.currentTarget.style.background = brandColors.primary}
                >
                    <img className='h-5 white-icon' src='icons/plus.svg' alt='' />
                    <span>Создать роль</span>
                </button>
            </div>

            {error && (
                <div className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4'>
                    {error}
                </div>
            )}

            {/* Форма создания роли */}
            {showCreateRoleForm && (
                <div className='bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100 transition-all'>
                    <h2 className='text-xl font-bold mb-4' style={{ color: brandColors.text.primary }}>
                        Создание новой роли
                    </h2>
                    <div className='space-y-4'>
                        <Input
                            type='text'
                            placeholder='Системное имя (например: admin)'
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                        />
                        <Input
                            type='text'
                            placeholder='Отображаемое имя (например: Администратор)'
                            value={newRoleDisplayName}
                            onChange={(e) => setNewRoleDisplayName(e.target.value)}
                        />
                        <Input
                            type='text'
                            placeholder='Описание роли'
                            value={newRoleDescription}
                            onChange={(e) => setNewRoleDescription(e.target.value)}
                        />
                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={() => {
                                    setShowCreateRoleForm(false)
                                    setNewRoleName('')
                                    setNewRoleDisplayName('')
                                    setNewRoleDescription('')
                                }}
                                className='px-4 py-2 rounded-xl transition-colors'
                                style={{ 
                                    background: '#f1f5f9',
                                    color: brandColors.text.primary
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreateRole}
                                disabled={!newRoleName.trim() || !newRoleDisplayName.trim()}
                                className='px-4 py-2 rounded-xl transition-colors disabled:opacity-50'
                                style={{ 
                                    background: brandColors.primary,
                                    color: brandColors.surface
                                }}
                                onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.background = brandColors.secondary)}
                                onMouseOut={e => !e.currentTarget.disabled && (e.currentTarget.style.background = brandColors.primary)}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Форма редактирования пользователя */}
            {showEditUserForm && selectedUser && (
                <div className='bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100'>
                    <h2 className='text-xl font-bold mb-4' style={{ color: brandColors.text.primary }}>
                        Редактирование ролей пользователя: {selectedUser.name}
                    </h2>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                            {roles.map(role => (
                                <label key={role.id} className='flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors'>
                                    <input
                                        type='checkbox'
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRoles([...selectedRoles, role.id])
                                            } else {
                                                setSelectedRoles(selectedRoles.filter(id => id !== role.id))
                                            }
                                        }}
                                        className='form-checkbox h-5 w-5'
                                        style={{ color: brandColors.primary }}
                                    />
                                    <span style={{ color: brandColors.text.primary }}>{role.display_name || role.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={() => {
                                    setShowEditUserForm(false)
                                    setSelectedUser(null)
                                }}
                                className='px-4 py-2 rounded-xl transition-colors'
                                style={{ 
                                    background: '#f1f5f9',
                                    color: brandColors.text.primary
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleUpdateUserRoles}
                                className='px-4 py-2 rounded-xl transition-colors'
                                style={{ 
                                    background: brandColors.primary,
                                    color: brandColors.surface
                                }}
                                onMouseOver={e => e.currentTarget.style.background = brandColors.secondary}
                                onMouseOut={e => e.currentTarget.style.background = brandColors.primary}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Список ролей */}
                <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                    <h2 className='text-xl font-bold mb-4' style={{ color: brandColors.text.primary }}>Роли</h2>
                    <div className='grid grid-cols-1 gap-4'>
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className='p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all'
                                style={{ background: brandColors.surface }}
                            >
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <h3 className='font-bold' style={{ color: brandColors.text.primary }}>
                                            {role.display_name}
                                        </h3>
                                        <p className='text-sm' style={{ color: brandColors.text.light }}>
                                            Системное имя: {role.name}
                                        </p>
                                        {role.description && (
                                            <p className='mt-1' style={{ color: brandColors.text.secondary }}>
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Список пользователей */}
                <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                    <h2 className='text-xl font-bold mb-4' style={{ color: brandColors.text.primary }}>Пользователи</h2>
                    <div className='grid grid-cols-1 gap-4'>
                        {users.map(user => (
                            <div
                                key={user.id}
                                className='p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all'
                                style={{ background: brandColors.surface }}
                            >
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <h3 className='font-bold' style={{ color: brandColors.text.primary }}>
                                            {user.name}
                                        </h3>
                                        <p style={{ color: brandColors.text.secondary }}>{user.email}</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {user.roles.map(role => (
                                                <span
                                                    key={role.id}
                                                    className='px-2 py-1 rounded-full text-sm'
                                                    style={{ 
                                                        background: `${brandColors.accent}20`,
                                                        color: brandColors.primary
                                                    }}
                                                >
                                                    {role.display_name || role.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        className='p-2 rounded-lg transition-all hover:bg-gray-50'
                                    >
                                        <img
                                            className='h-5'
                                            src='icons/square-pen.svg'
                                            alt='Редактировать'
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UsersAndRoles 