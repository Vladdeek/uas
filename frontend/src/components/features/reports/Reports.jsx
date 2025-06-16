import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApiClient from '../../../api/api'
import * as XLSX from 'xlsx'

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
	LargeModal,
	FormFieldRenderer,
	FormButton,
	ActionCard,
	BaseCard,
	Icon,
	Loader
} from '../../common'

const Reports = () => {
	const [loading, setLoading] = useState(false)
	const [types, setTypes] = useState([])
	const [reports, setReports] = useState([])
	const [stats, setStats] = useState([])
	const [user, setUser] = useState(null)
	
	const [showCreate, setShowCreate] = useState(false)
	const [showDetail, setShowDetail] = useState(false)
	const [showAnalytics, setShowAnalytics] = useState(false)
	const [selectedType, setSelectedType] = useState(null)
	const [selectedReport, setSelectedReport] = useState(null)
	
	const [analyticsData, setAnalyticsData] = useState([])
	const [analyticsLoading, setAnalyticsLoading] = useState(false)
	
	const [view, setView] = useState('available')
	const [filter, setFilter] = useState('')

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		if (view !== 'available' && view !== 'analytics') {
			loadReports()
		} else if (view === 'available') {
			loadStats()
			loadUserReports() // Загружаем отчеты пользователя для проверки одноразовых
		} else if (view === 'analytics') {
			loadStats()
		}
	}, [view, filter])

	const loadData = async () => {
		try {
			setLoading(true)
			const [typesData, userData] = await Promise.all([
				ApiClient.getReportTypes(),
				ApiClient.getUserProfile()
			])
			setTypes(typesData || [])
			setUser(userData)
			await loadStats()
		} catch (error) {
			const errorMessage = error.message || 'Ошибка загрузки данных'
			toast.error(errorMessage)
		} finally {
			setTimeout(() => setLoading(false), 800)
		}
	}

	const loadStats = async () => {
		try {
			const data = await ApiClient.getReportsStats()
			setStats(data || [])
		} catch (error) {
			console.error('Failed to load stats:', error)
		}
	}

	const loadReports = async () => {
		try {
			const params = {}
			if (filter) params.type_id = filter
			if (view === 'my-reports') params.view_mode = 'my'
			else if (view === 'all-reports') params.view_mode = 'available'
			
			const data = await ApiClient.getReports(params)
			setReports(data || [])
		} catch (error) {
			const errorMessage = error.message || 'Ошибка загрузки отчетов'
			toast.error(errorMessage)
		}
	}

	const loadUserReports = async () => {
		try {
			const params = { view_mode: 'my' }
			const data = await ApiClient.getReports(params)
			setReports(data || [])
		} catch (error) {
			console.error('Failed to load user reports:', error)
		}
	}

	const handleCreate = (type) => {
		setSelectedType(type)
		setShowCreate(true)
	}

	const handleView = (report) => {
		setSelectedReport(report)
		setShowDetail(true)
	}

	const handleAnalytics = async (type) => {
		try {
			setAnalyticsLoading(true)
			setSelectedType(type)
			setShowAnalytics(true)
			const data = await ApiClient.getReportsByType(type.id)
			setAnalyticsData(data || [])
		} catch (error) {
			const errorMessage = error.message || 'Ошибка загрузки аналитики'
			toast.error(errorMessage)
		} finally {
			setAnalyticsLoading(false)
		}
	}

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
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

	const getTypeStats = (typeId) => {
		return stats.find(stat => stat.type_id === typeId)
	}

	const canCreate = (type) => {
		if (type.is_reusable) return true
		
		const userId = ApiClient.getCurrentUser()?.id
		if (!userId) return false
		
		const userReports = reports.filter(r => 
			r.type_id === type.id && r.author_id === userId
		)
		return userReports.length === 0
	}

	return (
		<div className="p-6 bg-slate-50 min-h-screen">
			<div className="max-w-7xl mx-auto space-y-6">
				<PageHeader 
					title="Отчеты"
					subtitle="Просмотр и создание отчетов в системе"
					icon="file-chart-column"
				/>

				{loading ? (
					<LoadingState text="Загрузка данных..." />
				) : (
					<div className="space-y-6">
						{/* Табы */}
						<TabContainer
							tabs={[
								{ key: 'available', label: 'Доступные типы', icon: 'file-plus' },
								{ key: 'my-reports', label: 'Мои отчеты', icon: 'user' },
								{ key: 'analytics', label: 'Аналитика', icon: 'chart-bar' }
							]}
							activeTab={view}
							onTabChange={setView}
							variant="pills"
						/>

						{/* Фильтры */}
						{view !== 'available' && view !== 'analytics' && (
							<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex gap-4 items-center">
									<div className="flex items-center gap-2">
										<Icon name="filter" size={16} className="text-slate-500" />
										<span className="text-sm font-medium text-slate-700">Фильтры:</span>
									</div>
									<select
										value={filter}
										onChange={(e) => setFilter(e.target.value)}
										className="border border-slate-300 rounded-lg px-3 py-2 transition-colors"
										style={{'--focus-border': '#770002', '--focus-ring': '#77000240'}}
										onFocus={(e) => {
											e.target.style.borderColor = '#770002'
											e.target.style.boxShadow = '0 0 0 2px #77000240'
										}}
										onBlur={(e) => {
											e.target.style.borderColor = ''
											e.target.style.boxShadow = ''
										}}
									>
										<option value="">Все типы</option>
										{types.map(type => (
											<option key={type.id} value={type.id}>{type.display_name}</option>
										))}
									</select>
									<button
										onClick={loadReports}
										className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
										style={{backgroundColor: '#770002'}}
										onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
										onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
									>
										<Icon name="refresh-cw" size={16} />
										Обновить
									</button>
								</div>
							</div>
						)}

						{/* Доступные типы */}
						{view === 'available' && (
							<div className="bg-white rounded-xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-200">
									<h2 className="text-lg font-semibold text-slate-900">Доступные типы отчетов</h2>
								</div>
								<div className="p-6">
									{types.filter(type => canCreate(type)).length === 0 ? (
										<EmptyState
											icon="file-chart-column"
											title="Нет доступных типов"
											description="Все одноразовые отчеты уже заполнены"
										/>
									) : (
										<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
											{types.filter(type => canCreate(type)).map(type => {
												const typeStats = getTypeStats(type.id)
												return (
													<ActionCard
														key={type.id}
														icon="file-chart-column"
														title={type.display_name}
														description={type.description}
														badge={
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
														}
														actions={
															<FormButton
																onClick={() => handleCreate(type)}
																variant="primary"
																icon="plus"
																size="sm"
															>
																Создать отчет
															</FormButton>
														}
													>
														<div className="mb-4 p-4 rounded-lg" style={{backgroundColor: '#77000220'}}>
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium" style={{color: '#770002'}}>Всего отчетов</span>
																<span className="text-2xl font-bold" style={{color: '#770002'}}>{typeStats?.count || 0}</span>
															</div>
														</div>

														<div className="mb-4">
															<div className="flex items-center gap-2 mb-2">
																<Icon name="shield-user" size={14} className="text-slate-400" />
																<span className="text-xs font-medium text-slate-500">Доступ:</span>
															</div>
															<p className="text-sm text-slate-700">{getAccessText(type.access_control)}</p>
														</div>
													</ActionCard>
												)
											})}
										</div>
									)}
								</div>
							</div>
						)}

						{/* Аналитика */}
						{view === 'analytics' && (
							<div className="bg-white rounded-xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-200">
									<h2 className="text-lg font-semibold text-slate-900">Аналитика по типам отчетов</h2>
								</div>
								<div className="p-6">
									<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
										{types.map(type => {
											const typeStats = getTypeStats(type.id)
											return (
												<div key={type.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
													<div className="flex items-start mb-4">
														<div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#77000220'}}>
															<Icon name="chart-bar" size={20} style={{color: '#770002'}} />
														</div>
														<div>
															<h3 className="text-lg font-medium text-slate-900">{type.display_name}</h3>
														</div>
													</div>
													<div className="space-y-3">
														<div className="flex justify-between items-center">
															<span className="text-slate-600 flex items-center gap-2">
																<Icon name="hash" size={14} />
																Всего отчетов:
															</span>
															<span className="font-semibold text-slate-900">{typeStats?.count || 0}</span>
														</div>
														<div className="flex justify-between items-center">
															<span className="text-slate-600 flex items-center gap-2">
																<Icon name="clock" size={14} />
																Последний:
															</span>
															<span className="text-sm text-slate-700">
																{typeStats?.last_submission ? formatDate(typeStats.last_submission) : 'Нет'}
															</span>
														</div>
													</div>
													<button
														onClick={() => handleAnalytics(type)}
														className="w-full mt-4 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
														style={{backgroundColor: '#770002'}}
														onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
														onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
													>
														<Icon name="eye" size={16} />
														Посмотреть детали
													</button>
												</div>
											)
										})}
									</div>
								</div>
							</div>
						)}

						{/* Отчеты */}
						{view === 'my-reports' && (
							<div className="bg-white rounded-xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-200">
									<h2 className="text-lg font-semibold text-slate-900">
										Мои отчеты
									</h2>
								</div>
								<div className="p-6">
									{reports.length === 0 ? (
										<EmptyState
											icon="file-chart-column"
											title="Отчеты не найдены"
											description="Отчеты отсутствуют"
										/>
									) : (
										<div className="space-y-4">
											{reports.map(report => (
												<div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
													<div className="flex items-start justify-between">
														<div className="flex items-start flex-1 min-w-0">
															<div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#77000220'}}>
																<Icon name="file-text" size={20} style={{color: '#770002'}} />
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="text-lg font-medium text-slate-900 truncate" title={report.title}>{report.title}</h3>
																<p className="text-sm text-slate-600 truncate">{report.report_type?.display_name}</p>
																<div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
																	<span className="flex items-center gap-1">
																		<Icon name="user" size={14} />
																		{report.author?.full_name || report.author?.username}
																	</span>
																	<span className="flex items-center gap-1">
																		<Icon name="calendar-days" size={14} />
																		{formatDate(report.submitted_at)}
																	</span>
																</div>
															</div>
														</div>
														<div className="flex-shrink-0 ml-4">
															<button
																onClick={() => handleView(report)}
																className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
																style={{backgroundColor: '#770002'}}
																onMouseEnter={(e) => e.target.style.backgroundColor = '#550001'}
																onMouseLeave={(e) => e.target.style.backgroundColor = '#770002'}
															>
																<Icon name="eye" size={16} />
																Открыть
															</button>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Модальные окна */}
			{showCreate && selectedType && (
				<CreateModal 
					type={selectedType} 
					onClose={() => setShowCreate(false)} 
					onSuccess={() => {
						setShowCreate(false)
						if (view === 'available') {
							loadUserReports() // Обновляем отчеты пользователя для скрытия одноразовых
						} else {
							loadReports() // Обновляем текущий список отчетов
						}
						toast.success('Отчет создан')
					}} 
				/>
			)}

			{showDetail && selectedReport && (
				<ReportDetailModal 
					report={selectedReport} 
					onClose={() => setShowDetail(false)} 
				/>
			)}

			{showAnalytics && selectedType && (
				<AnalyticsModal 
					type={selectedType} 
					reports={analyticsData} 
					loading={analyticsLoading} 
					onClose={() => setShowAnalytics(false)} 
				/>
			)}
		</div>
	)
}

const CreateModal = ({ type, onClose, onSuccess }) => {
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({})

	const getTemplate = () => {
		try {
			const parsed = JSON.parse(type.form_template || '{}')
			return parsed.fields || []
		} catch {
			return []
		}
	}

	const handleChange = (fieldName, value) => {
		setFormData(prev => ({ ...prev, [fieldName]: value }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setLoading(true)
			await ApiClient.createReport({
				title: formData.title || `${type.display_name} от ${new Date().toLocaleDateString()}`,
				description: formData.description || '',
				form_data: JSON.stringify(formData),
				type_id: type.id
			})
			onSuccess()
		} catch (error) {
			const errorMessage = error.message || 'Ошибка создания отчета'
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<FormModal
			isOpen={true}
			onClose={onClose}
			title="Создать отчет"
			subtitle={type.display_name}
			icon="file-plus"
			onSubmit={handleSubmit}
			loading={loading}
			submitText="Создать"
			maxWidth="max-w-2xl"
		>
			{getTemplate().map((field, index) => (
				<FormFieldRenderer
					key={index}
					field={field}
					value={formData[field.name] || ''}
					onChange={handleChange}
				/>
			))}
		</FormModal>
	)
}

const ReportDetailModal = ({ report, onClose }) => {
	const getData = () => {
		try {
			return JSON.parse(report.form_data || '{}')
		} catch {
			return {}
		}
	}

	const getTemplate = () => {
		try {
			const parsed = JSON.parse(report.report_type?.form_template || '{}')
			return parsed.fields || []
		} catch {
			return []
		}
	}

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const renderValue = (field, value) => {
		if (!value && value !== 0) return <span className="text-gray-400">Не указано</span>

		switch (field.type) {
			case 'checkbox':
				return Array.isArray(value) ? value.join(', ') : value
			case 'date':
				return new Date(value).toLocaleDateString('ru-RU')
			default:
				return value.toString()
		}
	}

	const data = getData()
	const template = getTemplate()

	return (
		<DetailModal
			isOpen={true}
			onClose={onClose}
			title={report.title}
			subtitle={report.report_type?.display_name}
			icon="file-text"
			maxWidth="max-w-4xl"
		>
			{report.description && (
				<div className="mb-6">
					<h3 className="font-medium text-gray-900 mb-2">Описание</h3>
					<p className="text-gray-700">{report.description}</p>
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-2">
				<div>
					<h3 className="font-medium text-gray-900 mb-4">Данные отчета</h3>
					<div className="space-y-4">
						{template.map((field, index) => (
							<div key={index}>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{field.label}
								</label>
								<div className="text-gray-900">
									{renderValue(field, data[field.name])}
								</div>
							</div>
						))}
					</div>
				</div>

				<div>
					<h3 className="font-medium text-gray-900 mb-4">Информация о отчете</h3>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Автор</label>
							<div className="text-gray-900">{report.author?.full_name || report.author?.username}</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Дата создания</label>
							<div className="text-gray-900">{formatDate(report.submitted_at)}</div>
						</div>
						{report.author_department && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
								<div className="text-gray-900">{report.author_department}</div>
							</div>
						)}
						{report.author_position && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
								<div className="text-gray-900">{report.author_position}</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</DetailModal>
	)
}

const AnalyticsModal = ({ type, reports, loading, onClose }) => {
	const [filteredReports, setFilteredReports] = useState([])
	const [columnFilters, setColumnFilters] = useState({})
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
	const [filterDropdowns, setFilterDropdowns] = useState({})

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleDateString('ru-RU')
	}

	const getTemplate = () => {
		try {
			const parsed = JSON.parse(type.form_template || '{}')
			return parsed.fields || []
		} catch {
			return []
		}
	}

	const templateFields = getTemplate()

	useEffect(() => {
		setFilteredReports(reports)
		setColumnFilters({})
		setSortConfig({ key: null, direction: 'asc' })
	}, [reports])

	const getColumnValue = (report, column) => {
		switch (column) {
			case 'author':
				return report.author?.full_name || report.author?.username || 'Не указано'
			case 'department':
				return report.author_department || 'Не указано'
			case 'position':
				return report.author_position || 'Не указано'
			case 'date':
				return formatDate(report.submitted_at)
			default:
				try {
					const formData = JSON.parse(report.form_data || '{}')
					const value = formData[column]
					if (Array.isArray(value)) return value.join(', ')
					return value?.toString() || 'Не указано'
				} catch {
					return 'Не указано'
				}
		}
	}

	const exportToExcel = () => {
		if (!filteredReports.length) {
			toast.error('Нет данных для экспорта')
			return
		}

		try {
			const wsData = []
			const headers = ['Автор', 'Подразделение', 'Должность', 'Дата']
			templateFields.forEach(field => {
				headers.push(field.label)
			})
			wsData.push(headers)
			
			filteredReports.forEach(report => {
				const row = []
				row.push(report.author?.full_name || report.author?.username || 'Не указано')
				row.push(report.author_department || 'Не указано')
				row.push(report.author_position || 'Не указано')
				row.push(formatDate(report.submitted_at))
				
				let formData = {}
				try {
					formData = JSON.parse(report.form_data || '{}')
				} catch {}
				
				templateFields.forEach(field => {
					const value = formData[field.name]
					let displayValue = ''
					
					if (field.type === 'date' && value) {
						displayValue = new Date(value).toLocaleDateString('ru-RU')
					} else if (Array.isArray(value)) {
						displayValue = value.join(', ')
					} else {
						displayValue = value?.toString() || 'Не указано'
					}
					
					row.push(displayValue)
				})
				
				wsData.push(row)
			})
			
			const wb = XLSX.utils.book_new()
			const ws = XLSX.utils.aoa_to_sheet(wsData)
			XLSX.utils.book_append_sheet(wb, ws, 'Аналитика')
			
			const fileName = `Аналитика_${type.display_name}_${new Date().toISOString().split('T')[0]}.xlsx`
			XLSX.writeFile(wb, fileName)
			
			toast.success(`Экспортировано ${filteredReports.length} записей в Excel`)
		} catch (error) {
			console.error('Ошибка экспорта:', error)
			toast.error('Ошибка при экспорте данных')
		}
	}

	return (
		<LargeModal
			isOpen={true}
			onClose={onClose}
			title={`Аналитика: ${type.display_name}`}
			subtitle="Анализ отчетов по типу"
			icon="chart-bar"
			fullScreen={true}
		>
			<div className="flex flex-col h-full">
				{/* Панель управления */}
				<div className="bg-gray-50 border-b p-6 flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<div className="text-sm text-gray-600 font-medium">
								Показано: <span className="text-gray-900">{filteredReports.length}</span> из <span className="text-gray-900">{reports.length}</span> отчетов
							</div>
						</div>
						<button
							onClick={exportToExcel}
							disabled={!filteredReports.length}
							className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
						>
							<Icon name="file-chart-column" size={18} />
							Экспорт в XLSX ({filteredReports.length})
						</button>
					</div>
				</div>

				{loading ? (
					<div className="flex-1 flex items-center justify-center p-8">
						<Loader text="Загрузка аналитики..." />
					</div>
				) : (
					<div className="flex-1 overflow-auto p-6">
						{filteredReports.length === 0 ? (
							<div className="flex items-center justify-center p-8 text-gray-500">
								<div className="text-center">
									<Icon name="chart-bar" size={48} className="mx-auto mb-4 text-gray-300" />
									<p className="text-lg font-medium">Нет данных для отображения</p>
									<p className="text-sm">Отчеты по данному типу отсутствуют</p>
								</div>
							</div>
						) : (
							<table className="w-full border-collapse text-sm">
								<thead className="bg-gray-100 sticky top-0">
									<tr>
										<th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Автор</th>
										<th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Подразделение</th>
										<th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Должность</th>
										<th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Дата</th>
										{templateFields.map(field => (
											<th key={field.name} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
												{field.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredReports.map((report, index) => {
										let formData = {}
										try {
											formData = JSON.parse(report.form_data || '{}')
										} catch {}
										
										return (
											<tr key={report.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
												<td className="border border-gray-300 px-3 py-2">
													{getColumnValue(report, 'author')}
												</td>
												<td className="border border-gray-300 px-3 py-2">
													{getColumnValue(report, 'department')}
												</td>
												<td className="border border-gray-300 px-3 py-2">
													{getColumnValue(report, 'position')}
												</td>
												<td className="border border-gray-300 px-3 py-2">
													{getColumnValue(report, 'date')}
												</td>
												{templateFields.map(field => (
													<td key={field.name} className="border border-gray-300 px-3 py-2">
														{getColumnValue(report, field.name)}
													</td>
												))}
											</tr>
										)
									})}
								</tbody>
							</table>
						)}
					</div>
				)}
			</div>
		</LargeModal>
	)
}

export default Reports 