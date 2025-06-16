import React, { useEffect, useState } from 'react'
import ApiClient from '../../../api/api.js'
import { toast } from 'react-toastify'

// Импортируем наши общие компоненты
import {
	PageHeader,
	Section,
	StatsGrid,
	LoadingState,
	EmptyState,
	FilterSection,
	BaseTable,
	StatusCell,
	DateCell,
	EmptyTableState
} from '../../common'

const ApplicationReports = () => {
	const [loading, setLoading] = useState(true)
	const [applications, setApplications] = useState([])
	const [applicationTypes, setApplicationTypes] = useState([])
	const [applicationStatuses, setApplicationStatuses] = useState([])
	const [filteredApplications, setFilteredApplications] = useState([])
	
	const [filters, setFilters] = useState({
		dateFrom: '',
		dateTo: '',
		type: '',
		status: '',
		priority: '',
		applicant: '',
		type_id: '',
		date_from: '',
		date_to: '',
		assignee_view: false
	})

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		applyFilters()
	}, [applications, filters])

	const loadData = async () => {
		try {
			setLoading(true)
			
			const [typesResponse, statusesResponse] = await Promise.all([
				ApiClient.getApplicationTypes(),
				ApiClient.getApplicationStatuses()
			])
			
			setApplicationTypes(typesResponse)
			setApplicationStatuses(statusesResponse)
			
			// Загружаем заявки с текущими фильтрами
			await loadApplications()
		} catch (error) {
			console.error('Ошибка загрузки данных:', error)
			toast.error('Ошибка загрузки данных')
		} finally {
			setLoading(false)
		}
	}

	const loadApplications = async () => {
		try {
			const params = {}
			if (filters.type_id) params.type_id = filters.type_id
			if (filters.status) params.status = filters.status
			if (filters.assignee_view) params.assignee_view = true
			
			const response = await ApiClient.getApplications(params)
			setApplications(response)
		} catch (error) {
			console.error('Ошибка загрузки заявок:', error)
			toast.error('Ошибка загрузки заявок')
		}
	}

	const applyFilters = () => {
		loadApplications()
	}

	const getStatistics = () => {
		const total = filteredApplications.length
		const byStatus = {}
		const byType = {}
		const byPriority = {}
		
		filteredApplications.forEach(app => {
			// По статусам
			const statusName = app.status?.display_name || 'Неизвестно'
			byStatus[statusName] = (byStatus[statusName] || 0) + 1
			
			// По типам
			const typeName = app.application_type?.display_name || 'Неизвестно'
			byType[typeName] = (byType[typeName] || 0) + 1
			
			// По приоритету
			byPriority[app.priority] = (byPriority[app.priority] || 0) + 1
		})

		return { total, byStatus, byType, byPriority }
	}

	const exportToCSV = () => {
		const headers = [
			'ID',
			'Заголовок',
			'Тип',
			'Статус',
			'Заявитель',
			'Исполнитель',
			'Создана',
			'Обновлена'
		]

		const rows = filteredApplications.map(app => [
			app.id,
			app.title,
			app.application_type?.display_name || '',
			app.status?.display_name || '',
			app.applicant?.full_name || app.applicant?.username || '',
			app.current_assignee?.full_name || app.current_assignee?.username || 'Не назначен',
			new Date(app.created_at).toLocaleDateString(),
			new Date(app.updated_at).toLocaleDateString()
		])

		const csvContent = [headers, ...rows]
			.map(row => row.map(field => `"${field}"`).join(','))
			.join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute('download', `applications_report_${new Date().toISOString().split('T')[0]}.csv`)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const formatDate = (dateStr) => {
		return new Date(dateStr).toLocaleString('ru-RU')
	}

	const handleFilterChange = (field, value) => {
		setFilters(prev => ({ ...prev, [field]: value }))
	}

	const clearFilters = () => {
		setFilters({
			dateFrom: '',
			dateTo: '',
			type: '',
			status: '',
			priority: '',
			applicant: '',
			type_id: '',
			date_from: '',
			date_to: '',
			assignee_view: false
		})
	}

	if (loading) {
		return <LoadingState />
	}

	const stats = getStatistics()

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='p-6 max-w-7xl mx-auto'>
				<PageHeader 
					title="Отчеты по заявкам"
					subtitle="Анализ и статистика по всем заявкам в системе"
					icon="file-chart-column"
					className="mb-8"
				/>

				{/* Статистика */}
				<StatsGrid 
					stats={[
						{ title: 'Всего заявок', value: stats.total, icon: 'file-text', color: 'blue' },
						{ 
							title: 'Завершенных', 
							value: Object.keys(stats.byStatus).filter(status => 
								applicationStatuses.find(s => s.display_name === status)?.is_final
							).reduce((sum, status) => sum + stats.byStatus[status], 0),
							icon: 'check-circle', 
							color: 'green' 
						},
						{ 
							title: 'В работе', 
							value: Object.keys(stats.byStatus).filter(status => 
								!applicationStatuses.find(s => s.display_name === status)?.is_final
							).reduce((sum, status) => sum + stats.byStatus[status], 0),
							icon: 'clock', 
							color: 'yellow' 
						},
						{ title: 'Срочных', value: stats.byPriority.urgent || 0, icon: 'zap', color: 'red' }
					]}
					columns={4}
					className="mb-8"
				/>

				{/* Фильтры */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
					<div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
						<h3 className='text-lg font-semibold text-gray-900'>Фильтры</h3>
						<div className='flex space-x-3'>
							<button
								onClick={clearFilters}
								className='bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition'
							>
								Очистить
							</button>
							<button
								onClick={exportToCSV}
								className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2'
							>
								<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
								</svg>
								<span>Экспорт CSV</span>
							</button>
						</div>
					</div>
					
					<div className='p-6'>
						<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Дата от
								</label>
								<input
									type='date'
									value={filters.date_from}
									onChange={(e) => handleFilterChange('date_from', e.target.value)}
									className='w-full border border-gray-300 rounded-lg px-3 py-2'
								/>
							</div>
							
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Дата до
								</label>
								<input
									type='date'
									value={filters.date_to}
									onChange={(e) => handleFilterChange('date_to', e.target.value)}
									className='w-full border border-gray-300 rounded-lg px-3 py-2'
								/>
							</div>
							
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Тип заявки
								</label>
								<select
									value={filters.type_id}
									onChange={(e) => handleFilterChange('type_id', e.target.value)}
									className='w-full border border-gray-300 rounded-lg px-3 py-2'
								>
									<option value=''>Все типы</option>
									{applicationTypes.map((type) => (
										<option key={type.id} value={type.id}>
											{type.display_name}
										</option>
									))}
								</select>
							</div>
							
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Статус
								</label>
								<select
									value={filters.status}
									onChange={(e) => handleFilterChange('status', e.target.value)}
									className='w-full border border-gray-300 rounded-lg px-3 py-2'
								>
									<option value=''>Все статусы</option>
									{applicationStatuses.map((status) => (
										<option key={status.id} value={status.name}>
											{status.display_name}
										</option>
									))}
								</select>
							</div>
							
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Заявитель
								</label>
								<input
									type='text'
									value={filters.applicant}
									onChange={(e) => handleFilterChange('applicant', e.target.value)}
									placeholder='Поиск по имени'
									className='w-full border border-gray-300 rounded-lg px-3 py-2'
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Список заявок */}
				<div className='bg-white rounded-xl shadow-sm border border-gray-100'>
					<div className='px-6 py-4 border-b border-gray-200'>
						<h3 className='text-lg font-semibold text-gray-900'>
							Заявки ({filteredApplications.length})
						</h3>
					</div>
					
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										ID
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Заголовок
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Тип
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Статус
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Заявитель
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Исполнитель
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Создана
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{filteredApplications.map((application) => (
									<tr key={application.id} className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
											#{application.id}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
											<div className='max-w-xs truncate'>
												{application.title}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{application.application_type?.display_name}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span 
												className='inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white'
												style={{ backgroundColor: application.status?.color }}
											>
												{application.status?.display_name}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{application.applicant?.full_name || application.applicant?.username}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{application.current_assignee?.full_name || application.current_assignee?.username || 'Не назначен'}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{new Date(application.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						
						{filteredApplications.length === 0 && (
							<div className='text-center py-12'>
								<div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
									<svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
									</svg>
								</div>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									Заявки не найдены
								</h3>
								<p className='text-gray-500'>
									Измените фильтры для поиска заявок
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Дополнительная статистика */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Статистика по статусам
						</h3>
						<div className='space-y-3'>
							{Object.entries(stats.byStatus).map(([status, count]) => (
								<div key={status} className='flex justify-between items-center'>
									<span className='text-sm text-gray-600'>{status}</span>
									<span className='text-sm font-semibold text-gray-900'>{count}</span>
								</div>
							))}
						</div>
					</div>

					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Статистика по типам
						</h3>
						<div className='space-y-3'>
							{Object.entries(stats.byType).map(([type, count]) => (
								<div key={type} className='flex justify-between items-center'>
									<span className='text-sm text-gray-600'>{type}</span>
									<span className='text-sm font-semibold text-gray-900'>{count}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ApplicationReports 