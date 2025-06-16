import React, { useEffect, useState, useMemo } from 'react'
import ApiClient from '../../api/api.js'
import { toast } from 'react-toastify'
import { Loader, UserProfileModal, AnimatedCounter, FormModal, LargeModal, FormInput } from '../../components/common'

// Profile Edit Modal Component
const ProfileEditModal = ({ isOpen, user, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		phone: '',
		first_name: '',
		last_name: '',
		middle_name: '',
		birth_date: '',
		position: '',
		department: '',
		course: '',
		group_name: '',
		school: '',
		direction: '',
		chair: '',
		academic_degree: ''
	})
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (user) {
			setFormData({
				username: user?.username || '',
				email: user?.email || '',
				phone: user?.phone || '',
				first_name: user?.profile?.first_name || '',
				last_name: user?.profile?.last_name || '',
				middle_name: user?.profile?.middle_name || '',
				birth_date: user?.profile?.birth_date || user?.birth_date || '',
				position: user?.department_info?.role_name || user?.profile?.position || '',
				department: user?.department_info?.department_name || user?.profile?.department || '',
				course: user?.profile?.course || '',
				group_name: user?.profile?.group_name || '',
				school: user?.profile?.school || '',
				direction: user?.profile?.direction || '',
				chair: user?.profile?.chair || '',
				academic_degree: user?.profile?.academic_degree || ''
			})
		}
	}, [user])

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			console.log('Обновляем пользователя:', user.id)
			console.log('Данные формы:', formData)

			// Обновляем основную информацию пользователя
			const userUpdateData = {
				username: formData.username,
				email: formData.email,
				phone: formData.phone || null
			}
			console.log('Данные пользователя для обновления:', userUpdateData)
			
			await ApiClient.updateUser(user.id, userUpdateData)

			// Подготавливаем данные профиля (убираем пустые строки)
			const profileUpdateData = {
				first_name: formData.first_name || null,
				last_name: formData.last_name || null,
				middle_name: formData.middle_name || null,
				birth_date: formData.birth_date || null,
				position: formData.position || null,
				department: formData.department || null,
				course: formData.course && !isNaN(parseInt(formData.course)) ? parseInt(formData.course) : null,
				group_name: formData.group_name || null,
				school: formData.school || null,
				direction: formData.direction || null,
				chair: formData.chair || null,
				academic_degree: formData.academic_degree || null
			}
			console.log('Данные профиля для обновления:', profileUpdateData)

			// Обновляем профиль пользователя
			await onSave(user.id, profileUpdateData)
			onClose()
		} catch (error) {
			console.error('Ошибка в handleSubmit:', error)
			// Error handling is done in parent component
		} finally {
			setLoading(false)
		}
	}

	return (
		<LargeModal
			isOpen={isOpen}
			onClose={onClose}
			title="Редактировать профиль"
			subtitle={`Пользователь: ${user?.full_name || user?.username}`}
			icon="user-pen"
			headerColor="#820000"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Основная информация */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormInput
							label="Логин"
							value={formData.username}
							onChange={(e) => handleInputChange('username', e.target.value)}
							placeholder="Логин пользователя"
						/>
						<FormInput
							label="Email"
							type="email"
							value={formData.email}
							onChange={(e) => handleInputChange('email', e.target.value)}
							placeholder="email@example.com"
						/>
						<FormInput
							label="Телефон"
							type="tel"
							value={formData.phone}
							onChange={(e) => handleInputChange('phone', e.target.value)}
							placeholder="+7 (900) 123-45-67"
						/>
					</div>
					
					<h4 className="text-md font-semibold text-gray-900 mb-3 mt-6">ФИО</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormInput
							label="Фамилия"
							value={formData.last_name}
							onChange={(e) => handleInputChange('last_name', e.target.value)}
							placeholder="Фамилия"
						/>
						<FormInput
							label="Имя"
							value={formData.first_name}
							onChange={(e) => handleInputChange('first_name', e.target.value)}
							placeholder="Имя"
						/>
						<FormInput
							label="Отчество"
							value={formData.middle_name}
							onChange={(e) => handleInputChange('middle_name', e.target.value)}
							placeholder="Отчество"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
						<FormInput
							label="Дата рождения"
							type="date"
							value={formData.birth_date}
							onChange={(e) => handleInputChange('birth_date', e.target.value)}
						/>
					</div>
				</div>

				{/* Рабочая информация */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Рабочая информация</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="Должность"
							value={formData.position}
							onChange={(e) => handleInputChange('position', e.target.value)}
							placeholder="Должность"
						/>
						<FormInput
							label="Подразделение"
							value={formData.department}
							onChange={(e) => handleInputChange('department', e.target.value)}
							placeholder="Подразделение"
						/>
					</div>
				</div>

				{/* Учебная информация */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Учебная информация</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="Курс"
							type="number"
							value={formData.course}
							onChange={(e) => handleInputChange('course', e.target.value)}
							placeholder="1"
							min="1"
							max="6"
						/>
						<FormInput
							label="Группа"
							value={formData.group_name}
							onChange={(e) => handleInputChange('group_name', e.target.value)}
							placeholder="ИТ-101"
						/>
						<FormInput
							label="Образовательное учреждение"
							value={formData.school}
							onChange={(e) => handleInputChange('school', e.target.value)}
							placeholder="Название учреждения"
						/>
						<FormInput
							label="Направление обучения"
							value={formData.direction}
							onChange={(e) => handleInputChange('direction', e.target.value)}
							placeholder="Информатика и вычислительная техника"
						/>
						<FormInput
							label="Кафедра"
							value={formData.chair}
							onChange={(e) => handleInputChange('chair', e.target.value)}
							placeholder="Кафедра информационных технологий"
						/>
						<FormInput
							label="Ученая степень"
							value={formData.academic_degree}
							onChange={(e) => handleInputChange('academic_degree', e.target.value)}
							placeholder="Кандидат технических наук"
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
						disabled={loading}
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2 bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white rounded-lg hover:from-[#a00000] hover:to-[#d11a2a] transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Сохранение...
							</>
						) : (
							<>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
								</svg>
								Сохранить
							</>
						)}
					</button>
				</div>
			</form>
		</LargeModal>
	)
}

