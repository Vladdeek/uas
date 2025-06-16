import React, { useEffect, useState } from 'react'
import ApiClient from '../../../api/api.js'
import { toast } from 'react-toastify'
import { Loader, Icon, LargeModal, TabContainer, AccessControlSettings, AccessControlDisplay, AdvancedRoutingBuilder, RoutingPreview } from '../../common'

const ApplicationsConstructor = () => {
	const [loading, setLoading] = useState(true)
	const [types, setTypes] = useState([])
	const [showCreate, setShowCreate] = useState(false)
	const [users, setUsers] = useState([])
	const [departments, setDepartments] = useState([])
	const [roles, setRoles] = useState([])
	const [editing, setEditing] = useState(null)
	
	// Состояние для файлов
	const [attachedFiles, setAttachedFiles] = useState([])
	const [uploadingFiles, setUploadingFiles] = useState(false)
	
	const [form, setForm] = useState({
		name: '',
		display_name: '',
		description: '',
		form_template: JSON.stringify({ fields: [{ name: 'reason', label: 'Причина', type: 'textarea', required: true }] }),
		access_control: JSON.stringify({ type: 'all', values: [] }),
		is_profile_update: false,
		profile_field_mapping: JSON.stringify({})
	})
	
	const [fields, setFields] = useState([{
			name: 'reason',
		label: 'Причина',
			type: 'textarea',
			required: true,
			options: []
	}])

	const [routes, setRoutes] = useState({ type: 'auto' })
	const [access, setAccess] = useState({ type: 'all', values: [] })

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			setLoading(true)
			
			const user = ApiClient.getCurrentUser()
			const isAdmin = user?.roles?.includes('Админ')
			
			const requests = [
				ApiClient.getApplicationTypes()
			]
			
			if (isAdmin) {
				requests.push(
					ApiClient.getUsers(),
					ApiClient.getDepartments(),
					ApiClient.getRoles()
				)
			}
			
			const results = await Promise.all(requests)
			
			setTypes(results[0] || [])
			
			if (isAdmin) {
				setUsers(results[1] || [])
				setDepartments(results[2] || [])
				setRoles(results[3] || [])
			}
			
		} catch (error) {
			toast.error('Ошибка загрузки данных')
		} finally {
			setTimeout(() => setLoading(false), 800)
		}
	}

	const handleCreate = async () => {
		try {
			if (!form.name || !form.display_name) {
				toast.error('Заполните обязательные поля')
				return
			}

			const template = { fields }
			
			const data = {
				name: form.name.trim(),
				display_name: form.display_name.trim(),
				description: form.description?.trim() || '',
				form_template: JSON.stringify(template),
				option_routes: JSON.stringify(routes || { type: 'auto' }),
				access_control: JSON.stringify(access),
				is_profile_update: form.is_profile_update,
				profile_field_mapping: form.profile_field_mapping,
				// Поля роутинга
				default_routing: form.default_routing || '{}',
				default_assignee_id: form.default_assignee_id ? parseInt(form.default_assignee_id) : null,
				default_role_name: form.default_role_name || null,
				default_department_id: form.default_department_id ? parseInt(form.default_department_id) : null,
				// Прикрепленные файлы
				file_attachments: attachedFiles.map(file => file.id)
			}

			if (editing) {
				await ApiClient.updateApplicationType(editing.id, data)
				toast.success('Тип заявки обновлен')
			} else {
				await ApiClient.createApplicationType(data)
				toast.success('Тип заявки создан')
			}
			
			resetForm()
			setShowCreate(false)
			loadData()
		} catch (error) {
			// Показываем конкретное сообщение об ошибке от сервера
			const errorMessage = error.message || 'Ошибка сохранения'
			toast.error(errorMessage)
		}
	}

	const handleEdit = (type) => {
		setEditing(type)
		setForm({
				name: type.name,
				display_name: type.display_name,
				description: type.description || '',
			form_template: type.form_template || JSON.stringify({ fields: [] }),
			access_control: type.access_control || JSON.stringify({ type: 'all', values: [] }),
			is_profile_update: type.is_profile_update || false,
			profile_field_mapping: type.profile_field_mapping || JSON.stringify({}),
			// Поля роутинга
			option_routes: type.option_routes || '{}',
			default_routing: type.default_routing || '{}',
			default_assignee_id: type.default_assignee_id || '',
			default_role_name: type.default_role_name || '',
			default_department_id: type.default_department_id || '',
			routing_type: type.default_assignee_id ? 'user' 
						: type.default_role_name ? 'role'
						: type.default_department_id ? 'department'
						: 'auto'
		})
		
		try {
			const template = JSON.parse(type.form_template || '{"fields":[]}')
			setFields(template.fields || [])
		} catch {
			setFields([])
		}
		
		try {
			setRoutes(JSON.parse(type.option_routes || '{"type":"auto"}'))
		} catch {
			setRoutes({ type: 'auto' })
		}
		
		try {
			setAccess(JSON.parse(type.access_control || '{"type":"all","values":[]}'))
		} catch {
			setAccess({ type: 'all', values: [] })
		}

		// Загружаем прикрепленные файлы
		setAttachedFiles(type.attachments || [])
		
		setShowCreate(true)
	}

	const handleDelete = async (type) => {
		if (!confirm(`Удалить тип "${type.display_name}"?`)) return

		try {
			await ApiClient.deleteApplicationType(type.id)
			toast.success('Тип удален')
			loadData()
		} catch (error) {
			// Показываем конкретное сообщение об ошибке от сервера
			const errorMessage = error.message || 'Ошибка удаления'
			toast.error(errorMessage)
		}
	}

	const resetForm = () => {
		setForm({
			name: '',
			display_name: '',
			description: '',
			form_template: JSON.stringify({ fields: [{ name: 'reason', label: 'Причина', type: 'textarea', required: true }] }),
			access_control: JSON.stringify({ type: 'all', values: [] }),
			is_profile_update: false,
			profile_field_mapping: JSON.stringify({}),
			// Поля роутинга
			option_routes: '{}',
			default_routing: '{}',
			default_assignee_id: '',
			default_role_name: '',
			default_department_id: '',
			routing_type: 'auto'
		})
		setFields([{ name: 'reason', label: 'Причина', type: 'textarea', required: true, options: [] }])
		setRoutes({ type: 'auto' })
		setAccess({ type: 'all', values: [] })
		setAttachedFiles([])
		setUploadingFiles(false)
		setEditing(null)
	}

	// Функции для работы с файлами
	const handleFileUpload = async (files) => {
		if (!files || files.length === 0) return
		
		setUploadingFiles(true)
		try {
			const uploadPromises = Array.from(files).map(file => ApiClient.uploadFile(file))
			const results = await Promise.all(uploadPromises)
			
			setAttachedFiles(prev => [...prev, ...results])
			toast.success(`Загружено файлов: ${results.length}`)
		} catch (error) {
			toast.error('Ошибка загрузки файлов')
		} finally {
			setUploadingFiles(false)
		}
	}

	const handleRemoveFile = (fileId) => {
		setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
	}

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const addField = () => {
		setFields([...fields, {
			name: `field_${fields.length + 1}`,
			label: 'Новое поле',
			type: 'text',
			required: false,
			options: []
		}])
	}

	const updateField = (index, key, value) => {
		const updated = [...fields]
		updated[index] = { ...updated[index], [key]: value }
		setFields(updated)
	}

	const removeField = (index) => {
		setFields(fields.filter((_, i) => i !== index))
	}

	const addOption = (fieldIndex) => {
		const updated = [...fields]
		if (!updated[fieldIndex].options) updated[fieldIndex].options = []
		updated[fieldIndex].options.push('')
		setFields(updated)
	}

	const updateOption = (fieldIndex, optionIndex, value) => {
		const updated = [...fields]
		updated[fieldIndex].options[optionIndex] = value
		setFields(updated)
	}

	const removeOption = (fieldIndex, optionIndex) => {
		const updated = [...fields]
		updated[fieldIndex].options.splice(optionIndex, 1)
		setFields(updated)
	}

		return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Заголовок */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<div className="flex items-center">
						<div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{backgroundColor: '#77000220'}}>
							<Icon name="git-fork" size={24} style={{color: '#770002'}} />
			</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-900">Конструктор заявок</h1>
							<p className="text-slate-600">Управление типами заявок и роутингом</p>
				</div>
						</div>
					</div>

				{loading ? (
					<Loader text="Загрузка данных..." />
				) : (
					<div className="space-y-6">
						{/* Контент */}
							<TypesTab
							types={types} 
							users={users}
							roles={roles}
							departments={departments}
							onEdit={handleEdit} 
							onDelete={handleDelete}
							onCreate={() => {
								resetForm()
								setShowCreate(true)
							}}
						/>
					</div>
				)}
			</div>

						{/* Модальные окна */}
			<CreateModal
				isOpen={showCreate}
				form={form}
				setForm={setForm}
				fields={fields}
				setFields={setFields}
				routes={routes}
				setRoutes={setRoutes}
				access={access}
				setAccess={setAccess}
				editing={editing}
				users={users}
				departments={departments}
				roles={roles}
				onSave={handleCreate}
				onClose={() => {
					setShowCreate(false)
					resetForm()
				}}
				addField={addField}
				updateField={updateField}
				removeField={removeField}
				addOption={addOption}
				updateOption={updateOption}
				removeOption={removeOption}
				// Файлы
				attachedFiles={attachedFiles}
				onFileUpload={handleFileUpload}
				onRemoveFile={handleRemoveFile}
				uploadingFiles={uploadingFiles}
				formatFileSize={formatFileSize}
			/>
		</div>
	)
}

