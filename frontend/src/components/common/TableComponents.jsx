import React from 'react'
import Icon from './Icon.jsx'
import { SkeletonRow } from './SkeletonComponents.jsx'

// Базовая таблица
export const BaseTable = ({ 
	headers, 
	children, 
	className = '',
	loading = false,
	loadingRows = 5
}) => {
	return (
		<div className={`overflow-x-auto ${className}`}>
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						{headers.map((header, index) => (
							<th
								key={index}
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{loading ? (
						Array.from({ length: loadingRows }, (_, index) => (
							<SkeletonRow key={index} delay={index * 100} columns={headers.length} />
						))
					) : (
						children
					)}
				</tbody>
			</table>
		</div>
	)
}

// Строка таблицы с действиями
export const TableRow = ({ 
	children, 
	onClick, 
	className = '',
	hover = true 
}) => {
	return (
		<tr 
			className={`
				${hover ? 'table-row-hover hover:bg-gray-50 cursor-pointer' : ''}
				${className}
			`}
			onClick={onClick}
		>
			{children}
		</tr>
	)
}

// Ячейка с аватаром и информацией
export const AvatarCell = ({ 
	user, 
	showEmail = true,
	avatarSize = 'w-10 h-10'
}) => {
	const generateAvatarUrl = (user) => {
		const initials = user.full_name || user.username
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=820000&color=fff&size=128`
	}

	return (
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="flex items-center space-x-3">
				<img
					src={generateAvatarUrl(user)}
					alt={user.full_name || user.username}
					className={`${avatarSize} rounded-full ring-2 ring-gray-200`}
				/>
				<div>
					<div className="text-sm font-medium text-gray-900">
						{user.full_name || user.username}
					</div>
					{showEmail && user.email && (
						<div className="text-sm text-gray-500">{user.email}</div>
					)}
				</div>
			</div>
		</td>
	)
}

// Ячейка с бейджами/тегами
export const BadgeCell = ({ 
	badges = [], 
	maxVisible = 3,
	color = 'blue'
}) => {
	const colors = {
		blue: 'bg-blue-100 text-blue-800',
		red: 'bg-red-100 text-red-800',
		green: 'bg-green-100 text-green-800',
		yellow: 'bg-yellow-100 text-yellow-800',
		gray: 'bg-gray-100 text-gray-800'
	}

	const visibleBadges = badges.slice(0, maxVisible)
	const hiddenCount = badges.length - maxVisible

	return (
		<td className="px-6 py-4 whitespace-nowrap">
			<div className="flex flex-wrap gap-1">
				{visibleBadges.map((badge, index) => (
					<span
						key={index}
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
							colors[badge.color || color]
						}`}
					>
						{badge.icon && <Icon name={badge.icon} size={12} className="mr-1" />}
						{badge.label || badge}
					</span>
				))}
				{hiddenCount > 0 && (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						+{hiddenCount}
					</span>
				)}
			</div>
		</td>
	)
}

// Ячейка со статусом
export const StatusCell = ({ 
	status, 
	variant = 'default' // 'default', 'dot', 'badge'
}) => {
	const getStatusColor = (status) => {
		const statusLower = status?.toLowerCase?.() || ''
		if (statusLower.includes('active') || statusLower.includes('активн')) return 'green'
		if (statusLower.includes('pending') || statusLower.includes('ожидан')) return 'yellow'
		if (statusLower.includes('rejected') || statusLower.includes('отклон')) return 'red'
		if (statusLower.includes('draft') || statusLower.includes('черновик')) return 'gray'
		return 'blue'
	}

	const color = getStatusColor(status)
	const colors = {
		green: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
		yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
		red: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-400' },
		blue: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-400' },
		gray: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' }
	}

	return (
		<td className="px-6 py-4 whitespace-nowrap">
			{variant === 'dot' ? (
				<div className="flex items-center space-x-2">
					<div className={`w-2 h-2 rounded-full ${colors[color].dot}`}></div>
					<span className="text-sm text-gray-900">{status}</span>
				</div>
			) : variant === 'badge' ? (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color].bg} ${colors[color].text}`}>
					{status}
				</span>
			) : (
				<span className="text-sm text-gray-900">{status}</span>
			)}
		</td>
	)
}

// Ячейка с действиями
export const ActionsCell = ({ 
	actions = [], 
	compact = false 
}) => {
	return (
		<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
			<div className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'} justify-end`}>
				{actions.map((action, index) => (
					<button
						key={index}
						onClick={action.onClick}
						className={`
							${compact ? 'p-1' : 'p-2'} 
							text-gray-400 hover:text-gray-600 transition-colors duration-200
							${action.className || ''}
						`}
						title={action.title}
						disabled={action.disabled}
					>
						<Icon 
							name={action.icon} 
							size={compact ? 14 : 16} 
							className={action.iconClassName}
						/>
					</button>
				))}
			</div>
		</td>
	)
}

// Ячейка с датой
export const DateCell = ({ 
	date, 
	format = 'default', // 'default', 'relative', 'short'
	className = ''
}) => {
	const formatDate = (dateStr) => {
		if (!dateStr) return '—'
		
		const date = new Date(dateStr)
		
		switch (format) {
			case 'relative':
				const now = new Date()
				const diff = now - date
				const days = Math.floor(diff / (1000 * 60 * 60 * 24))
				if (days === 0) return 'Сегодня'
				if (days === 1) return 'Вчера'
				if (days < 7) return `${days} дн. назад`
				if (days < 30) return `${Math.floor(days / 7)} нед. назад`
				return date.toLocaleDateString('ru-RU')
			
			case 'short':
				return date.toLocaleDateString('ru-RU')
			
			default:
				return date.toLocaleString('ru-RU')
		}
	}

	return (
		<td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
			{formatDate(date)}
		</td>
	)
}

// Пустое состояние таблицы
export const EmptyTableState = ({ 
	icon = 'file-text',
	title = 'Нет данных',
	description = 'Данные для отображения отсутствуют',
	action,
	className = ''
}) => {
	return (
		<tr>
			<td colSpan="100%" className={`px-6 py-12 text-center ${className}`}>
				<div className="flex flex-col items-center space-y-4">
					<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
						<Icon name={icon} size={24} className="text-gray-400" />
					</div>
					<div>
						<h3 className="text-lg font-medium text-gray-900">{title}</h3>
						<p className="text-gray-500">{description}</p>
					</div>
					{action && (
						<div className="pt-2">
							{action}
						</div>
					)}
				</div>
			</td>
		</tr>
	)
}

// Фильтры для таблицы
export const TableFilters = ({ 
	searchValue,
	onSearchChange,
	filters = [],
	onFilterChange,
	className = ''
}) => {
	return (
		<div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6 ${className}`}>
			{/* Поиск */}
			<div className="flex-1 max-w-md">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon name="search" size={16} className="text-gray-400" />
					</div>
					<input
						type="text"
						placeholder="Поиск..."
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value)}
						className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200"
					/>
				</div>
			</div>

			{/* Фильтры */}
			{filters.length > 0 && (
				<div className="flex space-x-2">
					{filters.map((filter, index) => (
						<select
							key={index}
							value={filter.value}
							onChange={(e) => onFilterChange(filter.key, e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200"
						>
							<option value="">{filter.placeholder}</option>
							{filter.options.map((option, optIndex) => (
								<option key={optIndex} value={option.value || option}>
									{option.label || option}
								</option>
							))}
						</select>
					))}
				</div>
			)}
		</div>
	)
} 