// User Role Assignment Modal
const UserRoleModal = ({ isOpen, user, onClose, onSave }) => {
	const [selectedRoles, setSelectedRoles] = useState([])
	const [availableRoles, setAvailableRoles] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (user) {
			setSelectedRoles(user.roles || [])
			loadAvailableRoles()
		}
	}, [user])

	const loadAvailableRoles = async () => {
		try {
			const roles = await ApiClient.getRoles()
			setAvailableRoles(roles || [])
		} catch (error) {
			console.error('Ошибка загрузки ролей:', error)
			toast.error('Не удалось загрузить список ролей')
		}
	}

	const handleRoleToggle = (roleDisplayName) => {
		setSelectedRoles(prev => 
			prev.includes(roleDisplayName)
				? prev.filter(r => r !== roleDisplayName)
				: [...prev, roleDisplayName]
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await onSave(user.id, { roles: selectedRoles })
			onClose()
		} catch (error) {
			// Error handling is done in parent component
		} finally {
			setLoading(false)
		}
	}

	return (
		<FormModal
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={handleSubmit}
			title="Назначить роли"
			subtitle={`Пользователь: ${user?.full_name || user?.username}`}
			icon="shield-user"
			loading={loading}
			submitText="Сохранить"
			headerColor="#2563eb"
		>
			<div className="space-y-4">
				<p className="text-sm text-gray-600">
					Выберите роли для пользователя. Роли определяют уровень доступа и возможности в системе.
				</p>
				
				<div className="space-y-3 max-h-64 overflow-y-auto">
					{availableRoles.map(role => (
						<label key={role.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
							<input
								type="checkbox"
								checked={selectedRoles.includes(role.display_name)}
								onChange={() => handleRoleToggle(role.display_name)}
								className="mt-1"
							/>
							<div className="flex-1">
								<div className="font-medium text-gray-900">{role.display_name}</div>
								<div className="text-sm text-gray-500">{role.name}</div>
								{role.description && (
									<div className="text-xs text-gray-400 mt-1">{role.description}</div>
								)}
							</div>
						</label>
					))}
				</div>
				
				{selectedRoles.length > 0 && (
					<div className="p-3 bg-blue-50 rounded-lg">
						<div className="text-sm font-medium text-blue-900 mb-1">Выбранные роли:</div>
						<div className="flex flex-wrap gap-1">
							{selectedRoles.map(role => (
								<span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{role}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</FormModal>
	)
}

// Skeleton loading component for table rows
const SkeletonRow = ({ delay = 0 }) => (
	<tr className="animate-pulse" style={{ animationDelay: `${delay}ms` }}>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-gray-300 rounded-full shimmer"></div>
				<div className="space-y-2">
					<div className="h-4 bg-gray-300 rounded w-32 shimmer"></div>
					<div className="h-3 bg-gray-200 rounded w-16 shimmer"></div>
				</div>
			</div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="h-4 bg-gray-300 rounded w-40 shimmer"></div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="h-4 bg-gray-300 rounded w-24 shimmer"></div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="flex space-x-1">
				<div className="h-6 bg-gray-300 rounded-full w-16 shimmer"></div>
				<div className="h-6 bg-gray-200 rounded-full w-12 shimmer"></div>
			</div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="h-6 bg-gray-300 rounded-full w-20 shimmer"></div>
		</td>
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="h-8 bg-gray-300 rounded w-24 shimmer"></div>
		</td>
	</tr>
)

// Enhanced user avatar component
const UserAvatar = ({ user, size = 'sm' }) => {
	const sizeClasses = {
		sm: 'w-10 h-10',
		md: 'w-12 h-12',
		lg: 'w-16 h-16'
	}
	
	const generateAvatarUrl = (user) => {
		const initials = user.full_name || user.username;
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=820000&color=fff&size=128`;
	}

	return (
		<div className="flex items-center space-x-3">
			<img
				src={generateAvatarUrl(user)}
				alt={user.full_name || user.username}
				className={`${sizeClasses[size]} rounded-full ring-2 ring-gray-200 transition-all duration-200 hover:ring-red-300`}
			/>
		</div>
	)
}

const Users = () => {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedUser, setSelectedUser] = useState(null)
	const [roleAssignmentUser, setRoleAssignmentUser] = useState(null)
	const [profileEditUser, setProfileEditUser] = useState(null)
	const [availableRoles, setAvailableRoles] = useState([])
	const [rolesLoading, setRolesLoading] = useState(true)

	// State for filters
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedRole, setSelectedRole] = useState('all')
	const [selectedStatus, setSelectedStatus] = useState('all')

	useEffect(() => {
		loadUsers()
		loadAvailableRoles()
	}, [])

	const loadUsers = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await ApiClient.getUsers()
			setUsers(data || [])
		} catch (err) {
			console.error('Ошибка загрузки пользователей:', err)
			setError(err.message || 'Не удалось загрузить пользователей.')
			toast.error(err.message || 'Не удалось загрузить пользователей.')
		} finally {
			setLoading(false)
		}
	}

	const loadAvailableRoles = async () => {
		try {
			setRolesLoading(true)
			const roles = await ApiClient.getRoles()
			// Используем display_name для фильтрации
			const roleDisplayNames = roles.map(role => role.display_name)
			setAvailableRoles(roleDisplayNames)
		} catch (error) {
			console.error('Ошибка загрузки ролей:', error)
			// В случае ошибки можно оставить пустой массив или показать уведомление
		} finally {
			setRolesLoading(false)
		}
	}

	const filteredUsers = useMemo(() => {
		return users.filter(user => {
			const fullName = user.full_name || user.username || ''
			const email = user.email || ''
			const username = user.username || ''

			const matchesSearch = searchTerm === '' ||
				fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				username.toLowerCase().includes(searchTerm.toLowerCase())

			const matchesRole = selectedRole === 'all' || 
				(user.roles && user.roles.includes(selectedRole))

			const matchesStatus = selectedStatus === 'all' ||
				(selectedStatus === 'verified' && user.is_verified) ||
				(selectedStatus === 'unverified' && !user.is_verified)

			return matchesSearch && matchesRole && matchesStatus
		})
	}, [users, searchTerm, selectedRole, selectedStatus])

	const handleUserRowClick = async (userId) => {
		try {
			const userData = await ApiClient.getUserById(userId)
			// Загружаем информацию о подразделении пользователя
			try {
				console.log('Загружаем подразделение для пользователя ID:', userId)
				const departmentInfo = await ApiClient.getUserDepartment(userId)
				console.log('Информация о подразделении:', departmentInfo)
				userData.department_info = departmentInfo
			} catch (err) {
				console.log('Подразделение не найдено для пользователя:', err)
			}
			setSelectedUser(userData)
		} catch (error) {
			toast.error('Ошибка при загрузке данных пользователя')
		}
	}

	const handleAssignRoles = async (userId, userData) => {
		try {
			await ApiClient.updateUser(userId, userData)
			loadUsers() // Перезагружаем список пользователей
		} catch (error) {
			toast.error(error.message || 'Ошибка при назначении ролей')
			throw error
		}
	}

	const openRoleAssignmentModal = (user) => {
		setRoleAssignmentUser(user)
	}

	const closeRoleAssignmentModal = () => {
		setRoleAssignmentUser(null)
	}

	const openProfileEditModal = async (user) => {
		try {
			// Загружаем полную информацию о пользователе с подразделением
			const userData = await ApiClient.getUserById(user.id)
			try {
				console.log('Загружаем подразделение для редактирования пользователя ID:', user.id)
				const departmentInfo = await ApiClient.getUserDepartment(user.id)
				console.log('Информация о подразделении для редактирования:', departmentInfo)
				userData.department_info = departmentInfo
			} catch (err) {
				console.log('Подразделение не найдено для пользователя:', err)
			}
			setProfileEditUser(userData)
		} catch (error) {
			console.error('Ошибка загрузки данных пользователя для редактирования:', error)
			toast.error('Ошибка при загрузке данных пользователя')
		}
	}

	const closeProfileEditModal = () => {
		setProfileEditUser(null)
	}

	const handleProfileUpdate = async (userId, profileData) => {
		try {
			console.log('Отправляем данные профиля:', profileData)
			console.log('ID пользователя:', userId)
			await ApiClient.updateUserProfile(userId, profileData)
			
			// Если редактируется профиль текущего пользователя, обновляем данные в localStorage
			const currentUser = ApiClient.getCurrentUser()
			if (currentUser && currentUser.id === userId) {
				try {
					await ApiClient.updateCurrentUserData()
				} catch (updateError) {
					console.warn('Не удалось обновить данные текущего пользователя:', updateError)
				}
			}
			
			loadUsers() // Перезагружаем список пользователей
			toast.success('Профиль успешно обновлен')
		} catch (error) {
			console.error('Ошибка при обновлении профиля:', error)
			toast.error(error.message || 'Ошибка при обновлении профиля')
			throw error
		}
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center p-4'>
				<div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center'>
					<div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
						<svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
						</svg>
					</div>
					<h3 className='text-lg font-semibold text-gray-900 mb-2'>Ошибка загрузки</h3>
					<p className='text-gray-600 mb-6'>{error}</p>
					<button
						onClick={loadUsers}
						className='w-full px-4 py-2 bg-[#820000] text-white rounded-lg hover:bg-[#a00000] transition-colors duration-200 font-medium'
					>
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='p-6 max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-900 mb-2'>
						Управление пользователями
					</h1>
					<p className='text-gray-600'>
						Управляйте пользователями системы, просматривайте профили и назначайте роли
					</p>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200 no-hover-scale'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-red-100'>
								<svg className='w-6 h-6 text-[#820000]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Всего пользователей</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={users.length} delay={100} />
								</div>
							</div>
						</div>
					</div>
					
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200 no-hover-scale'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-green-100'>
								<svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Подтверждённые</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={users.filter(u => u.is_verified).length} delay={200} />
								</div>
							</div>
						</div>
					</div>
					
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200 no-hover-scale'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-yellow-100'>
								<svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Ожидают подтверждения</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={users.filter(u => !u.is_verified).length} delay={300} />
								</div>
							</div>
						</div>
					</div>
					
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200 no-hover-scale'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-orange-100'>
								<svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>С назначенными ролями</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={users.filter(u => u.roles && u.roles.length > 0).length} delay={400} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
					<h3 className='text-lg font-semibold text-gray-900 mb-4'>Фильтры и поиск</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='space-y-2'>
							<label htmlFor='search' className='block text-sm font-medium text-gray-700'>
								Поиск пользователей
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
									</svg>
								</div>
								<input
									type='text'
									id='search'
									placeholder='Поиск по имени, email, логину...'
									className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#820000] focus:border-[#820000] transition-colors duration-200'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
						
						<div className='space-y-2'>
							<label htmlFor='roleFilter' className='block text-sm font-medium text-gray-700'>
								Фильтр по роли
							</label>
							<select
								id='roleFilter'
								className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#820000] focus:border-[#820000] transition-colors duration-200'
								value={selectedRole}
								onChange={(e) => setSelectedRole(e.target.value)}
								disabled={rolesLoading}
							>
								<option value='all'>
									{rolesLoading ? 'Загрузка ролей...' : 'Все роли'}
								</option>
								{!rolesLoading && availableRoles.map(role => (
									<option key={role} value={role}>{role}</option>
								))}
							</select>
						</div>
						
						<div className='space-y-2'>
							<label htmlFor='statusFilter' className='block text-sm font-medium text-gray-700'>
								Статус аккаунта
							</label>
							<select
								id='statusFilter'
								className='block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#820000] focus:border-[#820000] transition-colors duration-200'
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
							>
								<option value='all'>Все статусы</option>
								<option value='verified'>Подтверждённые</option>
								<option value='unverified'>Неподтверждённые</option>
							</select>
						</div>
					</div>
				</div>

				{/* Users Table */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Список пользователей
							</h3>
							<span className='text-sm text-gray-500'>
								Найдено: {filteredUsers.length} из {users.length}
							</span>
						</div>
					</div>
					
					<div className='overflow-x-auto'>
						{loading ? (
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Пользователь</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Логин</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Роли</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Статус</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Действия</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{[...Array(5)].map((_, i) => <SkeletonRow key={i} delay={i * 100} />)}
								</tbody>
							</table>
						) : filteredUsers.length === 0 ? (
							<div className='text-center py-12'>
								<svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
								</svg>
								<h3 className='mt-2 text-sm font-medium text-gray-900'>Пользователи не найдены</h3>
								<p className='mt-1 text-sm text-gray-500'>
									Попробуйте изменить критерии поиска или фильтры.
								</p>
							</div>
						) : (
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Пользователь</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Логин</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Роли</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Статус</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48'>Действия</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{filteredUsers.map((user, index) => (
										<tr 
											key={user.id} 
											onClick={() => handleUserRowClick(user.id)} 
											className='cursor-pointer group table-row-hover no-hover-scale'
											style={{ animationDelay: `${index * 50}ms` }}
										>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center'>
													<UserAvatar user={user} />
													<div className='ml-4'>
														<div className='text-sm font-medium text-gray-900 group-hover:text-[#820000] transition-colors duration-150'>
															{user.full_name || user.username}
														</div>
														<div className='text-sm text-gray-500'>ID: {user.id}</div>
													</div>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>{user.email}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>{user.username}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex flex-wrap gap-1'>
													{user.roles && user.roles.length > 0 ? user.roles.map((role, i) => (
														<span key={i} className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-[#820000]'>
															{role}
														</span>
													)) : (
														<span className='text-sm text-gray-400'>Нет ролей</span>
													)}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{user.is_verified ? (
													<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
														<svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
															<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
														</svg>
														Подтвержден
													</span>
												) : (
													<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
														<svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
															<path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
														</svg>
														Ожидает
													</span>
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex gap-2'>
													<button
														onClick={(e) => {
															e.stopPropagation()
															openRoleAssignmentModal(user)
														}}
														className='inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#820000] to-[#c10f1a] hover:from-[#a00000] hover:to-[#d11a2a] rounded-lg transition-all duration-200'
														title='Назначить роли'
													>
														<svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
														</svg>
														Роли
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															openProfileEditModal(user)
														}}
														className='inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200'
														title='Редактировать профиль'
													>
														<svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
														</svg>
														Профиль
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>

			{/* User Profile Modal */}
			{selectedUser && (
				<UserProfileModal 
					user={selectedUser} 
					onClose={() => setSelectedUser(null)} 
				/>
			)}

			{/* User Role Assignment Modal */}
			{roleAssignmentUser && (
				<UserRoleModal
					isOpen={!!roleAssignmentUser}
					user={roleAssignmentUser}
					onClose={closeRoleAssignmentModal}
					onSave={handleAssignRoles}
				/>
			)}

			{/* Profile Edit Modal */}
			{profileEditUser && (
				<ProfileEditModal
					isOpen={!!profileEditUser}
					user={profileEditUser}
					onClose={closeProfileEditModal}
					onSave={handleProfileUpdate}
				/>
			)}
		</div>
	)
}

export default Users 