const TypesTab = ({ types, users, roles, departments, onEdit, onDelete, onCreate }) => {
	const getFieldsCount = (template) => {
		try {
			const parsed = JSON.parse(template || '{"fields":[]}')
			return parsed.fields ? parsed.fields.length : 0
		} catch {
			return 0
		}
	}

	const getAccessText = (accessControl) => {
		try {
			const control = JSON.parse(accessControl || '{}')
			switch (control.type) {
				case 'all': return 'Все пользователи'
				case 'roles': return `Роли: ${control.values?.join(', ')}`
				case 'departments': return 'Определенные подразделения'
				case 'users': return 'Определенные пользователи'
				default: return 'Не указано'
			}
		} catch {
			return 'Ошибка конфигурации'
		}
	}

	const getRoutingText = (type) => {
		if (type.default_assignee_id && type.default_assignee) {
			return `Пользователь: ${type.default_assignee.username}`
		}
		if (type.default_role_name) {
			return `Роль: ${type.default_role_name}`
		}
		if (type.default_department_id && type.default_department) {
			return `Подразделение: ${type.default_department.name}`
		}
		if (type.default_routing && type.default_routing !== '{}') {
			return 'Расширенный роутинг'
		}
		if (type.option_routes && type.option_routes !== '{}') {
			return 'Условный роутинг'
		}
		return 'Автоматически'
	}

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-200">
			<div className="p-6 border-b border-slate-200 flex justify-between items-center">
				<h2 className="text-lg font-semibold text-slate-900">Типы заявок</h2>
				<button
					onClick={onCreate}
					className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
					style={{backgroundColor: '#770002'}}
					onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
					onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
				>
					<Icon name="plus" size={16} style={{color: 'white', marginRight: '4px'}} />
					Создать тип
				</button>
			</div>
			<div className="p-6">
				{types.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Icon name="file-text" size={32} className="text-slate-400" />
					</div>
						<h3 className="text-lg font-medium text-slate-900 mb-2">Нет типов заявок</h3>
						<p className="text-slate-500 mb-4">Создайте первый тип заявки</p>
						<button
							onClick={onCreate}
							className="text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
							style={{backgroundColor: '#770002'}}
							onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
							onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
						>
							<Icon name="plus" size={16} style={{color: 'white', marginRight: '4px'}} />
							Создать тип заявки
						</button>
				</div>
			) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{types.map(type => (
							<div key={type.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-start">
										<div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#77000220'}}>
											<Icon name="file-text" size={20} style={{color: '#770002'}} />
							</div>
										<div className="flex-1">
											<h3 className="text-lg font-medium text-slate-900">{type.display_name}</h3>
											{type.description && (
												<p className="text-slate-600 mt-1 text-sm">{type.description}</p>
											)}
							</div>
									</div>
									<div className="flex gap-2">
									<button
											onClick={() => onEdit(type)}
											className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
											title="Редактировать"
									>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
												<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
											</svg>
									</button>
									<button
											onClick={() => onDelete(type)}
											className="p-2 text-slate-400 hover:text-red-600 transition-colors"
											title="Удалить"
										>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<polyline points="3,6 5,6 21,6"/>
												<path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
												<line x1="10" y1="11" x2="10" y2="17"/>
												<line x1="14" y1="11" x2="14" y2="17"/>
											</svg>
									</button>
								</div>
							</div>

								<div className="mb-4 p-4 rounded-lg" style={{backgroundColor: '#77000220'}}>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium" style={{color: '#770002'}}>Полей в форме</span>
										<span className="text-2xl font-bold" style={{color: '#770002'}}>{getFieldsCount(type.form_template)}</span>
			</div>
						</div>
						
								<div className="mb-4">
									<div className="flex items-center gap-2 mb-2">
										<Icon name="shield-user" size={16} className="text-slate-400" />
										<span className="text-xs font-medium text-slate-500">Доступ:</span>
						</div>
									<AccessControlDisplay 
										value={type.access_control ? JSON.parse(type.access_control) : { type: 'all', values: [] }}
										users={users}
										roles={roles}
										departments={departments}
									/>
					</div>

								<div className="mb-4">
									<div className="flex items-center gap-2 mb-2">
										<Icon name="git-fork" size={16} className="text-slate-400" />
										<span className="text-xs font-medium text-slate-500">Роутинг:</span>
									</div>
									<p className="text-sm text-slate-700">{getRoutingText(type)}</p>
								</div>

								<div className="mb-4">
									<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
										type.is_active 
											? 'bg-emerald-100 text-emerald-800' 
											: 'bg-red-100 text-red-800'
									}`}>
										<Icon 
											name={type.is_active ? 'check' : 'ban'} 
											size={12} 
											className="mr-1" 
										/>
										{type.is_active ? 'Активен' : 'Неактивен'}
									</span>
							</div>
						</div>
					))}
				</div>
			)}
			</div>
		</div>
	)
}

const CreateModal = ({ 
	isOpen, form, setForm, fields, setFields, routes, setRoutes, access, setAccess,
	editing, users, departments, roles, onSave, onClose,
	addField, updateField, removeField, addOption, updateOption, removeOption,
	// Файлы
	attachedFiles, onFileUpload, onRemoveFile, uploadingFiles, formatFileSize
}) => {
	const [activeTab, setActiveTab] = useState('basic')
	const [submitting, setSubmitting] = useState(false)

	const fieldTypes = [
		{ value: 'text', label: 'Текст' },
		{ value: 'textarea', label: 'Многострочный текст' },
		{ value: 'email', label: 'Email' },
		{ value: 'tel', label: 'Телефон' },
		{ value: 'number', label: 'Число' },
		{ value: 'date', label: 'Дата' },
		{ value: 'select', label: 'Выпадающий список' },
		{ value: 'radio', label: 'Переключатель' },
		{ value: 'checkbox', label: 'Флажки' },
		{ value: 'file', label: 'Файл' }
	]

	const handleSubmit = async (e) => {
		e.preventDefault()
		setSubmitting(true)
		try {
			await onSave()
		} finally {
			setSubmitting(false)
		}
	}

	const focusHandler = (e) => {
		e.target.style.borderColor = '#770002'
		e.target.style.boxShadow = '0 0 0 3px rgba(119, 0, 2, 0.1)'
	}

	const blurHandler = (e) => {
		e.target.style.borderColor = '#cbd5e1'
		e.target.style.boxShadow = 'none'
	}

	const inputStyles = {
		width: '100%',
		padding: '8px 12px',
		border: '1px solid #cbd5e1',
		borderRadius: '8px',
		outline: 'none',
		transition: 'all 0.2s'
	}

	const tabs = [
		{ key: 'basic', label: 'Основное', icon: 'info' },
		{ key: 'form', label: 'Форма', icon: 'file-text' },
		{ key: 'files', label: 'Файлы', icon: 'folder' },
		{ key: 'profile', label: 'Профиль', icon: 'user-circle' },
		{ key: 'routing', label: 'Роутинг', icon: 'git-fork' },
		{ key: 'access', label: 'Доступ', icon: 'shield-user' }
	]

	const renderTabContent = () => {
		switch (activeTab) {
			case 'basic':
				return (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Название <span style={{color: '#770002'}}>*</span>
							</label>
							<input
								type="text"
								value={form.name || ''}
								onChange={(e) => setForm({...form, name: e.target.value})}
								style={inputStyles}
								onFocus={focusHandler}
								onBlur={blurHandler}
								placeholder="Техническое название"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Отображаемое название <span style={{color: '#770002'}}>*</span>
							</label>
							<input
								type="text"
								value={form.display_name || ''}
								onChange={(e) => setForm({...form, display_name: e.target.value})}
								style={inputStyles}
								onFocus={focusHandler}
								onBlur={blurHandler}
								placeholder="Название для пользователей"
								required
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								Описание
							</label>
							<textarea
								value={form.description || ''}
								onChange={(e) => setForm({...form, description: e.target.value})}
								rows={3}
								style={inputStyles}
								onFocus={focusHandler}
								onBlur={blurHandler}
								placeholder="Описание типа заявки"
							/>
						</div>
					</div>
				)

			case 'form':
				return (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium text-slate-900">Поля формы</h3>
							<button
								type="button"
								onClick={addField}
								className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
								style={{backgroundColor: '#770002'}}
								onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
								onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
							>
								<Icon name="plus" size={16} style={{color: 'white', marginRight: '4px'}} />
								Добавить поле
							</button>
						</div>
						
						{fields.length === 0 ? (
							<div className="text-center py-8 bg-slate-50 rounded-lg">
								<Icon name="file-text" size={32} className="text-slate-400 mx-auto mb-2" />
								<p className="text-slate-500">Добавьте первое поле формы</p>
							</div>
						) : (
							<div className="space-y-4">
								{fields.map((field, index) => renderField(field, index))}
							</div>
						)}
					</div>
				)

			case 'files':
				return (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<h3 className="text-lg font-medium text-slate-900">Файлы для ознакомления</h3>
								<p className="text-sm text-slate-600">Файлы, которые будут показаны пользователям при заполнении заявки</p>
							</div>
							<label className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
								style={{backgroundColor: uploadingFiles ? '#999' : '#770002'}}
								onMouseEnter={(e) => !uploadingFiles && (e.target.style.backgroundColor = '#550001')}
								onMouseLeave={(e) => !uploadingFiles && (e.target.style.backgroundColor = '#770002')}
							>
								<Icon name={uploadingFiles ? "clock" : "plus"} size={16} style={{color: 'white', marginRight: '4px'}} />
								{uploadingFiles ? 'Загружается...' : 'Добавить файлы'}
								<input
									type="file"
									multiple
									className="hidden"
									onChange={(e) => onFileUpload(e.target.files)}
									disabled={uploadingFiles}
								/>
							</label>
						</div>
						
						{attachedFiles.length === 0 ? (
							<div className="text-center py-8 bg-slate-50 rounded-lg">
								<Icon name="folder-open" size={32} className="text-slate-400 mx-auto mb-2" />
								<p className="text-slate-500">Добавьте файлы для ознакомления</p>
								<p className="text-xs text-slate-400 mt-1">Эти файлы будут видны пользователям при создании заявки</p>
							</div>
						) : (
							<div className="space-y-3">
								{attachedFiles.map((file) => (
									<div key={file.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
												<Icon name="file-text" size={20} style={{color: '#770002'}} />
											</div>
											<div>
												<p className="font-medium text-slate-900 truncate max-w-xs" title={file.filename}>
													{file.filename}
												</p>
												<p className="text-sm text-slate-500">
													{formatFileSize(file.file_size)} • {file.content_type}
												</p>
											</div>
										</div>
										<button
											type="button"
											onClick={() => onRemoveFile(file.id)}
											className="text-red-500 hover:text-red-700 transition-colors p-2"
											title="Удалить файл"
										>
											<Icon name="trash-2" size={16} />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)

			case 'profile':
				return (
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-slate-900">Настройка обновления профиля</h3>
						
						<div>
							<label className="flex items-center gap-2 text-sm text-slate-700">
								<input
									type="checkbox"
									checked={form.is_profile_update || false}
									onChange={(e) => setForm({...form, is_profile_update: e.target.checked})}
									style={{accentColor: '#770002'}}
								/>
								Заявки этого типа обновляют профиль пользователя
							</label>
							<p className="text-xs text-slate-500 mt-1">
								При одобрении заявки данные из формы автоматически применятся к профилю заявителя
							</p>
						</div>

						{form.is_profile_update && (
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Маппинг полей формы на поля профиля
								</label>
								<textarea
									value={form.profile_field_mapping || '{}'}
									onChange={(e) => setForm({...form, profile_field_mapping: e.target.value})}
									rows={8}
									style={inputStyles}
									onFocus={focusHandler}
									onBlur={blurHandler}
									placeholder='{"form_field": "profile_field"}'
								/>
							</div>
						)}
					</div>
				)

			case 'routing':
				return (
					<div className="space-y-6">
						<AdvancedRoutingSection
							form={form}
							setForm={setForm}
							fields={fields}
							users={users}
							roles={roles}
							departments={departments}
							inputStyles={inputStyles}
							focusHandler={focusHandler}
							blurHandler={blurHandler}
						/>
						<ConditionalRoutingSection
							fields={fields}
							routes={routes}
							setRoutes={setRoutes}
							users={users}
							roles={roles}
							departments={departments}
							inputStyles={inputStyles}
							focusHandler={focusHandler}
							blurHandler={blurHandler}
						/>
					</div>
				)

			case 'access':
				return (
					<AccessControlSection
						access={access}
						setAccess={setAccess}
						users={users}
						roles={roles}
						departments={departments}
						inputStyles={inputStyles}
						focusHandler={focusHandler}
						blurHandler={blurHandler}
					/>
				)

			default:
				return null
		}
	}

	const renderField = (field, index) => {
		return (
			<div key={index} className="bg-slate-50 rounded-lg p-4 space-y-3">
				<div className="flex justify-between items-center">
					<h4 className="font-medium text-slate-900">Поле {index + 1}</h4>
				<button
						type="button"
						onClick={() => removeField(index)}
						className="text-red-500 hover:text-red-700 transition-colors"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="3,6 5,6 21,6"/>
							<path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
							<line x1="10" y1="11" x2="10" y2="17"/>
							<line x1="14" y1="11" x2="14" y2="17"/>
					</svg>
				</button>
			</div>

				<div className="grid grid-cols-2 gap-3">
				<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
					<input
						type="text"
							value={field.name || ''}
							onChange={(e) => updateField(index, 'name', e.target.value)}
							style={inputStyles}
							onFocus={focusHandler}
							onBlur={blurHandler}
						placeholder="field_name"
					/>
				</div>
				<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Подпись</label>
					<input
						type="text"
							value={field.label || ''}
							onChange={(e) => updateField(index, 'label', e.target.value)}
							style={inputStyles}
							onFocus={focusHandler}
							onBlur={blurHandler}
							placeholder="Подпись поля"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
				<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
					<select
							value={field.type || 'text'}
							onChange={(e) => updateField(index, 'type', e.target.value)}
							style={inputStyles}
							onFocus={focusHandler}
							onBlur={blurHandler}
						>
							{fieldTypes.map(type => (
								<option key={type.value} value={type.value}>
									{type.label}
							</option>
						))}
					</select>
				</div>
				<div className="flex items-center">
						<label className="flex items-center gap-2 text-sm text-slate-700">
					<input
						type="checkbox"
								checked={field.required || false}
								onChange={(e) => updateField(index, 'required', e.target.checked)}
								style={{accentColor: '#770002'}}
							/>
						Обязательное поле
					</label>
				</div>
			</div>

				{(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">Варианты</label>
					<div className="space-y-2">
							{(field.options || []).map((option, optionIndex) => (
								<div key={optionIndex} className="flex gap-2">
								<input
									type="text"
									value={option}
										onChange={(e) => updateOption(index, optionIndex, e.target.value)}
										style={{...inputStyles, flex: 1}}
										onFocus={focusHandler}
										onBlur={blurHandler}
										placeholder="Вариант ответа"
								/>
								<button
										type="button"
										onClick={() => removeOption(index, optionIndex)}
										className="text-red-500 hover:text-red-700 transition-colors p-2"
									>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="3,6 5,6 21,6"/>
											<path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
											<line x1="10" y1="11" x2="10" y2="17"/>
											<line x1="14" y1="11" x2="14" y2="17"/>
									</svg>
								</button>
							</div>
						))}
											<button
												type="button"
								onClick={() => addOption(index)}
								className="text-sm text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1"
											>
								<Icon name="plus" size={16} style={{marginRight: '4px'}} />
								Добавить вариант
											</button>
										</div>
							</div>
						)}
					</div>
		)
	}

	return (
		<LargeModal
			isOpen={isOpen}
			onClose={onClose}
			title={editing ? 'Редактировать тип заявки' : 'Создать тип заявки'}
			subtitle="Настройка формы и роутинга"
			icon="file-plus"
			headerColor="#770002"
			fullScreen={true}
		>
			<form onSubmit={handleSubmit}>
				{/* Tabs */}
				<div className="mb-6">
					<div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
						{tabs.map(({ key, label, icon }) => (
							<button
								key={key}
								type="button"
								onClick={() => setActiveTab(key)}
								className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
									activeTab === key
										? 'bg-white shadow-sm'
										: 'text-slate-500 hover:text-slate-700'
								}`}
								style={activeTab === key ? {color: '#770002'} : {}}
							>
								<Icon name={icon} size={16} />
								{label}
							</button>
						))}
					</div>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">
					{renderTabContent()}
				</div>

				{/* Footer */}
				<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
						disabled={submitting}
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={submitting}
						className="px-6 py-2 bg-gradient-to-r from-[#770002] to-[#550001] text-white rounded-lg hover:from-[#550001] hover:to-[#330001] transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
					>
						{submitting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Сохранение...
							</>
						) : (
							<>
								<Icon name="check" size={16} />
								{editing ? 'Сохранить' : 'Создать'}
							</>
						)}
					</button>
				</div>
			</form>
		</LargeModal>
	)
}

