import React, { useEffect, useState, useMemo } from 'react'
import ApiClient from '../../api/api.js'
import { toast } from 'react-toastify'
import { Loader, AnimatedCounter, Icon, FormModal, LargeModal, FormInput, FormSelectWithSearch } from '../../components/common'

// Skeleton loading component
const SkeletonCard = ({ delay = 0 }) => (
	<div className="animate-pulse bg-white rounded-xl shadow-sm p-6 border border-slate-200" style={{ animationDelay: `${delay}ms` }}>
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-slate-300 rounded-lg shimmer"></div>
				<div className="space-y-2">
					<div className="h-5 bg-slate-300 rounded w-32 shimmer"></div>
					<div className="h-3 bg-slate-200 rounded w-20 shimmer"></div>
				</div>
			</div>
			<div className="flex space-x-2">
				<div className="w-8 h-8 bg-slate-300 rounded-lg shimmer"></div>
				<div className="w-8 h-8 bg-slate-300 rounded-lg shimmer"></div>
			</div>
		</div>
		<div className="space-y-2">
			<div className="h-4 bg-slate-200 rounded w-full shimmer"></div>
			<div className="h-4 bg-slate-200 rounded w-3/4 shimmer"></div>
		</div>
	</div>
)

// Компонент для отображения сотрудника
const EmployeeItem = ({ employee, onEdit, onRemove }) => {
	// Улучшенное получение ФИО
	const getFullName = (user) => {
		if (user.profile && (user.profile.first_name || user.profile.last_name)) {
			const parts = [user.profile.last_name, user.profile.first_name, user.profile.middle_name].filter(Boolean)
			return parts.join(' ') || user.username
		}
		return user.full_name || user.username
	}

	const fullName = getFullName(employee.user)
	const initials = fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

	return (
		<div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
			<div className="flex items-center space-x-3 flex-1">
				<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
					{initials}
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-slate-900">{fullName}</p>
					<div className="flex items-center space-x-2 text-xs text-slate-500">
						<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
							{employee.position_title || employee.role.display_name}
						</span>
						<span>• {employee.user.email}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center space-x-1">
				{onEdit && (
					<button
						onClick={() => onEdit(employee)}
						className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200"
						title="Редактировать назначение"
					>
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
														<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
													</svg>
					</button>
				)}
				{onRemove && (
					<button
						onClick={() => onRemove(employee)}
						className="p-2 text-slate-400 hover:text-red-600 transition-colors duration-200"
						title="Удалить из подразделения"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="3,6 5,6 21,6"/>
							<path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
							<line x1="10" y1="11" x2="10" y2="17"/>
							<line x1="14" y1="11" x2="14" y2="17"/>
						</svg>
					</button>
				)}
			</div>
		</div>
	)
}

