import React, { useEffect, useState, useMemo } from 'react'
import ApiClient from '../../api/api.js'
import { toast } from 'react-toastify'
import { Loader, AnimatedCounter, ApplicationCard, FormModal, FormInput, FormSelectWithSearch, FormFieldRenderer, LargeModal, Icon } from '../../components/common'

// Skeleton loading component
const SkeletonCard = ({ delay = 0 }) => (
	<div className="animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100" style={{ animationDelay: `${delay}ms` }}>
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-gray-300 rounded-lg shimmer"></div>
				<div className="space-y-2">
					<div className="h-5 bg-gray-300 rounded w-32 shimmer"></div>
					<div className="h-3 bg-gray-200 rounded w-20 shimmer"></div>
				</div>
			</div>
			<div className="w-20 h-6 bg-gray-300 rounded-full shimmer"></div>
		</div>
		<div className="space-y-2">
			<div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
			<div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
		</div>
	</div>
)

// Модальное окно создания заявки  
const CreateApplicationModal = ({ isOpen, applicationTypes, onClose, onCreate }) => {
	const [formData, setFormData] = useState({
		type_id: '',
		priority: 'normal',
		form_data: {}
	})
	const [selectedType, setSelectedType] = useState(null)
	const [loading, setLoading] = useState(false)

	// Функции для работы с файлами
	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const handleDownloadFile = async (fileId, filename) => {
		try {
			await ApiClient.downloadFile(fileId)
		} catch (error) {
			toast.error('Ошибка при скачивании файла')
		}
	}

	useEffect(() => {
		if (formData.type_id) {
			const type = applicationTypes.find(t => t.id === parseInt(formData.type_id))
			setSelectedType(type)
		} else {
			setSelectedType(null)
		}
	}, [formData.type_id, applicationTypes])

	const getFormFields = () => {
		if (!selectedType) return []
		try {
			const template = JSON.parse(selectedType.form_template || '{}')
			return template.fields || []
		} catch {
			return []
		}
	}

	const handleFieldChange = (fieldName, value) => {
		setFormData(prev => ({
			...prev,
			form_data: {
				...prev.form_data,
				[fieldName]: value
			}
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			const submitData = {
				type_id: parseInt(formData.type_id),
				priority: formData.priority,
				form_data: JSON.stringify(formData.form_data)
			}
			
			await onCreate(submitData)
			setFormData({
				type_id: '',
				priority: 'normal',
				form_data: {}
			})
			setSelectedType(null)
			onClose()
		} catch (error) {
			// Error handling is done in parent
		} finally {
			setLoading(false)
		}
	}

	const typeOptions = applicationTypes.map(type => ({
		value: type.id,
		label: type.display_name
	}))



	return (
		<FormModal
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={handleSubmit}
			title="Создать заявку"
			icon="file-plus"
			loading={loading}
			submitText="Создать заявку"
			headerColor="#820000"
			maxWidth="max-w-2xl"
		>
			<FormSelectWithSearch
				label="Тип заявки"
				required
				value={formData.type_id}
				onChange={(e) => setFormData({...formData, type_id: e.target.value, form_data: {}})}
				options={typeOptions}
				placeholder="Выберите тип заявки"
				searchPlaceholder="Поиск типа заявки..."
				helpText={selectedType?.description}
			/>

			{/* Файлы для ознакомления */}
			{selectedType && selectedType.attachments && selectedType.attachments.length > 0 && (
				<div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
					<h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
						<Icon name="folder" size={16} />
						Файлы для ознакомления ({selectedType.attachments.length})
					</h4>
					<div className="space-y-2">
						{selectedType.attachments.map((file) => (
							<div key={file.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
										<Icon name="file-text" size={14} style={{color: '#770002'}} />
									</div>
									<div>
										<p className="font-medium text-slate-900 text-sm" title={file.filename}>
											{file.filename.length > 30 ? file.filename.substring(0, 30) + '...' : file.filename}
										</p>
										<p className="text-xs text-slate-500">
											{formatFileSize(file.file_size)} • {file.content_type}
										</p>
									</div>
								</div>
								<button
									onClick={() => handleDownloadFile(file.id, file.filename)}
									className="text-purple-600 hover:text-purple-800 transition-colors p-1"
									title="Скачать файл"
								>
									<Icon name="eye" size={14} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}



			{/* Динамические поля формы */}
			{selectedType && getFormFields().length > 0 && (
				<div className="space-y-4">
					<hr className="border-gray-200" />
					<h3 className="text-sm font-medium text-gray-900">Данные заявки</h3>
					{getFormFields().map((field) => (
						<FormFieldRenderer
							key={field.name}
							field={field}
							value={formData.form_data[field.name] || ''}
							onChange={(value) => handleFieldChange(field.name, value)}
						/>
					))}
				</div>
			)}
		</FormModal>
	)
}

// Основной компонент
const ApplicationsNew = () => {
	const [applications, setApplications] = useState([])
	const [applicationTypes, setApplicationTypes] = useState([])
	const [applicationStatuses, setApplicationStatuses] = useState([])
	const [loading, setLoading] = useState(true)
	const [applicationsLoading, setApplicationsLoading] = useState(false) // Отдельное состояние для загрузки заявок
	const [error, setError] = useState(null)
	const [viewMode, setViewMode] = useState('my') // 'my' | 'assigned'
	const [filterStatus, setFilterStatus] = useState('')
	const [filterType, setFilterType] = useState('')
	const [showCreateModal, setShowCreateModal] = useState(false)

	const currentUser = ApiClient.getCurrentUser()
	const userRoles = currentUser?.roles || []

	useEffect(() => {
		loadData()
	}, [])

	// Отдельный useEffect для изменения режима просмотра
	useEffect(() => {
		if (!loading) { // Загружаем заявки только если основные данные уже загружены
			loadApplicationsWithLoading()
		}
	}, [viewMode])

	useEffect(() => {
		if (!loading) { // Загружаем заявки только если основные данные уже загружены
			loadApplicationsWithLoading()
		}
	}, [filterStatus, filterType])

	const loadData = async () => {
		try {
			setLoading(true)
			setError(null)
			
			const [typesData, statusesData] = await Promise.all([
				ApiClient.getApplicationTypes(),
				ApiClient.getApplicationStatuses()
			])
			
			setApplicationTypes(typesData || [])
			setApplicationStatuses(statusesData || [])
			
			await loadApplications()
		} catch (err) {
			console.error('Ошибка загрузки данных:', err)
			setError(err.message || 'Не удалось загрузить данные.')
			toast.error(err.message || 'Не удалось загрузить данные.')
		} finally {
			setLoading(false)
		}
	}

	const loadApplications = async () => {
		try {
			const params = {
				assignee_view: viewMode === 'assigned',
				status: filterStatus,
				type_id: filterType
			}
			
			const data = await ApiClient.getApplications(params)
			setApplications(data || [])
		} catch (err) {
			console.error('Ошибка загрузки заявок:', err)
			toast.error('Ошибка загрузки заявок')
		}
	}

	const loadApplicationsWithLoading = async () => {
		try {
			setApplicationsLoading(true)
			await loadApplications()
		} catch (error) {
			console.error('Ошибка загрузки заявок:', error)
		} finally {
			setTimeout(() => setApplicationsLoading(false), 300) // Короткая задержка для плавности
		}
	}

	const handleCreateApplication = async (applicationData) => {
		try {
			await ApiClient.createApplication(applicationData)
			toast.success('Заявка успешно создана')
			loadApplications()
		} catch (error) {
			toast.error(error.message || 'Ошибка при создании заявки')
			throw error
		}
	}

	const handlePerformAction = async (application, action) => {
		const actionText = action === 'approve' ? 'одобрить' : 'отклонить'
		
		if (!confirm(`Вы уверены, что хотите ${actionText} заявку "${application.title}"?`)) {
			return
		}

		try {
			await ApiClient.performApplicationAction(application.id, { action })
			toast.success(`Заявка ${action === 'approve' ? 'одобрена' : 'отклонена'}`)
			loadApplications()
		} catch (error) {
			toast.error(error.message || `Ошибка при выполнении действия`)
		}
	}

	const [selectedApplication, setSelectedApplication] = useState(null)
	const [showDetailModal, setShowDetailModal] = useState(false)

	const handleViewDetails = (application) => {
		setSelectedApplication(application)
		setShowDetailModal(true)
	}

	// Статистика
	const stats = useMemo(() => {
		const total = applications.length
		const pending = applications.filter(app => app.status.name === 'pending').length
		const inReview = applications.filter(app => app.status.name === 'in_review').length
		const completed = applications.filter(app => app.status.is_final).length

		return { total, pending, inReview, completed }
	}, [applications])

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
		<div className='min-h-screen bg-gray-50'>
			<div className='p-6 max-w-7xl mx-auto'>
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-900 mb-2'>
						Система заявок
					</h1>
					<p className='text-gray-600'>
						Создавайте заявки и отслеживайте их статус
					</p>
				</div>

				{/* Статистика */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-blue-100'>
								<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Всего заявок</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={stats.total} delay={100} />
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-yellow-100'>
								<svg className='w-6 h-6 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Ожидают</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={stats.pending} delay={200} />
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-blue-100'>
								<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>На рассмотрении</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={stats.inReview} delay={300} />
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
						<div className='flex items-center'>
							<div className='p-3 rounded-lg bg-green-100'>
								<svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-gray-600'>Завершены</p>
								<div className='text-gray-900'>
									<AnimatedCounter endValue={stats.completed} delay={400} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Контролы */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Заявки
							</h3>
							<button
								onClick={() => setShowCreateModal(true)}
								className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#820000] to-[#c10f1a] text-white rounded-lg hover:from-[#a00000] hover:to-[#d11a2a] transition-all duration-200 font-medium no-hover-scale'
							>
								<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
								</svg>
								Создать заявку
							</button>
						</div>
					</div>
					
					{/* Фильтры */}
					<div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
						<div className='flex flex-wrap items-center gap-4'>
							{/* Переключатель режима просмотра */}
							<div className='flex items-center space-x-1 bg-white rounded-lg p-1 border'>
								<button
									onClick={() => setViewMode('my')}
									className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										viewMode === 'my' 
											? 'bg-[#820000] text-white' 
											: 'text-gray-700 hover:text-gray-900'
									}`}
								>
									Мои заявки
								</button>
								<button
									onClick={() => setViewMode('assigned')}
									className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										viewMode === 'assigned' 
											? 'bg-[#820000] text-white' 
											: 'text-gray-700 hover:text-gray-900'
									}`}
								>
									Назначенные мне
								</button>
							</div>

							{/* Фильтр по статусу */}
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#820000] focus:border-[#820000]'
							>
								<option value=''>Все статусы</option>
								{applicationStatuses.map(status => (
									<option key={status.id} value={status.name}>
										{status.display_name}
									</option>
								))}
							</select>

							{/* Фильтр по типу */}
							<select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value)}
								className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#820000] focus:border-[#820000]'
							>
								<option value=''>Все типы</option>
								{applicationTypes.map(type => (
									<option key={type.id} value={type.id}>
										{type.display_name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Список заявок */}
				<div className='space-y-4'>
					{applicationsLoading ? (
						// Скелет загрузки заявок
						<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
							{[...Array(6)].map((_, index) => (
								<SkeletonCard key={index} delay={index * 100} />
							))}
						</div>
					) : applications.length === 0 ? (
						<div className='text-center py-12'>
							<div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
								<svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-gray-900 mb-2'>Заявки не найдены</h3>
							<p className='text-gray-500 mb-6'>
								{viewMode === 'my' 
									? 'У вас пока нет заявок. Создайте первую заявку!' 
									: 'Вам пока не назначены заявки для рассмотрения.'
								}
							</p>
							{viewMode === 'my' && (
								<button
									onClick={() => setShowCreateModal(true)}
									className='inline-flex items-center px-4 py-2 bg-[#820000] text-white rounded-lg hover:bg-[#a00000] transition-colors duration-200 font-medium'
								>
									<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
									</svg>
									Создать заявку
								</button>
							)}
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
							{applications.map(application => (
								<ApplicationCard
									key={application.id}
									application={application}
									onViewDetails={handleViewDetails}
									onPerformAction={handlePerformAction}
									userRole={viewMode}
									currentUserId={ApiClient.getCurrentUser()?.id}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Модальное окно создания заявки */}
			{showCreateModal && (
				<CreateApplicationModal
					applicationTypes={applicationTypes}
					onClose={() => setShowCreateModal(false)}
					onCreate={handleCreateApplication}
				/>
			)}

			{/* Модальное окно просмотра заявки */}
			{showDetailModal && selectedApplication && (
				<ApplicationDetailModal
					application={selectedApplication}
					onClose={() => {
						setShowDetailModal(false)
						setSelectedApplication(null)
					}}
					onPerformAction={handlePerformAction}
				/>
			)}
		</div>
	)
}

// Модальное окно просмотра заявки
const ApplicationDetailModal = ({ application, onClose, onPerformAction }) => {
	const [comment, setComment] = useState('')
	const [loading, setLoading] = useState(false)

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const handleDownloadFile = async (fileId, filename) => {
		try {
			await ApiClient.downloadFile(fileId)
		} catch (error) {
			toast.error(error.message || 'Ошибка при скачивании файла')
		}
	}

	const getFormData = () => {
		try {
			return JSON.parse(application.form_data || '{}')
		} catch {
			return {}
		}
	}

	const getFieldDisplayName = (fieldName) => {
		try {
			const template = JSON.parse(application.application_type?.form_template || '{}')
			const field = template.fields?.find(f => f.name === fieldName)
			return field ? field.label : fieldName
		} catch {
			return fieldName
		}
	}

	const handleAction = async (action) => {
		if (action === 'reject' && !comment.trim()) {
			toast.error('Введите комментарий для отклонения')
			return
		}
		
		setLoading(true)
		try {
			await onPerformAction(application, action)
			setComment('')
			onClose()
		} finally {
			setLoading(false)
		}
	}

	const getStatusColor = (status) => {
		const colors = {
			'pending': '#f59e0b',
			'approved': '#10b981',
			'rejected': '#ef4444',
			'in_review': '#3b82f6'
		}
		return colors[status?.name] || '#6b7280'
	}

	const currentUser = ApiClient.getCurrentUser()
	const isAdmin = currentUser?.roles?.includes('admin')
	const isAssignedExecutor = application.current_assignee_id === currentUser?.id
	const userDepartmentIds = currentUser?.departments?.map(d => d.id) || []
	const assignedDeptIds = application.assigned_departments?.map(d => d.id) || []
	const isInAssignedDepartment = userDepartmentIds.some(id => assignedDeptIds.includes(id))
	const canPerformActions = isAdmin || isAssignedExecutor || isInAssignedDepartment

	const formData = getFormData()

	return (
		<LargeModal
			isOpen={true}
			onClose={onClose}
			title={application.title}
			subtitle={`#${application.id} • ${application.application_type?.display_name}`}
			icon="file-text"
			headerColor="#820000"
			fullScreen={true}
		>
			<div className="space-y-8">
				{/* Status */}
				<div className="flex items-center gap-4">
					<span 
						className="px-3 py-1 rounded-full text-sm font-medium"
						style={{ 
							backgroundColor: getStatusColor(application.status) + '20',
							color: getStatusColor(application.status),
							border: `1px solid ${getStatusColor(application.status)}40`
						}}
					>
						{application.status?.display_name}
					</span>
				</div>

				{/* Info Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<InfoItem 
							icon="user" 
							label="Заявитель" 
							value={application.applicant?.full_name} 
						/>
						<InfoItem 
							icon="file-text" 
							label="Тип заявки" 
							value={application.application_type?.display_name} 
						/>
						<InfoItem 
							icon="calendar-days" 
							label="Создано" 
							value={formatDate(application.created_at)} 
						/>
					</div>
					<div className="space-y-4">
						{application.current_assignee && (
							<InfoItem 
								icon="user-circle" 
								label="Исполнитель" 
								value={application.current_assignee.full_name} 
							/>
						)}
						{application.assigned_departments?.length > 0 && (
							<InfoItem 
								icon="building" 
								label="Подразделения" 
								value={application.assigned_departments.map(d => d.name).join(', ')} 
							/>
						)}
						{application.updated_at !== application.created_at && (
							<InfoItem 
								icon="clock" 
								label="Обновлено" 
								value={formatDate(application.updated_at)} 
							/>
						)}
					</div>
				</div>

				{/* Description */}
				{application.description && (
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
							<Icon name="info" size={16} />
							Описание
						</h3>
						<p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
							{application.description}
						</p>
					</div>
				)}

				{/* Form Data */}
				{Object.keys(formData).length > 0 && (
					<div className="bg-blue-50 rounded-lg p-4">
						<h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
							<Icon name="clipboard-list" size={16} />
							Данные формы
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.entries(formData).map(([key, value]) => (
								<div key={key} className="bg-white rounded p-3 border border-blue-100">
									<dt className="text-sm font-medium text-blue-700 mb-1">
										{getFieldDisplayName(key)}
									</dt>
									<dd className="text-gray-900">
										{Array.isArray(value) ? value.join(', ') : String(value)}
									</dd>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Attached Files */}
				{application.files && application.files.length > 0 && (
					<div className="bg-purple-50 rounded-lg p-4">
						<h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
							<Icon name="folder" size={16} />
							Прикрепленные файлы ({application.files.length})
						</h3>
						<div className="space-y-3">
							{application.files.map((file) => (
								<div key={file.id} className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
												<Icon name="file-text" size={20} className="text-purple-600" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-gray-900 truncate">
													{file.filename}
												</p>
												<div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
													{file.file_size && (
														<span>{formatFileSize(file.file_size)}</span>
													)}
													{file.content_type && (
														<span>{file.content_type}</span>
													)}
													{file.uploaded_at && (
														<span>Загружен {formatDate(file.uploaded_at)}</span>
													)}
												</div>
											</div>
										</div>
										<button
											onClick={() => handleDownloadFile(file.id, file.filename)}
											className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
										>
											<Icon name="eye" size={16} />
											Скачать
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Comments */}
				{application.comments && application.comments.length > 0 && (
					<div className="bg-green-50 rounded-lg p-4">
						<h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
							<Icon name="mail" size={16} />
							Комментарии ({application.comments.length})
						</h3>
						<div className="space-y-3">
							{application.comments.map((comment, index) => (
								<div key={comment.id || index} 
									className="bg-white rounded-lg p-4 border border-green-100 shadow-sm">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
												<span className="text-green-700 text-sm font-medium">
													{comment.author?.full_name?.charAt(0) || 'А'}
												</span>
											</div>
											<div>
												<p className="font-medium text-gray-900">
													{comment.author?.full_name || 'Администратор'}
												</p>
												<p className="text-xs text-gray-500">
													{formatDate(comment.created_at)}
												</p>
											</div>
										</div>
									</div>
									<p className="text-gray-700 whitespace-pre-wrap">
										{comment.content}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Actions */}
				{canPerformActions && (
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Icon name="zap" size={16} />
							Действия
						</h3>
						<div className="space-y-4">
							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Комментарий (обязателен для отклонения)"
								rows={3}
								className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
							/>
							<div className="flex gap-3 flex-wrap">
								<button
									onClick={() => handleAction('approve')}
									disabled={loading}
									className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
								>
									<Icon name="check" size={16} />
									{loading ? 'Обработка...' : 'Одобрить'}
								</button>
								<button
									onClick={() => handleAction('reject')}
									disabled={loading}
									className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
								>
									<Icon name="x" size={16} />
									{loading ? 'Обработка...' : 'Отклонить'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</LargeModal>
	)
}

// Helper component for info items
const InfoItem = ({ icon, label, value }) => (
	<div className="flex items-start gap-3">
		<div className="w-5 h-5 text-gray-400 mt-0.5">
			<Icon name={icon} size={20} />
		</div>
		<div className="flex-1 min-w-0">
			<dt className="text-sm font-medium text-gray-600">{label}</dt>
			<dd className="text-base text-gray-900 break-words">{value || '—'}</dd>
		</div>
	</div>
)

export default ApplicationsNew 