const ConditionalRoutingSection = ({ fields, routes, setRoutes, users, roles, departments, inputStyles, focusHandler, blurHandler }) => {
	const [routingRules, setRoutingRules] = useState([])
	const [isInitialized, setIsInitialized] = useState(false)

	// Загружаем существующие правила из routes только при инициализации
	useEffect(() => {
		if (!isInitialized) {
			try {
				const parsedRoutes = typeof routes === 'string' ? JSON.parse(routes) : routes || {}
				const rules = []
				
				Object.entries(parsedRoutes).forEach(([fieldName, fieldRoutes]) => {
					Object.entries(fieldRoutes).forEach(([value, assignment]) => {
						rules.push({
							id: Date.now() + Math.random(),
							fieldName,
							fieldValue: value,
							assignmentType: assignment.assignee_id ? 'user' : assignment.role ? 'role' : 'department',
							assigneeId: assignment.assignee_id || '',
							roleName: assignment.role || '',
							departmentId: assignment.department_id || ''
						})
					})
				})
				setRoutingRules(rules)
				setIsInitialized(true)
			} catch (error) {
				setRoutingRules([])
				setIsInitialized(true)
			}
		}
	}, [routes, isInitialized])

	// Обновляем routes при изменении правил (только после инициализации)
	useEffect(() => {
		if (!isInitialized) return
		
		const newRoutes = {}
		
		routingRules.forEach(rule => {
			if (!newRoutes[rule.fieldName]) {
				newRoutes[rule.fieldName] = {}
			}
			
			const assignment = {}
			if (rule.assignmentType === 'user' && rule.assigneeId) {
				assignment.assignee_id = parseInt(rule.assigneeId)
			} else if (rule.assignmentType === 'role' && rule.roleName) {
				assignment.role = rule.roleName
			} else if (rule.assignmentType === 'department' && rule.departmentId) {
				assignment.department_id = parseInt(rule.departmentId)
			}
			
			if (Object.keys(assignment).length > 0) {
				newRoutes[rule.fieldName][rule.fieldValue] = assignment
			}
		})
		
		setRoutes(newRoutes)
	}, [routingRules, isInitialized])

	const addRule = () => {
		setRoutingRules([...routingRules, {
			id: Date.now(),
			fieldName: '',
			fieldValue: '',
			assignmentType: 'user',
			assigneeId: '',
			roleName: '',
			departmentId: ''
		}])
	}

	const updateRule = (id, field, value) => {
		setRoutingRules(prev => prev.map(rule => 
			rule.id === id ? { ...rule, [field]: value } : rule
		))
	}

	const removeRule = (id) => {
		setRoutingRules(prev => prev.filter(rule => rule.id !== id))
	}

	const getFieldOptions = (fieldName) => {
		const field = fields.find(f => f.name === fieldName)
		if (!field || !field.options) return []
		return field.options
	}

	// Функция для получения отображаемого имени поля по системному имени
	const getFieldDisplayName = (fieldName) => {
		const field = fields.find(f => f.name === fieldName)
		return field ? field.label : fieldName
	}

	const selectableFields = fields.filter(field => 
		field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'
	)

	return (
		<div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
			<h4 className="font-medium text-slate-900 flex items-center gap-2">
				<Icon name="git-fork" size={16} />
				Условный роутинг
			</h4>
			<p className="text-sm text-slate-600">
				Настройте роутинг в зависимости от значений полей формы
			</p>
			
			{selectableFields.length === 0 ? (
				<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
					<div className="flex items-center gap-2 text-amber-800 text-sm">
						<Icon name="info" size={16} />
						<span>Для настройки условного роутинга сначала создайте поля выбора (select, radio, checkbox) на вкладке "Форма"</span>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{routingRules.map((rule, index) => (
						<div key={rule.id} className="bg-slate-50 rounded-lg p-4 space-y-3">
							<div className="flex justify-between items-center">
								<h5 className="font-medium text-slate-800">
									Правило {index + 1}
									{rule.fieldName && (
										<span className="text-sm font-normal text-slate-600 ml-2">
											({getFieldDisplayName(rule.fieldName)})
										</span>
									)}
								</h5>
								<button
									type="button"
									onClick={() => removeRule(rule.id)}
									className="text-red-500 hover:text-red-700 transition-colors"
								>
									<Icon name="x" size={16} />
								</button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Выбор поля */}
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">
										Поле формы
									</label>
									<select
										value={rule.fieldName}
										onChange={(e) => updateRule(rule.id, 'fieldName', e.target.value)}
										style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
										onFocus={focusHandler}
										onBlur={blurHandler}
									>
										<option value="">Выберите поле</option>
										{selectableFields.map(field => (
											<option key={field.name} value={field.name}>
												{field.label}
											</option>
										))}
									</select>
								</div>

								{/* Выбор значения */}
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">
										Значение поля
									</label>
									{rule.fieldName ? (
										<select
											value={rule.fieldValue}
											onChange={(e) => updateRule(rule.id, 'fieldValue', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите значение</option>
											{getFieldOptions(rule.fieldName).map((option, i) => (
												<option key={i} value={option}>
													{option}
												</option>
											))}
										</select>
									) : (
										<input
											type="text"
											value={rule.fieldValue}
											onChange={(e) => updateRule(rule.id, 'fieldValue', e.target.value)}
											placeholder="Сначала выберите поле"
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
											disabled
										/>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Тип назначения */}
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">
										Назначить
									</label>
									<select
										value={rule.assignmentType}
										onChange={(e) => updateRule(rule.id, 'assignmentType', e.target.value)}
										style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
										onFocus={focusHandler}
										onBlur={blurHandler}
									>
										<option value="user">Пользователю</option>
										<option value="role">По роли</option>
										<option value="department">Подразделению</option>
									</select>
								</div>

								{/* Конкретное назначение */}
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">
										{rule.assignmentType === 'user' ? 'Пользователь' : 
										 rule.assignmentType === 'role' ? 'Роль' : 'Подразделение'}
									</label>
									{rule.assignmentType === 'user' && (
										<select
											value={rule.assigneeId}
											onChange={(e) => updateRule(rule.id, 'assigneeId', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите пользователя</option>
											{users.map(user => (
												<option key={user.id} value={user.id}>
													{user.full_name || user.username} ({user.email})
												</option>
											))}
										</select>
									)}
									{rule.assignmentType === 'role' && (
										<select
											value={rule.roleName}
											onChange={(e) => updateRule(rule.id, 'roleName', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите роль</option>
											{roles.map(role => (
												<option key={role.id} value={role.name}>
													{role.display_name}
												</option>
											))}
										</select>
									)}
									{rule.assignmentType === 'department' && (
										<select
											value={rule.departmentId}
											onChange={(e) => updateRule(rule.id, 'departmentId', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите подразделение</option>
											{departments.map(dept => (
												<option key={dept.id} value={dept.id}>
													{dept.name}
												</option>
											))}
										</select>
									)}
								</div>
							</div>
						</div>
					))}
					
					<button
						type="button"
						onClick={addRule}
						className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
					>
						<Icon name="plus" size={16} />
						Добавить правило
					</button>
				</div>
			)}
		</div>
	)
}

const AdvancedRoutingSection = ({ form, setForm, fields, users, roles, departments, inputStyles, focusHandler, blurHandler }) => {
	const [advancedRules, setAdvancedRules] = useState([])
	const [defaultAction, setDefaultAction] = useState({ type: 'auto', value: '' })
	const [isAdvancedInitialized, setIsAdvancedInitialized] = useState(false)

	// Загружаем существующие правила из form.default_routing только при инициализации
	useEffect(() => {
		if (!isAdvancedInitialized) {
			try {
				const routing = typeof form.default_routing === 'string' 
					? JSON.parse(form.default_routing || '{}') 
					: form.default_routing || {}
				
				if (routing.rules) {
					const rules = routing.rules.filter(rule => !rule.condition?.default).map(rule => ({
						id: Date.now() + Math.random(),
						conditionType: rule.condition?.field ? 'field' : 'always',
						fieldName: rule.condition?.field || '',
						operator: rule.condition?.operator || 'equals',
						fieldValue: rule.condition?.value || '',
						actionType: rule.action?.assign_to_user ? 'user' : 
									rule.action?.assign_to_role ? 'role' : 
									rule.action?.department_id ? 'department' : 'auto',
						actionValue: rule.action?.assign_to_user || rule.action?.assign_to_role || rule.action?.department_id || ''
					}))
					setAdvancedRules(rules)
					
					// Найти правило по умолчанию
					const defaultRule = routing.rules.find(rule => rule.condition?.default)
					if (defaultRule) {
						setDefaultAction({
							type: defaultRule.action?.assign_to_user ? 'user' : 
								  defaultRule.action?.assign_to_role ? 'role' : 
								  defaultRule.action?.department_id ? 'department' : 'auto',
							value: defaultRule.action?.assign_to_user || defaultRule.action?.assign_to_role || defaultRule.action?.department_id || ''
						})
					}
				}
				setIsAdvancedInitialized(true)
			} catch (error) {
				setAdvancedRules([])
				setIsAdvancedInitialized(true)
			}
		}
	}, [form.default_routing, isAdvancedInitialized])

	// Обновляем form.default_routing при изменении правил (только после инициализации)
	useEffect(() => {
		if (!isAdvancedInitialized) return
		
		const routing = {
			type: "conditional",
			rules: [
				...advancedRules.map(rule => ({
					condition: rule.conditionType === 'field' 
						? { field: rule.fieldName, operator: rule.operator, value: rule.fieldValue }
						: { always: true },
					action: rule.actionType === 'user' 
						? { assign_to_user: parseInt(rule.actionValue) }
						: rule.actionType === 'role'
						? { assign_to_role: rule.actionValue }
						: rule.actionType === 'department'
						? { department_id: parseInt(rule.actionValue) }
						: { auto: true }
				})),
				// Правило по умолчанию
				{
					condition: { default: true },
					action: defaultAction.type === 'user' 
						? { assign_to_user: parseInt(defaultAction.value) }
						: defaultAction.type === 'role'
						? { assign_to_role: defaultAction.value }
						: defaultAction.type === 'department'
						? { department_id: parseInt(defaultAction.value) }
						: { auto: true }
				}
			]
		}
		
		setForm(prev => ({ ...prev, default_routing: JSON.stringify(routing) }))
	}, [advancedRules, defaultAction, isAdvancedInitialized])

	const addRule = () => {
		setAdvancedRules([...advancedRules, {
			id: Date.now(),
			conditionType: 'field',
			fieldName: '',
			operator: 'equals',
			fieldValue: '',
			actionType: 'user',
			actionValue: ''
		}])
	}

	const updateRule = (id, field, value) => {
		setAdvancedRules(prev => prev.map(rule => 
			rule.id === id ? { ...rule, [field]: value } : rule
		))
	}

	const removeRule = (id) => {
		setAdvancedRules(prev => prev.filter(rule => rule.id !== id))
	}

	// Функция для получения отображаемого имени поля по системному имени
	const getFieldDisplayName = (fieldName) => {
		const field = fields.find(f => f.name === fieldName)
		return field ? field.label : fieldName
	}

	const operators = [
		{ value: 'equals', label: 'равно' },
		{ value: 'not_equals', label: 'не равно' },
		{ value: 'contains', label: 'содержит' },
		{ value: 'starts_with', label: 'начинается с' },
		{ value: 'ends_with', label: 'заканчивается на' }
	]

	return (
		<div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
			<h4 className="font-medium text-slate-900 flex items-center gap-2">
				<Icon name="zap" size={16} />
				Расширенный роутинг
			</h4>
			<p className="text-sm text-slate-600">
				Настройте сложные правила роутинга с условиями и приоритетами
			</p>
			
			<div className="space-y-4">
				{/* Правила */}
				{advancedRules.map((rule, index) => (
					<div key={rule.id} className="bg-slate-50 rounded-lg p-4 space-y-3">
						<div className="flex justify-between items-center">
							<h5 className="font-medium text-slate-800">
								Правило {index + 1}
								{rule.conditionType === 'field' && rule.fieldName && (
									<span className="text-sm font-normal text-slate-600 ml-2">
										({getFieldDisplayName(rule.fieldName)})
									</span>
								)}
							</h5>
							<button
								type="button"
								onClick={() => removeRule(rule.id)}
								className="text-red-500 hover:text-red-700 transition-colors"
							>
								<Icon name="x" size={16} />
							</button>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{/* Тип условия */}
							<div>
								<label className="block text-xs font-medium text-slate-600 mb-1">
									Условие
								</label>
								<select
									value={rule.conditionType}
									onChange={(e) => updateRule(rule.id, 'conditionType', e.target.value)}
									style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
									onFocus={focusHandler}
									onBlur={blurHandler}
								>
									<option value="field">По полю формы</option>
									<option value="always">Всегда</option>
								</select>
							</div>

							{/* Поле формы (если выбрано условие по полю) */}
							{rule.conditionType === 'field' && (
								<>
									<div>
										<label className="block text-xs font-medium text-slate-600 mb-1">
											Поле
										</label>
										<select
											value={rule.fieldName}
											onChange={(e) => updateRule(rule.id, 'fieldName', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите поле</option>
											{fields.map(field => (
												<option key={field.name} value={field.name}>
													{field.label}
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-600 mb-1">
											Оператор
										</label>
										<select
											value={rule.operator}
											onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											{operators.map(op => (
												<option key={op.value} value={op.value}>
													{op.label}
												</option>
											))}
										</select>
									</div>
								</>
							)}
						</div>

						{rule.conditionType === 'field' && (
							<div>
								<label className="block text-xs font-medium text-slate-600 mb-1">
									Значение для сравнения
								</label>
								<input
									type="text"
									value={rule.fieldValue}
									onChange={(e) => updateRule(rule.id, 'fieldValue', e.target.value)}
									placeholder="Введите значение"
									style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
									onFocus={focusHandler}
									onBlur={blurHandler}
								/>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{/* Тип действия */}
							<div>
								<label className="block text-xs font-medium text-slate-600 mb-1">
									Действие
								</label>
								<select
									value={rule.actionType}
									onChange={(e) => updateRule(rule.id, 'actionType', e.target.value)}
									style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
									onFocus={focusHandler}
									onBlur={blurHandler}
								>
									<option value="user">Назначить пользователю</option>
									<option value="role">Назначить по роли</option>
									<option value="department">Назначить подразделению</option>
									<option value="auto">Автоматически</option>
								</select>
							</div>

							{/* Конкретное назначение */}
							{rule.actionType !== 'auto' && (
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">
										{rule.actionType === 'user' ? 'Пользователь' : 
										 rule.actionType === 'role' ? 'Роль' : 'Подразделение'}
									</label>
									{rule.actionType === 'user' && (
										<select
											value={rule.actionValue}
											onChange={(e) => updateRule(rule.id, 'actionValue', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите пользователя</option>
											{users.map(user => (
												<option key={user.id} value={user.id}>
													{user.full_name || user.username} ({user.email})
												</option>
											))}
										</select>
									)}
									{rule.actionType === 'role' && (
										<select
											value={rule.actionValue}
											onChange={(e) => updateRule(rule.id, 'actionValue', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите роль</option>
											{roles.map(role => (
												<option key={role.id} value={role.name}>
													{role.display_name}
												</option>
											))}
										</select>
									)}
									{rule.actionType === 'department' && (
										<select
											value={rule.actionValue}
											onChange={(e) => updateRule(rule.id, 'actionValue', e.target.value)}
											style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
											onFocus={focusHandler}
											onBlur={blurHandler}
										>
											<option value="">Выберите подразделение</option>
											{departments.map(dept => (
												<option key={dept.id} value={dept.id}>
													{dept.name}
												</option>
											))}
										</select>
									)}
								</div>
							)}
						</div>
					</div>
				))}
				
				<button
					type="button"
					onClick={addRule}
					className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
				>
					<Icon name="plus" size={16} />
					Добавить правило
				</button>

				{/* Действие по умолчанию */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
					<h5 className="font-medium text-blue-900 flex items-center gap-2">
						<Icon name="shield-user" size={16} />
						Действие по умолчанию
					</h5>
					<p className="text-sm text-blue-700">
						Что делать, если ни одно правило не сработало
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-blue-700 mb-1">
								Действие
							</label>
							<select
								value={defaultAction.type}
								onChange={(e) => setDefaultAction({...defaultAction, type: e.target.value})}
								style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
								onFocus={focusHandler}
								onBlur={blurHandler}
							>
								<option value="auto">Автоматически</option>
								<option value="user">Назначить пользователю</option>
								<option value="role">Назначить по роли</option>
								<option value="department">Назначить подразделению</option>
							</select>
						</div>

						{defaultAction.type !== 'auto' && (
							<div>
								<label className="block text-xs font-medium text-blue-700 mb-1">
									{defaultAction.type === 'user' ? 'Пользователь' : 
									 defaultAction.type === 'role' ? 'Роль' : 'Подразделение'}
								</label>
								{defaultAction.type === 'user' && (
									<select
										value={defaultAction.value}
										onChange={(e) => setDefaultAction({...defaultAction, value: e.target.value})}
										style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
										onFocus={focusHandler}
										onBlur={blurHandler}
									>
										<option value="">Выберите пользователя</option>
										{users.map(user => (
											<option key={user.id} value={user.id}>
												{user.full_name || user.username} ({user.email})
											</option>
										))}
									</select>
								)}
								{defaultAction.type === 'role' && (
									<select
										value={defaultAction.value}
										onChange={(e) => setDefaultAction({...defaultAction, value: e.target.value})}
										style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
										onFocus={focusHandler}
										onBlur={blurHandler}
									>
										<option value="">Выберите роль</option>
										{roles.map(role => (
											<option key={role.id} value={role.name}>
												{role.display_name}
											</option>
										))}
									</select>
								)}
								{defaultAction.type === 'department' && (
									<select
										value={defaultAction.value}
										onChange={(e) => setDefaultAction({...defaultAction, value: e.target.value})}
										style={{...inputStyles, fontSize: '14px', padding: '6px 10px'}}
										onFocus={focusHandler}
										onBlur={blurHandler}
									>
										<option value="">Выберите подразделение</option>
										{departments.map(dept => (
											<option key={dept.id} value={dept.id}>
												{dept.name}
											</option>
										))}
									</select>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

const AccessControlSection = ({ access, setAccess, roles, departments, users, inputStyles, focusHandler, blurHandler }) => {
	return (
		<div className="space-y-4">
								<AccessControlSettings
						access={access}
						setAccess={setAccess}
						users={users || []}
						roles={roles || []}
						departments={departments || []}
						inputStyles={inputStyles}
						focusHandler={focusHandler}
						blurHandler={blurHandler}
						label="Кто может создавать заявки этого типа"
					/>
		</div>
	)
}

export default ApplicationsConstructor 