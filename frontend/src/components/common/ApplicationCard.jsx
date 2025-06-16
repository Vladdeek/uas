import React from 'react'
import Icon from './Icon'

const ApplicationCard = ({ 
	application, 
	onViewDetails, 
	onPerformAction, 
	userRole = '', 
	currentUserId = null,
	className = ''
}) => {
	// Функции для получения цветов статусов и приоритетов
	const getStatusInfo = (status) => {
		const statusMap = {
			draft: { 
				color: '#9CA3AF', 
				bgColor: 'bg-gray-50', 
				textColor: 'text-gray-700',
				icon: 'file-text'
			},
			pending: { 
				color: '#F59E0B', 
				bgColor: 'bg-amber-50', 
				textColor: 'text-amber-700',
				icon: 'circle'
			},
			in_review: { 
				color: '#3B82F6', 
				bgColor: 'bg-blue-50', 
				textColor: 'text-blue-700',
				icon: 'refresh-cw'
			},
			approved: { 
				color: '#10B981', 
				bgColor: 'bg-emerald-50', 
				textColor: 'text-emerald-700',
				icon: 'check'
			},
			rejected: { 
				color: '#EF4444', 
				bgColor: 'bg-red-50', 
				textColor: 'text-red-700',
				icon: 'ban'
			},
			completed: { 
				color: '#059669', 
				bgColor: 'bg-emerald-50', 
				textColor: 'text-emerald-700',
				icon: 'check'
			},
			cancelled: { 
				color: '#6B7280', 
				bgColor: 'bg-gray-50', 
				textColor: 'text-gray-700',
				icon: 'circle'
			}
		}
		return statusMap[status?.name] || statusMap.pending
	}

	const getPriorityInfo = (priority) => {
		const priorityMap = {
			urgent: { 
				color: '#DC2626', 
				bgColor: 'bg-red-100', 
				textColor: 'text-red-800',
				label: 'Срочно',
				icon: 'zap'
			},
			high: { 
				color: '#F59E0B', 
				bgColor: 'bg-amber-100', 
				textColor: 'text-amber-800',
				label: 'Высокий',
				icon: 'alert-triangle'
			},
			normal: { 
				color: '#3B82F6', 
				bgColor: 'bg-blue-100', 
				textColor: 'text-blue-800',
				label: 'Обычный',
				icon: 'circle'
			},
			low: { 
				color: '#6B7280', 
				bgColor: 'bg-gray-100', 
				textColor: 'text-gray-800',
				label: 'Низкий',
				icon: 'circle'
			}
		}
		return priorityMap[priority] || priorityMap.normal
	}

	const formatDate = (dateStr) => {
		if (!dateStr) return 'Не указана'
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	}

	const formatDateTime = (dateStr) => {
		if (!dateStr) return 'Не указана'
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	// Определяем права пользователя
	const canPerformActions = () => {
		if (userRole.includes('admin')) return true
		if (userRole === 'assigned' || userRole.includes('assigned')) {
			return application.current_assignee_id === currentUserId ||
				   application.assigned_departments?.some(dept => 
					   dept.employees?.some(emp => emp.user_id === currentUserId)
				   )
		}
		return false
	}

	const isApplicant = application.applicant_id === currentUserId
	const canCancel = isApplicant && !application.status?.is_final
	const canSubmit = isApplicant && application.status?.name === 'draft'

	const statusInfo = getStatusInfo(application.status)
	const priorityInfo = getPriorityInfo(application.priority)

	return (
		<div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${className}`}>
			{/* Заголовок карточки */}
			<div className="p-6 pb-4">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-3 mb-2">
							<div className={`flex-shrink-0 w-10 h-10 rounded-lg ${statusInfo.bgColor} flex items-center justify-center`}>
								<Icon name={statusInfo.icon} size={20} className={statusInfo.textColor} />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={application.title}>
									{application.title}
								</h3>
								<p className="text-sm text-gray-600 truncate">
									{application.application_type?.display_name}
								</p>
							</div>
						</div>
						
						{application.description && (
							<p className="text-sm text-gray-600 mb-3 line-clamp-2" title={application.description}>
								{application.description}
							</p>
						)}
					</div>
					
					<div className="flex flex-col items-end space-y-2 ml-4">
						<span 
							className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
						>
							<Icon name={statusInfo.icon} size={12} className="mr-1" />
							{application.status?.display_name}
						</span>
						<span 
							className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.textColor}`}
						>
							<Icon name={priorityInfo.icon} size={12} className="mr-1" />
							{priorityInfo.label}
						</span>
					</div>
				</div>

				{/* Метаинформация */}
				<div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
					<span className="flex items-center">
						<Icon name="file-text" size={14} className="mr-1" />
						#{application.id}
					</span>
					<span>•</span>
					<span className="flex items-center">
						<Icon name="calendar-days" size={14} className="mr-1" />
						{formatDate(application.created_at)}
					</span>
					{application.due_date && (
						<>
							<span>•</span>
							<span className="flex items-center text-amber-600">
								<Icon name="clock" size={14} className="mr-1" />
								Срок: {formatDate(application.due_date)}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Информация о людях */}
			<div className="px-6 pb-4">
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div className="flex items-start space-x-3">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
								<Icon name="user" size={16} className="text-blue-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-gray-600 text-xs mb-1">Заявитель</p>
								<p className="font-medium text-gray-900 truncate">
									{application.applicant?.full_name || application.applicant?.username}
								</p>
								<p className="text-xs text-gray-500 truncate">
									{application.applicant?.email}
								</p>
							</div>
						</div>
						
						{application.current_assignee && (
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
									<Icon name="user-pen" size={16} className="text-green-600" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-gray-600 text-xs mb-1">Исполнитель</p>
									<p className="font-medium text-gray-900 truncate">
										{application.current_assignee?.full_name || application.current_assignee?.username}
									</p>
									<p className="text-xs text-gray-500 truncate">
										{application.current_assignee?.email}
									</p>
								</div>
							</div>
						)}
						
						{!application.current_assignee && application.assigned_departments?.length > 0 && (
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
									<Icon name="building" size={16} className="text-purple-600" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-gray-600 text-xs mb-1">Назначено на</p>
									<p className="font-medium text-gray-900 text-xs">
										{application.assigned_departments.map(dept => dept.name).join(', ')}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Действия */}
			<div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
				<div className="flex items-center justify-between">
					<button
						onClick={() => onViewDetails(application)}
						className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
					>
						<Icon name="file-text" size={16} className="mr-2" />
						Подробнее
					</button>
					
					<div className="flex items-center space-x-2">
						{canSubmit && (
							<button
								onClick={() => onPerformAction(application, 'submit')}
								className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							>
								<Icon name="file-plus" size={14} className="mr-1" />
								Подать заявку
							</button>
						)}
						
						{canCancel && (
							<button
								onClick={() => onPerformAction(application, 'cancel')}
								className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<Icon name="ban" size={14} className="mr-1" />
								Отменить
							</button>
						)}
						
						{canPerformActions() && !application.status?.is_final && (
							<>
								<button
									onClick={() => onPerformAction(application, 'approve')}
									className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
								>
									<Icon name="check" size={14} className="mr-1" />
									Одобрить
								</button>
								<button
									onClick={() => onPerformAction(application, 'reject')}
									className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
								>
									<Icon name="ban" size={14} className="mr-1" />
									Отклонить
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ApplicationCard 