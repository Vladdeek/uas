import React, { useEffect, useState } from 'react'
import API from '../../api/api'
import { toast } from 'react-toastify'

// Импортируем наши общие компоненты
import {
	PageHeader,
	TabContainer,
	Section,
	StatsGrid,
	LoadingState,
	EmptyState,
	FormModal,
	DetailModal,
	FormFieldRenderer,
	FormButton,
	ActionCard,
	BaseCard,
	LargeModal,
	Icon,
	ApplicationCard,
	Loader
} from '../../components/common'

const Applications = () => {
	const [loading, setLoading] = useState(true)
	const [appsLoading, setAppsLoading] = useState(false)
	const [apps, setApps] = useState([])
	const [types, setTypes] = useState([])
	const [statuses, setStatuses] = useState([])
	const [users, setUsers] = useState([])
	const [currentUser, setCurrentUser] = useState(null)

	const [activeTab, setActiveTab] = useState('my-applications')
	const [selected, setSelected] = useState(null)
	const [showDetail, setShowDetail] = useState(false)
	const [form, setForm] = useState({})
	const [uploadedFiles, setUploadedFiles] = useState([])
	const [uploadingFiles, setUploadingFiles] = useState({})
	const [filter, setFilter] = useState({
		status: '',
		type: '',
		assignee_view: false
	})

	const stats = {
		total: apps.length,
		pending: apps.filter(app => app.status?.name === 'pending').length,
		inReview: apps.filter(app => app.status?.name === 'in_review').length,
		approved: apps.filter(app => app.status?.name === 'approved').length,
		rejected: apps.filter(app => app.status?.name === 'rejected').length,
		completed: apps.filter(app => app.status?.is_final).length
	}

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		if (!loading && (activeTab === 'my-applications' || activeTab === 'for-approval')) {
			loadAppsWithLoading()
		}
	}, [activeTab])

	const loadData = async () => {
		try {
			setLoading(true)
			
			const user = API.getCurrentUser()
			setCurrentUser(user)
			
			const requests = [
				API.getApplicationTypes(),
				API.getApplicationStatuses()
			]
			
			const isAdmin = user?.roles?.includes('Админ') || false
			if (isAdmin) {
				requests.push(API.getUsers())
			}
			
			const results = await Promise.all(requests)
			
			const types = results[0] || [];
			console.log('Loaded application types:', types);
			
			setTypes(types)
			setStatuses(results[1] || [])
			setUsers(isAdmin ? (results[2] || []) : [])
			
			await loadApps()
			
		} catch (error) {
			toast.error('Ошибка загрузки данных')
		} finally {
			setTimeout(() => setLoading(false), 800)
		}
	}

	const loadApps = async () => {
		try {
			const params = activeTab === 'for-approval' ? { assignee_view: true } : {}
			const data = await API.getApplications(params)
			setApps(data || [])
		} catch (error) {
			setApps([])
		}
	}

	const loadAppsWithLoading = async () => {
		try {
			setAppsLoading(true)
			await loadApps()
		} catch (error) {
			// ignore
		} finally {
			setTimeout(() => setAppsLoading(false), 300)
		}
	}

	const generateTitle = (typeName, formData) => {
		const date = new Date().toLocaleDateString('ru-RU')
		const keyFields = ['reason', 'purpose', 'subject', 'type']
		
		for (const key of keyFields) {
			if (formData[key]?.toString().trim()) {
				return `${typeName} - ${formData[key].toString().trim()} (${date})`
			}
		}
		
		return `${typeName} от ${date}`
	}

	const generateDescription = (typeDesc, formData) => {
		const parts = []
		
		if (typeDesc) parts.push(typeDesc)
		
		const fields = ['reason', 'purpose', 'description', 'details']
		for (const field of fields) {
			if (formData[field]?.toString().trim()) {
				parts.push(`${field}: ${formData[field].toString().trim()}`)
			}
		}
		
		return parts.join('\n\n')
	}

	const handleFormSubmit = async () => {
		if (!selected) {
			toast.error('Выберите тип заявки')
			return
		}

		const template = selected.form_template ? JSON.parse(selected.form_template) : null
		const required = template?.fields?.filter(field => field.required) || []
		
		for (const field of required) {
			if (!form[field.name]?.toString().trim()) {
				toast.error(`Поле "${field.label}" обязательно`)
				return
			}
		}

		try {
			setLoading(true)
			
			const title = generateTitle(selected.display_name, form)
			const description = generateDescription(selected.description, form)
			
			// Собираем ID всех загруженных файлов
			const fileAttachments = []
			Object.values(form).forEach(value => {
				if (Array.isArray(value)) {
					value.forEach(item => {
						if (item && item.id && typeof item.id === 'number') {
							fileAttachments.push(item.id)
						}
					})
				}
			})
			
			const data = {
				title,
				description,
				type_id: selected.id,
				form_data: JSON.stringify(form),
				priority: 'normal',
				file_attachments: fileAttachments.length > 0 ? fileAttachments : undefined
			}

			// Создаем заявку
			const createdApplication = await API.createApplication(data)
			console.log('Заявка создана:', createdApplication)
			
			// Автоматически подаем заявку для активации роутинга
			console.log('Подаем заявку автоматически...')
			await API.performApplicationAction(createdApplication.id, { action: 'submit' })
			console.log('Заявка подана успешно')
			
			toast.success('Заявка создана и подана')
			
			setForm({})
			setSelected(null)
			setUploadedFiles([])
			setUploadingFiles({})
			setActiveTab('my-applications')
			await loadApps()
			
		} catch (error) {
			console.error('Ошибка создания/подачи заявки:', error)
			toast.error('Ошибка создания заявки: ' + (error.message || 'Неизвестная ошибка'))
		} finally {
			setLoading(false)
		}
	}

	const handleAction = async (app, action, comment = '') => {
		try {
			await API.performApplicationAction(app.id, {
				action: action,
				comment: comment
			})
			toast.success('Действие выполнено')
			loadApps()
		} catch (error) {
			toast.error('Ошибка выполнения действия')
		}
	}

	const handleViewDetails = (app) => {
		setSelected(app)
		setShowDetail(true)
	}

	const getStatusColor = (status) => {
		const colors = {
			'pending': 'bg-amber-100 text-amber-800 border-amber-200',
			'in_review': 'bg-blue-100 text-blue-800 border-blue-200',
			'approved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
			'rejected': 'bg-red-100 text-red-800 border-red-200',
			'completed': 'bg-slate-100 text-slate-800 border-slate-200'
		}
		return colors[status?.name] || 'bg-slate-100 text-slate-800 border-slate-200'
	}

	const handleFieldChange = (fieldName, value) => {
		setForm(prev => ({
			...prev,
			[fieldName]: value
		}))
	}

	const handleFileUpload = async (fieldName, file) => {
		try {
			setUploadingFiles(prev => ({ ...prev, [fieldName]: true }))
			
			const response = await API.uploadFile(file)
			
			setUploadedFiles(prev => [...prev, response])
			
			const currentFiles = form[fieldName] || []
			const newFiles = [...currentFiles, response]
			
			setForm(prev => ({
				...prev,
				[fieldName]: newFiles
			}))
			
			toast.success('Файл успешно загружен')
		} catch (error) {
			toast.error('Ошибка загрузки файла: ' + error.message)
		} finally {
			setUploadingFiles(prev => ({ ...prev, [fieldName]: false }))
		}
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
			await API.downloadFile(fileId)
		} catch (error) {
			toast.error(error.message || 'Ошибка при скачивании файла')
		}
	}

	const renderTabContent = () => {
		if (loading && activeTab !== 'create') {
			return (
				<div className='h-screen w-full flex items-center justify-center'>
					<Loader />
				</div>
			)
		}

		if (activeTab === 'create') {
			return renderCreateTab()
		}
		
		if (activeTab === 'my-applications' || activeTab === 'for-approval') {
			return renderApplicationsList()
		}
		
		return null
	}

	const renderCreateTab = () => {
		return (
			<div className="max-w-4xl mx-auto">
				{!selected ? (
					<div>
						<div className="mb-6">
							<h2 className="text-lg font-semibold text-slate-900 mb-2">Выберите тип заявки</h2>
							<p className="text-slate-600">Выберите подходящий тип заявки для подачи</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{types.map(type => (
								<ActionCard
									key={type.id}
									icon="file-text"
									title={type.display_name}
									description={type.description}
									className="cursor-pointer hover:shadow-lg transition-all duration-200"
									style={{'--hover-shadow': '0 10px 25px rgba(119, 0, 2, 0.1)'}}
									onClick={() => setSelected(type)}
								/>
							))}
						</div>
					</div>
				) : (
					<div>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center">
								<div 
									className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
									style={{backgroundColor: '#77000220'}}
								>
									<Icon name="file-text" size={20} style={{color: '#770002'}} />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-slate-900">{selected.display_name}</h2>
									<p className="text-sm text-slate-600">Заполните форму заявки</p>
								</div>
							</div>
							<button
								onClick={() => setSelected(null)}
								className="text-slate-500 hover:text-slate-700 transition-colors"
							>
								<Icon name="x" size={20} />
							</button>
						</div>

						{/* Файлы для ознакомления */}
						{selected.attachments && selected.attachments.length > 0 && (
							<div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
								<h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
									<Icon name="folder" size={16} />
									Файлы для ознакомления ({selected.attachments.length})
								</h4>
								<div className="space-y-2">
									{selected.attachments.map((file) => (
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

						{selected.form_template && (
							<div className="space-y-4 mb-6">
								{(() => {
									try {
										const template = JSON.parse(selected.form_template);
										const fields = template.fields || [];
										
										if (!fields.length) {
											return (
												<div className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
													<div className="flex items-center">
														<Icon name="alert-triangle" size={16} className="mr-2" />
														Для этого типа заявки не настроены поля формы
													</div>
												</div>
											);
										}
										
																			return fields.map((field, i) => {
										// Для файловых полей добавляем дополнительные свойства
										if (field.type === 'file') {
											const fieldWithUpload = {
												...field,
												onUpload: (file) => handleFileUpload(field.name, file),
												uploading: uploadingFiles[field.name] || false
											}
											return (
												<FormFieldRenderer
													key={i}
													field={fieldWithUpload}
													value={form[field.name] || []}
													onChange={handleFieldChange}
												/>
											)
										}
										
										return (
											<FormFieldRenderer
												key={i}
												field={field}
												value={form[field.name] || ''}
												onChange={handleFieldChange}
											/>
										)
									});
									} catch (error) {
										return (
											<div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
												<div className="flex items-center">
													<Icon name="alert-triangle" size={16} className="mr-2" />
													Ошибка загрузки формы заявки
												</div>
											</div>
										);
									}
								})()}
							</div>
						)}

						<div className="flex gap-3 pt-4 border-t border-slate-200">
							<FormButton
								onClick={handleFormSubmit}
								variant="primary"
								icon="check"
								loading={loading}
								style={{
									backgroundColor: loading ? '#aa0003' : '#770002',
									borderColor: '#770002'
								}}
								onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#550001')}
								onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#770002')}
							>
								Создать заявку
							</FormButton>
							<FormButton
								onClick={() => {
									setSelected(null)
									setForm({})
									setUploadedFiles([])
									setUploadingFiles({})
								}}
								variant="secondary"
							>
								Отмена
							</FormButton>
						</div>
					</div>
				)}
			</div>
		)
	}

	const renderApplicationsList = () => {
		return (
			<div>
				{/* Статистика - исправлена для ровного отображения */}
				<div className="mb-6">
					<StatsGrid 
						stats={[
							{ title: 'Всего', value: stats.total, icon: 'file-text', color: '#770002' },
							{ title: 'Ожидают', value: stats.pending, icon: 'clock', color: '#f59e0b' },
							{ title: 'В обработке', value: stats.inReview, icon: 'eye', color: '#3b82f6' },
							{ title: 'Одобрены', value: stats.approved, icon: 'check', color: '#10b981' },
							{ title: 'Отклонены', value: stats.rejected, icon: 'ban', color: '#ef4444' },
							{ title: 'Завершены', value: stats.completed, icon: 'check-circle', color: '#8b5cf6' }
						]}
						columns={6}
						className="grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
					/>
				</div>

				{/* Список заявок */}
				<Section 
					title={activeTab === 'my-applications' ? 'Мои заявки' : 'На утверждение'}
				>
					{appsLoading ? (
						<div className='h-64 w-full flex items-center justify-center'>
							<Loader />
						</div>
					) : apps.length === 0 ? (
						<EmptyState
							icon="clipboard-list"
							title="Нет заявок"
							description="Заявки отсутствуют"
						/>
					) : (
						<div className="space-y-4">
							{apps.map(app => (
								<ApplicationCard
									key={app.id}
									application={app}
									onViewDetails={handleViewDetails}
									onPerformAction={handleAction}
									getStatusColor={getStatusColor}
								/>
							))}
						</div>
					)}
				</Section>
			</div>
		)
	}

	return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto space-y-6">
				<PageHeader 
					title="Заявки"
					subtitle="Управление заявками и создание новых"
					icon="file-plus"
					iconColor="#770002"
				/>

				<TabContainer
					tabs={[
						{ 
							key: 'my-applications', 
							label: 'Мои заявки', 
							icon: 'file-text',
							description: 'Заявки, которые я подал'
						},
						{ 
							key: 'create', 
							label: 'Новая заявка', 
							icon: 'plus',
							description: 'Создать новую заявку'
						},
						{ 
							key: 'for-approval', 
							label: 'На утверждение', 
							icon: 'clipboard-check',
							description: 'Заявки на моё рассмотрение'
						}
					]}
					activeTab={activeTab}
					onTabChange={setActiveTab}
				>
					{renderTabContent()}
				</TabContainer>
			</div>

			{/* Модальные окна */}
			{showDetail && selected && (
				<ApplicationDetailModal
					application={selected}
					onClose={() => setShowDetail(false)}
					onPerformAction={handleAction}
				/>
			)}
		</div>
	)
}

const ApplicationDetailModal = ({ application, onClose, onPerformAction }) => {
	const [comment, setComment] = useState('')
	const [applyingToProfile, setApplyingToProfile] = useState(false)
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

	const getFormData = () => {
		try {
			return JSON.parse(application.form_data || '{}')
		} catch {
			return {}
		}
	}

	// Функция для получения отображаемого названия поля
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
			await onPerformAction(application, action, comment)
			setComment('')
			onClose()
		} finally {
			setLoading(false)
		}
	}

	const handleApplyToProfile = async () => {
		try {
			setApplyingToProfile(true)
			await API.applyApplicationToProfile(application.id)
			toast.success('Изменения успешно применены к профилю')
			onClose()
		} catch (error) {
			toast.error(error.message || 'Ошибка применения изменений к профилю')
		} finally {
			setApplyingToProfile(false)
		}
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
			await API.downloadFile(fileId)
		} catch (error) {
			toast.error(error.message || 'Ошибка при скачивании файла')
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

	const getPriorityColor = (priority) => {
		const colors = {
			'low': '#10b981',
			'normal': '#3b82f6',
			'high': '#f59e0b',
			'urgent': '#ef4444'
		}
		return colors[priority] || '#6b7280'
	}

	// Проверяем права доступа
	const currentUser = API.getCurrentUser()
	const isAdmin = currentUser?.roles?.includes('admin')
	const isAssignedExecutor = application.current_assignee_id === currentUser?.id
	const userDepartmentIds = currentUser?.departments?.map(d => d.id) || []
	const assignedDeptIds = application.assigned_departments?.map(d => d.id) || []
	const isInAssignedDepartment = userDepartmentIds.some(id => assignedDeptIds.includes(id))
	const canPerformActions = isAdmin || isAssignedExecutor || isInAssignedDepartment

	const formData = getFormData()

	const actions = canPerformActions ? (
		<div className="space-y-4">
			<div className="bg-gray-50 rounded-lg p-4">
				<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Icon name="zap" size={16} color="#820000" />
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
							<Icon name="check" size={16} color="white" />
							{loading ? 'Обработка...' : 'Одобрить'}
						</button>
						<button
							onClick={() => handleAction('reject')}
							disabled={loading}
							className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
						>
							<Icon name="x" size={16} color="white" />
							{loading ? 'Обработка...' : 'Отклонить'}
						</button>
						{application.application_type?.is_profile_update && (
							<button
								onClick={handleApplyToProfile}
								disabled={applyingToProfile}
								className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
							>
								<Icon name="user-pen" size={16} color="white" />
								{applyingToProfile ? 'Применение...' : 'Применить к профилю'}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	) : null

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
							<Icon name="info" size={16} color="#820000" />
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
							<Icon name="clipboard-list" size={16} color="#1e40af" />
							Данные формы
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.entries(formData)
								.filter(([key, value]) => {
									// Фильтруем поля файлов (которые являются объектами или массивами объектов)
									if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
										return false; // Исключаем объекты (файлы)
									}
									if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
										return false; // Исключаем массивы объектов (файлы)
									}
									return true;
								})
								.map(([key, value]) => (
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
							<Icon name="folder" size={16} color="#7c3aed" />
							Прикрепленные файлы ({application.files.length})
						</h3>
						<div className="space-y-3">
							{application.files.map((file) => (
								<div key={file.id} className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
												<Icon name="file-text" size={16} color="#7c3aed" />
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
											<Icon name="eye" size={16} color="#7c3aed" />
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
							<Icon name="mail" size={16} color="#14532d" />
							Комментарии ({application.comments.length})
						</h3>
						<div className="space-y-3">
							{application.comments
								.filter(comment => !comment.is_internal || isAdmin)
								.map((comment, index) => (
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
										{comment.is_internal && (
											<span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
												Служебный
											</span>
										)}
									</div>
									<p className="text-gray-700 whitespace-pre-wrap">
										{comment.content}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
			
			{actions && (
				<div className="pt-6 border-t border-gray-200">
					{actions}
				</div>
			)}
		</LargeModal>
	)
}

// Helper component for info items
const InfoItem = ({ icon, label, value }) => (
	<div className="flex items-start gap-3">
		<div className="w-5 h-5 text-gray-400 mt-0.5">
			<Icon name={icon} size={20} color="white" />
		</div>
		<div className="flex-1 min-w-0">
			<dt className="text-sm font-medium text-gray-600">{label}</dt>
			<dd className="text-base text-gray-900 break-words">{value || '—'}</dd>
		</div>
	</div>
)

export default Applications