// Модальное окно для назначения/редактирования сотрудника в подразделение
const EmployeeAssignModal = ({ isOpen, department, users, roles, employee, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		user_id: '',
		role_id: ''
	})
	const [loading, setLoading] = useState(false)
	const [selectedUser, setSelectedUser] = useState(null)
	const [availableRoles, setAvailableRoles] = useState([])

	const isEdit = !!employee

	// Инициализация при редактировании
	useEffect(() => {
		if (employee) {
			setFormData({
				user_id: employee.user_id?.toString() || '',
				role_id: employee.role_id?.toString() || ''
			})
			const user = users.find(u => u.id === employee.user_id)
			setSelectedUser(user)
		} else {
			setFormData({
				user_id: '',
				role_id: ''
			})
			setSelectedUser(null)
		}
	}, [employee, users])

	// Когда выбирается пользователь, фильтруем доступные роли
	useEffect(() => {
		if (selectedUser && selectedUser.roles) {
			const userRoleNames = selectedUser.roles
			const filteredRoles = roles.filter(role => userRoleNames.includes(role.display_name))
			setAvailableRoles(filteredRoles)
			
			// При редактировании сохраняем текущую роль, при создании сбрасываем
			if (!isEdit) {
				setFormData(prev => ({ ...prev, role_id: '' }))
			}
		} else {
			setAvailableRoles([])
		}
	}, [selectedUser, roles, isEdit])

	const handleUserChange = (e) => {
		const userId = e.target.value
		const user = users.find(u => u.id === parseInt(userId))
		setSelectedUser(user)
		setFormData(prev => ({ ...prev, user_id: userId }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await onSave({
				user_id: parseInt(formData.user_id),
				role_id: parseInt(formData.role_id)
			})
			onClose()
		} catch (error) {
			// Error handling is done in parent component
		} finally {
			setLoading(false)
		}
	}

	// Функция для получения полного имени пользователя
	const getFullName = (user) => {
		if (user.profile && (user.profile.first_name || user.profile.last_name)) {
			const parts = [user.profile.last_name, user.profile.first_name, user.profile.middle_name].filter(Boolean)
			return parts.join(' ') || user.username
		}
		return user.full_name || user.username
	}

	const userOptions = users.map(user => ({
		value: user.id,
		label: `${getFullName(user)} (${user.username})`
	}))

	const roleOptions = availableRoles.map(role => ({
		value: role.id,
		label: role.display_name
	}))

	return (
		<FormModal
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={handleSubmit}
			title={isEdit ? 'Редактировать назначение' : 'Назначить сотрудника'}
			subtitle={`В подразделение: ${department?.name}`}
			icon="user-plus"
			loading={loading}
			submitText={isEdit ? 'Сохранить' : 'Назначить'}
			headerColor="#2563eb"
		>
			<FormSelectWithSearch
				label="Пользователь"
				required
				value={formData.user_id}
				onChange={handleUserChange}
				options={userOptions}
				placeholder="Выберите пользователя"
				searchPlaceholder="Поиск пользователя..."
			/>

			<FormSelectWithSearch
				label="Должность в подразделении"
				required
				value={formData.role_id}
				onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
				options={roleOptions}
				placeholder="Выберите должность"
				searchPlaceholder="Поиск роли..."
				helpText={selectedUser ? "Доступны только роли, назначенные пользователю" : "Сначала выберите пользователя"}
			/>

			{selectedUser && (
				<div className="p-3 bg-blue-50 rounded-lg">
					<div className="text-sm text-blue-900">
						<strong>Выбранный пользователь:</strong> {selectedUser.full_name}
					</div>
					<div className="text-xs text-blue-700 mt-1">
						Email: {selectedUser.email}
					</div>
					{selectedUser.roles && selectedUser.roles.length > 0 && (
						<div className="text-xs text-blue-700 mt-1">
							Роли: {selectedUser.roles.join(', ')}
						</div>
					)}
				</div>
			)}
		</FormModal>
	)
}

