import React, { useEffect, useState, useMemo } from 'react'
import ApiClient from '../../api/api.js'
import { toast } from 'react-toastify'
import { Loader, AnimatedCounter, Icon, PageHeader, Section, EmptyState, LoadingState, ErrorState, FormModal, FormInput } from '../../components/common'

// Skeleton loading component for role cards
const SkeletonCard = ({ delay = 0 }) => (
	<div className="animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{ animationDelay: `${delay}ms` }}>
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-gray-300 rounded-lg shimmer"></div>
				<div className="space-y-2">
					<div className="h-5 bg-gray-300 rounded w-24 shimmer"></div>
					<div className="h-3 bg-gray-200 rounded w-16 shimmer"></div>
				</div>
			</div>
			<div className="flex space-x-2">
				<div className="w-8 h-8 bg-gray-300 rounded-lg shimmer"></div>
				<div className="w-8 h-8 bg-gray-300 rounded-lg shimmer"></div>
			</div>
		</div>
		<div className="space-y-2">
			<div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
			<div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
		</div>
	</div>
)

// Role Card Component
const RoleCard = ({ role, onEdit, onDelete, index }) => {
	const roleIcon = role.is_system ? (
		<svg className="w-6 h-6 text-[#820000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
		</svg>
	) : (
		<svg className="w-6 h-6 text-[#c10f1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
		</svg>
	)

	return (
		<div 
			className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 no-hover-scale group"
			style={{ animationDelay: `${index * 100}ms` }}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div className={`p-2 rounded-lg ${role.is_system ? 'bg-red-50' : 'bg-red-100'}`}>
						{roleIcon}
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#820000] transition-colors duration-200">
							{role.display_name}
						</h3>
						<p className="text-sm text-gray-500">
							{role.is_system ? 'Системная роль' : 'Пользовательская роль'}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					{role.is_system ? (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-[#820000]">
							<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							Защищена
						</span>
					) : (
						<div className="flex space-x-1">
							<button
								onClick={() => onEdit(role)}
								className="p-2 text-gray-500 hover:text-[#820000] hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
								title="Редактировать"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</button>
							<button
								onClick={() => onDelete(role)}
								className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 no-hover-scale"
								title="Удалить"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="space-y-2">
				<p className="text-sm text-gray-600">
					<span className="font-medium">Код:</span> {role.name}
				</p>
				{role.description && (
					<p className="text-sm text-gray-600">
						<span className="font-medium">Описание:</span> {role.description}
					</p>
				)}
			</div>
		</div>
	)
}

// Модальное окно для создания/редактирования роли
const RoleModal = ({ isOpen, role, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		name: '',
		display_name: '',
		description: ''
	})
	const [loading, setLoading] = useState(false)
	const isEdit = !!role

	useEffect(() => {
		if (role) {
			setFormData({
				name: role.name || '',
				display_name: role.display_name || '',
				description: role.description || ''
			})
		} else {
			setFormData({
				name: '',
				display_name: '',
				description: ''
			})
		}
	}, [role])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (isEdit) {
				await onSave(role.id, {
					display_name: formData.display_name,
					description: formData.description
				})
			} else {
				await onSave(formData)
			}
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
			title={isEdit ? 'Редактировать роль' : 'Создать новую роль'}
			icon="shield-user"
			loading={loading}
			submitText={isEdit ? 'Сохранить' : 'Создать'}
			headerColor="#820000"
		>
			{!isEdit && (
				<FormInput
					label="Название роли"
					name="name"
					value={formData.name}
					onChange={(e) => setFormData({...formData, name: e.target.value})}
					placeholder="admin, dean, secretary..."
					required
					helpText="Техническое имя роли (только латинские буквы, цифры и подчеркивания)"
				/>
			)}
			
			<FormInput
				label="Отображаемое название"
				name="display_name"
				value={formData.display_name}
				onChange={(e) => setFormData({...formData, display_name: e.target.value})}
				placeholder="Администратор, Декан, Секретарь..."
				required
			/>
			
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Описание
				</label>
				<textarea
					value={formData.description}
					onChange={(e) => setFormData({...formData, description: e.target.value})}
					placeholder="Краткое описание роли и её обязанностей..."
					rows={3}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#820000] focus:border-[#820000] resize-none"
				/>
			</div>
		</FormModal>
	)
}

const Roles = () => {
	const [roles, setRoles] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [filterType, setFilterType] = useState('all') // all, system, custom
	const [showModal, setShowModal] = useState(false)
	const [editingRole, setEditingRole] = useState(null)

	useEffect(() => {
		loadRoles()
	}, [])

	const loadRoles = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await ApiClient.getRoles()
			setRoles(data || [])
		} catch (err) {
			console.error('Ошибка загрузки ролей:', err)
			setError(err.message || 'Не удалось загрузить роли.')
			toast.error(err.message || 'Не удалось загрузить роли.')
		} finally {
			setLoading(false)
		}
	}

	const filteredRoles = useMemo(() => {
		return roles.filter(role => {
			const matchesSearch = searchTerm === '' ||
				role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))

			const matchesFilter = filterType === 'all' ||
				(filterType === 'system' && role.is_system) ||
				(filterType === 'custom' && !role.is_system)

			return matchesSearch && matchesFilter
		})
	}, [roles, searchTerm, filterType])

	const handleCreateRole = async (roleData) => {
		try {
			await ApiClient.createRole(roleData)
			toast.success('Роль успешно создана')
			loadRoles()
		} catch (error) {
			toast.error(error.message || 'Ошибка при создании роли')
			throw error
		}
	}

	const handleUpdateRole = async (roleId, roleData) => {
		try {
			await ApiClient.updateRole(roleId, roleData)
			toast.success('Роль успешно обновлена')
			loadRoles()
		} catch (error) {
			toast.error(error.message || 'Ошибка при обновлении роли')
			throw error
		}
	}

	const handleDeleteRole = async (role) => {
		if (!confirm(`Вы уверены, что хотите удалить роль "${role.display_name}"?`)) {
			return
		}

		try {
			await ApiClient.deleteRole(role.id)
			toast.success('Роль успешно удалена')
			loadRoles()
		} catch (error) {
			toast.error(error.message || 'Ошибка при удалении роли')
		}
	}

	const openEditModal = (role) => {
		setEditingRole(role)
		setShowModal(true)
	}

	const openCreateModal = () => {
		setEditingRole(null)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setEditingRole(null)
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
						onClick={loadRoles}
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
		<div className='min-h-screen bg-gray-50'>
			<div className='p-6 max-w-7xl mx-auto'>
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-900 mb-2'>
						Управление ролями
					</h1>
					<p className='text-gray-600'>
						Создавайте и управляйте ролями пользователей в системе
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-red-100'>
								<svg className='w-6 h-6 text-[#820000]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Всего ролей</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={roles.length} delay={100} />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Список ролей
							</h3>
							<button
								onClick={openCreateModal}
								className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white rounded-lg hover:from-[#a00000] hover:to-[#d11a2a] transition-all duration-200 font-medium no-hover-scale'
							>
								<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
								</svg>
								Создать роль
							</button>
						</div>
					</div>
					
					<div className='overflow-x-auto'>
						{roles.length === 0 ? (
							<div className='text-center py-12'>
								<p className='text-gray-500'>Роли не найдены</p>
							</div>
						) : (
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Роль</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Код</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Описание</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Тип</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Действия</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{roles.map((role, index) => (
										<tr key={role.id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm font-medium text-gray-900'>
													{role.display_name}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>{role.name}</div>
											</td>
											<td className='px-6 py-4'>
												<div className='text-sm text-gray-900'>{role.description || 'Нет описания'}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{role.is_system ? (
													<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-[#820000]'>
														Системная
													</span>
												) : (
													<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
														Пользовательская
													</span>
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{!role.is_system && (
													<div className="flex space-x-2">
														<button
															onClick={() => openEditModal(role)}
															className="text-[#820000] hover:text-[#a00000] text-sm font-medium"
															title="Редактировать"
														>
															Редактировать
														</button>
														<button
															onClick={() => handleDeleteRole(role)}
															className="text-red-600 hover:text-red-800 text-sm font-medium"
															title="Удалить"
														>
															Удалить
														</button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>

			{/* Role Modal */}
			{showModal && (
				<RoleModal
					isOpen={showModal}
					role={editingRole}
					onClose={closeModal}
					onSave={editingRole ? handleUpdateRole : handleCreateRole}
				/>
			)}
		</div>
	)
}

export default Roles 