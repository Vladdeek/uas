import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ApiClient from '../../../api/api'
import { Loader, Icon, LargeModal, FormInput, AccessControlSettings, AccessControlDisplay } from '../../common'

const ReportsConstructor = () => {
	const [loading, setLoading] = useState(false)
	const [tab, setTab] = useState('types')
	const [types, setTypes] = useState([])
	const [users, setUsers] = useState([])
	const [roles, setRoles] = useState([])
	const [departments, setDepartments] = useState([])
	const [showCreate, setShowCreate] = useState(false)
	const [editing, setEditing] = useState(null)
	
	const [form, setForm] = useState({
		name: '',
		display_name: '',
		description: '',
		is_reusable: true,
		form_template: '',
		access_control: JSON.stringify({ type: 'all', values: [] })
	})
	
	const [fields, setFields] = useState([])
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
				ApiClient.getReportTypes()
			]
			
			if (isAdmin) {
				requests.push(
					ApiClient.getUsers(),
					ApiClient.getRoles(),
					ApiClient.getDepartments()
				)
			}
			
			const results = await Promise.all(requests)
			
			setTypes(results[0] || [])
			
			if (isAdmin) {
				setUsers(results[1] || [])
				setRoles(results[2] || [])
				setDepartments(results[3] || [])
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
				is_reusable: form.is_reusable,
				form_template: JSON.stringify(template),
				access_control: JSON.stringify(access)
			}

			if (editing) {
				await ApiClient.updateReportType(editing.id, data)
				toast.success('Тип отчета обновлен')
			} else {
				await ApiClient.createReportType(data)
				toast.success('Тип отчета создан')
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
			is_reusable: type.is_reusable,
			form_template: type.form_template || '',
			access_control: type.access_control || JSON.stringify({ type: 'all', values: [] })
		})
		
		try {
			const template = JSON.parse(type.form_template || '{"fields":[]}')
			setFields(template.fields || [])
		} catch {
			setFields([])
		}
		
		try {
			setAccess(JSON.parse(type.access_control || '{"type":"all","values":[]}'))
		} catch {
			setAccess({ type: 'all', values: [] })
		}
		
		setShowCreate(true)
	}

	const handleDelete = async (type) => {
		if (!confirm(`Удалить тип "${type.display_name}"?`)) return
		
		try {
			await ApiClient.deleteReportType(type.id)
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
			is_reusable: true,
			form_template: '',
			access_control: JSON.stringify({ type: 'all', values: [] })
		})
		setFields([])
		setAccess({ type: 'all', values: [] })
		setEditing(null)
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

	const getFieldsCount = (template) => {
		try {
			const parsed = JSON.parse(template || '{"fields":[]}')
			return parsed.fields ? parsed.fields.length : 0
		} catch {
			return 0
		}
	}

	return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Заголовок */}
				<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<div className="flex items-center">
						<div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{backgroundColor: '#77000220'}}>
							<Icon name="file-chart-column" size={24} style={{color: '#770002'}} />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-900">Конструктор отчетов</h1>
							<p className="text-slate-600">Управление типами отчетов и настройками</p>
						</div>
					</div>
				</div>

				{loading ? (
					<Loader text="Загрузка..." />
				) : (
					<div className="space-y-6">
						{/* Типы отчетов */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200">
							<div className="p-6 border-b border-slate-200 flex justify-between items-center">
								<h2 className="text-lg font-semibold text-slate-900">Типы отчетов</h2>
								<button
									onClick={() => setShowCreate(true)}
									className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
									style={{backgroundColor: '#770002'}}
									onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
									onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
								>
									<Icon name="plus" size={16} style={{marginRight: '4px'}} />
									Создать тип
								</button>
							</div>

							<div className="p-6">
								{types.length === 0 ? (
									<div className="text-center py-12">
										<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Icon name="file-chart-column" size={32} className="text-slate-400" />
										</div>
										<h3 className="text-lg font-medium text-slate-900 mb-2">Нет типов отчетов</h3>
										<p className="text-slate-500 mb-4">Создайте первый тип отчета</p>
										<button
											onClick={() => setShowCreate(true)}
											className="text-white px-6 py-2 rounded-lg transition-colors"
											style={{backgroundColor: '#770002'}}
											onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
											onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
										>
											Создать тип отчета
										</button>
									</div>
								) : (
									<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
										{types.map(type => (
											<div key={type.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
												<div className="flex items-start justify-between mb-4">
													<div className="flex items-start">
														<div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#77000220'}}>
															<Icon name="file-chart-column" size={20} style={{color: '#770002'}} />
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
															onClick={() => handleEdit(type)}
															className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
															title="Редактировать"
														>
															<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
																<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
																<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
															</svg>
														</button>
														<button
															onClick={() => handleDelete(type)}
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
														<Icon name="shield-user" size={14} className="text-slate-400" />
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
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														type.is_reusable 
															? 'bg-emerald-100 text-emerald-800' 
															: 'bg-amber-100 text-amber-800'
													}`}>
														<Icon 
															name={type.is_reusable ? 'refresh-cw' : 'ban'} 
															size={12} 
															className="mr-1" 
														/>
														{type.is_reusable ? 'Многоразовый' : 'Одноразовый'}
													</span>
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
					</div>
				)}
			</div>

			{/* Модальное окно создания/редактирования */}
			<CreateModal
				isOpen={showCreate}
				form={form}
				setForm={setForm}
				fields={fields}
				setFields={setFields}
				access={access}
				setAccess={setAccess}
				users={users}
				roles={roles}
				departments={departments}
				editing={editing}
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
			/>
		</div>
	)
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

const CreateModal = ({ 
	isOpen, form, setForm, fields, setFields, access, setAccess, users, roles, departments, editing, 
	onSave, onClose, addField, updateField, removeField, 
	addOption, updateOption, removeOption 
}) => {
	const [tab, setTab] = useState('basic')
	const [saving, setSaving] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setSaving(true)
		await onSave()
		setSaving(false)
	}

	const renderField = (field, index) => {
		const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type)

		return (
			<div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
				<div className="flex items-center justify-between mb-3">
					<h4 className="font-medium text-slate-900 flex items-center gap-2">
						<Icon name="edit" size={16} />
						Поле {index + 1}
					</h4>
					<button
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

				<div className="grid grid-cols-2 gap-3 mb-3">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
						<input
							type="text"
							value={field.name || ''}
							onChange={(e) => updateField(index, 'name', e.target.value)}
							className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
							placeholder="field_name"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Метка</label>
						<input
							type="text"
							value={field.label || ''}
							onChange={(e) => updateField(index, 'label', e.target.value)}
							className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
							placeholder="Метка поля"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 mb-3">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
						<select
							value={field.type || 'text'}
							onChange={(e) => updateField(index, 'type', e.target.value)}
							className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
						>
							<option value="text">Текст</option>
							<option value="textarea">Многострочный текст</option>
							<option value="number">Число</option>
							<option value="date">Дата</option>
							<option value="select">Выпадающий список</option>
							<option value="radio">Радиокнопки</option>
							<option value="checkbox">Чекбоксы</option>
						</select>
					</div>
					<div className="flex items-end">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={field.required || false}
								onChange={(e) => updateField(index, 'required', e.target.checked)}
								className="mr-2 text-blue-600 focus:ring-blue-500"
							/>
							<span className="text-sm text-slate-700">Обязательное поле</span>
						</label>
					</div>
				</div>

				{needsOptions && (
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-slate-700">Варианты</label>
							<button
								onClick={() => addOption(index)}
								className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
							>
								<Icon name="plus" size={14} style={{marginRight: '4px'}} />
								Добавить
							</button>
						</div>
						<div className="space-y-2">
							{field.options?.map((option, optionIndex) => (
								<div key={optionIndex} className="flex gap-2">
									<input
										type="text"
										value={option}
										onChange={(e) => updateOption(index, optionIndex, e.target.value)}
										className="flex-1 border border-slate-300 rounded px-3 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
										placeholder="Вариант"
									/>
									<button
										onClick={() => removeOption(index, optionIndex)}
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
							))}
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
			title={editing ? 'Редактировать тип отчета' : 'Создать тип отчета'}
			subtitle="Настройка формы и контроля доступа"
			icon="file-chart-column"
			headerColor="#770002"
		>
			<form onSubmit={handleSubmit}>
				{/* Табы */}
				<div className="mb-6">
					<div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
						{[
							{ key: 'basic', label: 'Основное', icon: 'info' },
							{ key: 'form', label: 'Форма', icon: 'edit' },
							{ key: 'access', label: 'Доступ', icon: 'shield-user' }
						].map(({ key, label, icon }) => (
							<button
								key={key}
								type="button"
								onClick={() => setTab(key)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
									tab === key
										? 'bg-white shadow-sm'
										: 'text-slate-500 hover:text-slate-700'
								}`}
								style={tab === key ? {color: '#770002'} : {}}
							>
								<Icon name={icon} size={16} />
								{label}
							</button>
						))}
					</div>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">
					{/* Основная информация */}
					{tab === 'basic' && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormInput
									label="Системное имя"
									value={form.name}
									onChange={(value) => setForm({...form, name: value})}
									placeholder="report_type_name"
									required
								/>
								<FormInput
									label="Отображаемое имя"
									value={form.display_name}
									onChange={(value) => setForm({...form, display_name: value})}
									placeholder="Отчет о ..."
									required
								/>
							</div>

							<FormInput
								label="Описание"
								type="textarea"
								value={form.description}
								onChange={(value) => setForm({...form, description: value})}
								rows={3}
								placeholder="Описание типа отчета..."
							/>

							<div>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={form.is_reusable}
										onChange={(e) => setForm({...form, is_reusable: e.target.checked})}
										className="mr-2 text-blue-600 focus:ring-blue-500"
									/>
									<span className="text-sm text-slate-700">Многоразовый тип (можно создавать несколько отчетов)</span>
								</label>
							</div>
						</div>
					)}

					{/* Конструктор формы */}
					{tab === 'form' && (
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium text-slate-900">Поля формы</h3>
								<button
									type="button"
									onClick={addField}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
								>
									<Icon name="plus" size={16} style={{marginRight: '4px'}} />
									Добавить поле
								</button>
							</div>

							{fields.length === 0 ? (
								<div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
									<Icon name="edit" size={32} className="mx-auto text-slate-400 mb-4" />
									<p className="text-slate-500">Нет полей формы</p>
									<p className="text-sm text-slate-400">Добавьте поля для создания формы отчета</p>
								</div>
							) : (
								<div className="space-y-4">
									{fields.map((field, index) => renderField(field, index))}
								</div>
							)}
						</div>
					)}

					{/* Настройки доступа */}
					{tab === 'access' && (
						<div className="space-y-4">
							<AccessControlSettings
								access={access}
								setAccess={setAccess}
								users={users || []}
								roles={roles || []}
								departments={departments || []}
								inputStyles="border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
								focusHandler={() => {}}
								blurHandler={() => {}}
								label="Кто может создавать отчеты этого типа"
							/>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
						disabled={saving}
					>
						Отмена
					</button>
					<button
						type="submit"
						disabled={saving}
						className="px-6 py-2 bg-gradient-to-r from-[#770002] to-[#550001] text-white rounded-lg hover:from-[#550001] hover:to-[#330001] transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
					>
						{saving ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Сохранение...
							</>
						) : (
							<>
								<Icon name="check" size={16} />
								{editing ? 'Обновить' : 'Создать'}
							</>
						)}
					</button>
				</div>
			</form>
		</LargeModal>
	)
}

export default ReportsConstructor 