// Department Card Component  
const DepartmentCard = ({ department, level = 0, onEdit, onDelete, onAddChild, onAddEmployee, onEditEmployee, onRemoveEmployee, allEmployees = [] }) => {
	const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
	
	const indentStyle = {
		marginLeft: `${level * 24}px`,
		borderLeft: level > 0 ? '2px solid #f3f4f6' : 'none',
		paddingLeft: level > 0 ? '16px' : '0'
	}

	const departmentIcon = (
		<svg className="w-6 h-6 text-[#820000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m1-4h1" />
		</svg>
	)

	const hasChildren = department.children && department.children.length > 0

	return (
		<div style={indentStyle} className="mb-4">
			<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 no-hover-scale group">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3 flex-1">
						{hasChildren && (
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="p-1 hover:bg-gray-100 rounded transition-colors"
							>
								<svg 
									className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						)}
						<div className="p-2 rounded-lg bg-red-50">
							{departmentIcon}
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#820000] transition-colors duration-200">
								{department.name}
								{department.short_name && (
									<span className="text-sm text-gray-500 ml-2">({department.short_name})</span>
								)}
							</h3>
							<div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
								{department.head && (
									<div className="flex items-center">
										<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										<span>Руководитель: {department.head.name}</span>
									</div>
								)}
								{hasChildren && (
									<div className="flex items-center">
										<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m1-4h1" />
										</svg>
										<span>{department.children.length} подразделений</span>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => onAddEmployee(department)}
							className="p-2 text-gray-500 hover:text-[#820000] hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
							title="Назначить сотрудника"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
							</svg>
						</button>
						<button
							onClick={() => onAddChild(department)}
							className="p-2 text-gray-500 hover:text-[#820000] hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
							title="Добавить подразделение"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
							</svg>
						</button>
						<button
							onClick={() => onEdit(department)}
							className="p-2 text-gray-500 hover:text-[#820000] hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
							title="Редактировать"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</button>
						<button
							onClick={() => onDelete(department)}
							className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
							title="Удалить"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				</div>
				
				{department.description && (
					<div className="mt-3 p-3 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600">{department.description}</p>
					</div>
				)}

				{/* Employees section */}
				{department.employees && department.employees.length > 0 && (
					<div className="mt-4">
						<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
							</svg>
							Сотрудники ({department.employees.length})
						</h4>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{department.employees.map(employee => (
								<EmployeeItem
									key={employee.id}
									employee={employee}
									onEdit={onEditEmployee}
									onRemove={onRemoveEmployee}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Children departments */}
			{hasChildren && isExpanded && (
				<div className="mt-4">
					{department.children.map(child => (
						<DepartmentCard
							key={child.id}
							department={child}
							level={level + 1}
							onEdit={onEdit}
							onDelete={onDelete}
							onAddChild={onAddChild}
							onAddEmployee={onAddEmployee}
							onEditEmployee={onEditEmployee}
							onRemoveEmployee={onRemoveEmployee}
							allEmployees={allEmployees}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// Модальное окно для создания/редактирования подразделения
const DepartmentModal = ({ isOpen, department, parentDepartment, departments, employees, users, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		name: '',
		short_name: '',
		description: '',
		parent_id: null,
		head_user_id: null
	})
	const [loading, setLoading] = useState(false)
	const isEdit = !!department

	useEffect(() => {
		if (department) {
			setFormData({
				name: department.name || '',
				short_name: department.short_name || '',
				description: department.description || '',
				parent_id: department.parent_id || null,
				head_user_id: department.head_user_id || null
			})
		} else {
			setFormData({
				name: '',
				short_name: '',
				description: '',
				parent_id: parentDepartment?.id || null,
				head_user_id: null
			})
		}
	}, [department, parentDepartment])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			const submitData = {
				...formData,
				parent_id: formData.parent_id && formData.parent_id !== '' ? parseInt(formData.parent_id) : null,
				head_user_id: formData.head_user_id && formData.head_user_id !== '' ? parseInt(formData.head_user_id) : null
			}
			await onSave(submitData)
			onClose()
		} catch (error) {
			// Error handling is done in parent component
		} finally {
			setLoading(false)
		}
	}

	// Получаем список доступных родительских подразделений
	const getAvailableParents = () => {
		if (!departments) return []
		
		const flatDepartments = flattenDepartments(departments)
		return flatDepartments.filter(dept => {
			if (!isEdit) return true
			// При редактировании исключаем само подразделение и его потомков
			return dept.id !== department.id && !isDescendant(department, dept.id, flatDepartments)
		})
	}

	const parentOptions = [
		{ value: '', label: 'Корневое подразделение' },
		...getAvailableParents().map(dept => ({
			value: dept.id,
			label: dept.name
		}))
	]

	// Функция для получения полного имени пользователя
	const getFullName = (user) => {
		if (user.profile && (user.profile.first_name || user.profile.last_name)) {
			const parts = [user.profile.last_name, user.profile.first_name, user.profile.middle_name].filter(Boolean)
			return parts.join(' ') || user.username
		}
		return user.full_name || user.username
	}

	const headOptions = [
		{ value: '', label: 'Без руководителя' },
		...users.map(user => ({
			value: user.id,
			label: `${getFullName(user)} (${user.username})`
		}))
	]

	return (
		<LargeModal
			isOpen={isOpen}
			onClose={onClose}
			title={isEdit ? 'Редактировать подразделение' : 'Создать новое подразделение'}
			subtitle={parentDepartment ? `Дочернее подразделение для: ${parentDepartment.name}` : undefined}
			icon="building"
			headerColor="#820000"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput
						label="Название подразделения"
						required
						value={formData.name}
						onChange={(e) => setFormData({...formData, name: e.target.value})}
						placeholder="Факультет информационных технологий"
					/>
					
					<FormInput
						label="Сокращенное название"
						value={formData.short_name}
						onChange={(e) => setFormData({...formData, short_name: e.target.value})}
						placeholder="ФИТ"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Описание
					</label>
					<textarea
						value={formData.description}
						onChange={(e) => setFormData({...formData, description: e.target.value})}
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#820000] focus:border-[#820000] resize-none"
						placeholder="Краткое описание подразделения и его функций"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelectWithSearch
						label="Родительское подразделение"
						value={formData.parent_id || ''}
						onChange={(e) => setFormData({...formData, parent_id: e.target.value || null})}
						options={parentOptions}
						placeholder="Выберите родительское подразделение"
						searchPlaceholder="Поиск подразделения..."
					/>

					<FormSelectWithSearch
						label="Руководитель"
						value={formData.head_user_id || ''}
						onChange={(e) => setFormData({...formData, head_user_id: e.target.value || null})}
						options={headOptions}
						placeholder="Выберите руководителя"
						searchPlaceholder="Поиск пользователя..."
					/>
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
						className="px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
						style={{ backgroundColor: "#820000" }}
					>
						{loading && <Icon name="refresh-cw" size={16} className="animate-spin" />}
						<span>{loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать')}</span>
					</button>
				</div>
			</form>
		</LargeModal>
	)
}

// Helper function to check if department is a descendant
const isDescendant = (potentialParent, targetId, allDepartments) => {
	if (!targetId) return false
	
	const findInChildren = (dept) => {
		if (dept.children) {
			for (const child of dept.children) {
				if (child.id === targetId || findInChildren(child)) {
					return true
				}
			}
		}
		return false
	}
	
	return findInChildren(potentialParent)
}

// Helper function to flatten departments tree
const flattenDepartments = (departments) => {
	const result = []
	const addDepartment = (dept) => {
		result.push(dept)
		if (dept.children) {
			dept.children.forEach(addDepartment)
		}
	}
	departments.forEach(addDepartment)
	return result
}

const Structure = () => {
	const [departments, setDepartments] = useState([])
	const [employees, setEmployees] = useState([])
	const [users, setUsers] = useState([])
	const [roles, setRoles] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [showModal, setShowModal] = useState(false)
	const [editingDepartment, setEditingDepartment] = useState(null)
	const [parentDepartment, setParentDepartment] = useState(null)
	const [showEmployeeModal, setShowEmployeeModal] = useState(false)
	const [selectedDepartment, setSelectedDepartment] = useState(null)
	const [editingEmployee, setEditingEmployee] = useState(null)

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			setLoading(true)
			setError(null)
			const [departmentsData, employeesData, usersData, rolesData] = await Promise.all([
				ApiClient.getDepartments(),
				ApiClient.getEmployees(),
				ApiClient.getUsers(),
				ApiClient.getRoles()
			])
			setDepartments(departmentsData || [])
			setEmployees(employeesData || [])
			setUsers(usersData || [])
			setRoles(rolesData || [])
		} catch (err) {
			console.error('Ошибка загрузки данных:', err)
			setError(err.message || 'Не удалось загрузить данные.')
			toast.error(err.message || 'Не удалось загрузить данные.')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateDepartment = async (departmentData) => {
		try {
			await ApiClient.createDepartment(departmentData)
			toast.success('Подразделение успешно создано')
			loadData()
		} catch (error) {
			toast.error(error.message || 'Ошибка при создании подразделения')
			throw error
		}
	}

	const handleUpdateDepartment = async (departmentId, departmentData) => {
		try {
			await ApiClient.updateDepartment(departmentId, departmentData)
			toast.success('Подразделение успешно обновлено')
			loadData()
		} catch (error) {
			toast.error(error.message || 'Ошибка при обновлении подразделения')
			throw error
		}
	}

	const handleDeleteDepartment = async (department) => {
		const hasChildren = department.children && department.children.length > 0
		const confirmMessage = hasChildren 
			? `Подразделение "${department.name}" содержит ${department.children.length} дочерних подразделений. Удаление невозможно.`
			: `Вы уверены, что хотите удалить подразделение "${department.name}"?`

		if (hasChildren) {
			toast.error(confirmMessage)
			return
		}

		if (!confirm(confirmMessage)) {
			return
		}

		try {
			await ApiClient.deleteDepartment(department.id)
			toast.success('Подразделение успешно удалено')
			loadData()
		} catch (error) {
			toast.error(error.message || 'Ошибка при удалении подразделения')
		}
	}

	const openEditModal = (department) => {
		setEditingDepartment(department)
		setParentDepartment(null)
		setShowModal(true)
	}

	const openCreateModal = (parent = null) => {
		setEditingDepartment(null)
		setParentDepartment(parent)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setEditingDepartment(null)
		setParentDepartment(null)
	}

	// Функции для управления сотрудниками
	const handleAddEmployee = async (employeeData) => {
		try {
			if (editingEmployee) {
				// Редактирование существующего назначения
				await ApiClient.updateDepartmentEmployee(selectedDepartment.id, editingEmployee.id, employeeData)
				toast.success('Назначение сотрудника успешно обновлено')
			} else {
				// Создание нового назначения
				await ApiClient.addDepartmentEmployee(selectedDepartment.id, employeeData)
				toast.success('Сотрудник успешно назначен в подразделение')
			}
			loadData() // Перезагружаем данные для обновления
		} catch (error) {
			toast.error(error.message || (editingEmployee ? 'Ошибка при обновлении назначения' : 'Ошибка при назначении сотрудника'))
			throw error
		}
	}

	const handleRemoveEmployee = async (employee) => {
		if (!confirm(`Удалить ${employee.user.full_name} из подразделения?`)) {
			return
		}

		try {
			await ApiClient.removeDepartmentEmployee(employee.department_id || selectedDepartment?.id, employee.id)
			toast.success('Сотрудник удален из подразделения')
			loadData() // Перезагружаем данные для обновления
		} catch (error) {
			toast.error(error.message || 'Ошибка при удалении сотрудника')
		}
	}

	const openEmployeeModal = (department, employee = null) => {
		setSelectedDepartment(department)
		setEditingEmployee(employee)
		setShowEmployeeModal(true)
	}

	const openEditEmployeeModal = (employee) => {
		// Находим подразделение сотрудника
		const findDepartmentForEmployee = (departments, employeeId) => {
			for (const dept of departments) {
				if (dept.employees && dept.employees.some(emp => emp.id === employeeId)) {
					return dept
				}
				if (dept.children) {
					const found = findDepartmentForEmployee(dept.children, employeeId)
					if (found) return found
				}
			}
			return null
		}

		const department = findDepartmentForEmployee(departments, employee.id)
		if (department) {
			openEmployeeModal(department, employee)
		}
	}

	const closeEmployeeModal = () => {
		setShowEmployeeModal(false)
		setSelectedDepartment(null)
		setEditingEmployee(null)
	}

	const allDepartmentsFlat = useMemo(() => flattenDepartments(departments), [departments])
	const totalDepartments = allDepartmentsFlat.length
	const rootDepartments = departments.length

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
						onClick={loadData}
						className='w-full px-4 py-2 bg-[#820000] text-white rounded-lg hover:bg-[#a00000] transition-colors duration-200 font-medium'
					>
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<Loader />
			</div>
		)
	}

	return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Заголовок */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{backgroundColor: '#77000220'}}>
								<Icon name="building" size={24} style={{color: '#770002'}} />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-slate-900">Структура организации</h1>
								<p className="text-slate-600">Управление подразделениями и сотрудниками</p>
							</div>
						</div>
						<button
							onClick={() => openCreateModal()}
							className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
							style={{backgroundColor: '#770002'}}
							onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
							onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
						>
							<Icon name="plus" size={16} />
							Добавить подразделение
						</button>
					</div>
				</div>

				{/* Statistics */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-red-100'>
								<svg className='w-6 h-6 text-[#820000]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m1-4h1' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Всего подразделений</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={totalDepartments} delay={100} />
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-blue-100'>
								<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Сотрудники</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={employees.length} delay={200} />
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-green-100'>
								<svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Корневых подразделений</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={rootDepartments} delay={300} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Структура подразделений
							</h3>
							<button
								onClick={() => openCreateModal()}
								className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white rounded-lg hover:from-[#a00000] hover:to-[#d11a2a] transition-all duration-200 font-medium no-hover-scale'
							>
								<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
								</svg>
								Создать подразделение
							</button>
						</div>
					</div>
					
					<div className='p-6'>
						{departments.length === 0 ? (
							<div className='text-center py-12'>
								<div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
									<svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m1-4h1' />
									</svg>
								</div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>Подразделения не найдены</h3>
								<p className='text-gray-500 mb-6'>Создайте первое подразделение для начала работы</p>
								<button
									onClick={() => openCreateModal()}
									className='inline-flex items-center px-4 py-2 bg-[#820000] text-white rounded-lg hover:bg-[#a00000] transition-colors duration-200 font-medium'
								>
									<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
									</svg>
									Создать подразделение
								</button>
							</div>
						) : (
							<div className='space-y-4'>
								{departments.map(department => (
									<DepartmentCard
										key={department.id}
										department={department}
										level={0}
										onEdit={openEditModal}
										onDelete={handleDeleteDepartment}
										onAddChild={openCreateModal}
										onAddEmployee={openEmployeeModal}
										onEditEmployee={openEditEmployeeModal}
										onRemoveEmployee={handleRemoveEmployee}
										allEmployees={employees}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Department Modal */}
			{showModal && (
				<DepartmentModal
					isOpen={showModal}
					department={editingDepartment}
					parentDepartment={parentDepartment}
					departments={allDepartmentsFlat}
					employees={employees}
					users={users}
					onClose={closeModal}
					onSave={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
				/>
			)}

			{/* Employee Assignment Modal */}
			{showEmployeeModal && selectedDepartment && (
				<EmployeeAssignModal
					isOpen={showEmployeeModal}
					department={selectedDepartment}
					users={users}
					roles={roles}
					employee={editingEmployee}
					onClose={closeEmployeeModal}
					onSave={handleAddEmployee}
				/>
			)}
		</div>
	)
}

export default Structure
