import React from 'react'
import Icon from './Icon.jsx'
import Loader from './Loader.jsx'

// Заголовок страницы
export const PageHeader = ({ 
	title, 
	subtitle, 
	icon, 
	iconColor = '#770002',
	actions,
	breadcrumbs,
	className = ''
}) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
			{breadcrumbs && (
				<nav className="flex mb-4" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2">
						{breadcrumbs.map((crumb, index) => (
							<li key={index} className="flex items-center">
								{index > 0 && <Icon name="chevron-right" size={16} className="text-gray-400 mx-2" />}
								{crumb.href ? (
									<a href={crumb.href} className="text-sm text-gray-500 hover:text-gray-700">
										{crumb.label}
									</a>
								) : (
									<span className="text-sm text-gray-900">{crumb.label}</span>
								)}
							</li>
						))}
					</ol>
				</nav>
			)}

			<div className="flex items-center justify-between">
				<div className="flex items-center">
					{icon && (
						<div 
							className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
							style={{ backgroundColor: `${iconColor}20` }}
						>
							<Icon name={icon} size={24} style={{ color: iconColor }} />
						</div>
					)}
					<div>
						<h1 className="text-2xl font-bold text-slate-900">{title}</h1>
						{subtitle && <p className="text-slate-600">{subtitle}</p>}
					</div>
				</div>
				{actions && (
					<div className="flex items-center space-x-3">
						{actions}
					</div>
				)}
			</div>
		</div>
	)
}

// Секция с заголовком
export const Section = ({ 
	title, 
	subtitle,
	icon,
	actions,
	children,
	className = '',
	contentClassName = ''
}) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
			{(title || actions) && (
				<div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
					<div className="flex items-center space-x-3">
						{icon && <Icon name={icon} size={20} className="text-slate-600" />}
						<div>
							<h2 className="text-lg font-semibold text-slate-900">{title}</h2>
							{subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
						</div>
					</div>
					{actions && (
						<div className="flex items-center space-x-3">
							{actions}
						</div>
					)}
				</div>
			)}
			<div className={`p-6 ${contentClassName}`}>
				{children}
			</div>
		</div>
	)
}

// Контейнер для табов
export const TabContainer = ({ 
	tabs, 
	activeTab, 
	onTabChange,
	children,
	variant = 'default', // 'default', 'pills'
	className = ''
}) => {
	if (variant === 'pills') {
		return (
			<div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
				<div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => onTabChange(tab.key)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
								activeTab === tab.key
									? 'bg-white shadow-sm text-red-600'
									: 'text-slate-500 hover:text-slate-700'
							}`}
						>
							{tab.icon && <Icon name={tab.icon} size={16} />}
							{tab.label}
						</button>
					))}
				</div>
				{children}
			</div>
		)
	}

	return (
		<div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
			<div className="border-b border-slate-200">
				<nav className="flex space-x-8 px-6" aria-label="Tabs">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => onTabChange(tab.key)}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-3 ${
								activeTab === tab.key
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
							}`}
						>
							{tab.icon && <Icon name={tab.icon} size={16} />}
							<div className="text-left">
								<div>{tab.label}</div>
								{tab.description && (
									<div className="text-xs text-slate-400 font-normal">{tab.description}</div>
								)}
							</div>
							{tab.badge && (
								<span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
									{tab.badge}
								</span>
							)}
						</button>
					))}
				</nav>
			</div>
			<div className="p-6">
				{children}
			</div>
		</div>
	)
}

// Статистические блоки
export const StatsGrid = ({ 
	stats, 
	columns = 4,
	className = ''
}) => {
	const gridCols = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
		5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
		6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
	}

	return (
		<div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
			{stats.map((stat, index) => (
				<div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-600 break-words">{stat.title || stat.label}</p>
							<p className="text-2xl font-bold" style={{ color: stat.color || '#770002' }}>
								{stat.value}
							</p>
							{stat.change && (
								<p className={`text-sm ${stat.change.positive ? 'text-green-600' : 'text-red-600'}`}>
									{stat.change.value}
								</p>
							)}
						</div>
						{stat.icon && (
							<div 
								className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
								style={{ backgroundColor: `${stat.color || '#770002'}20` }}
							>
								<Icon name={stat.icon} size={20} style={{ color: stat.color || '#770002' }} />
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}

// Пустое состояние
export const EmptyState = ({ 
	icon = 'file-text',
	title = 'Нет данных',
	description = 'Данные для отображения отсутствуют',
	action,
	className = ''
}) => {
	return (
		<div className={`text-center py-12 ${className}`}>
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<Icon name={icon} size={32} className="text-gray-400" />
			</div>
			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-500 mb-6">{description}</p>
			{action && action}
		</div>
	)
}

// Состояние загрузки
export const LoadingState = ({ 
	text = 'Загрузка...',
	size = 'md',
	variant = 'honeycomb',
	className = ''
}) => {
	return (
		<div className={`flex justify-center items-center py-12 ${className}`}>
			<Loader 
				text={text} 
				size={size} 
				variant={variant}
				centered={false}
			/>
		</div>
	)
}

// Состояние ошибки
export const ErrorState = ({ 
	title = 'Произошла ошибка',
	description = 'Не удалось загрузить данные',
	onRetry,
	className = ''
}) => {
	return (
		<div className={`text-center py-12 ${className}`}>
			<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<Icon name="alert-triangle" size={32} className="text-red-500" />
			</div>
			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-500 mb-6">{description}</p>
			{onRetry && (
				<button
					onClick={onRetry}
					className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
				>
					<Icon name="refresh-cw" size={16} />
					<span>Попробовать снова</span>
				</button>
			)}
		</div>
	)
}

// Фильтры
export const FilterSection = ({ 
	title = 'Фильтры',
	children,
	clearFilters,
	exportAction,
	className = ''
}) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
			<div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
				<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
				<div className="flex space-x-3">
					{clearFilters && (
						<button
							onClick={clearFilters}
							className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
						>
							Очистить
						</button>
					)}
					{exportAction && exportAction}
				</div>
			</div>
			<div className="p-6">
				{children}
			</div>
		</div>
	)
}

// Контейнер с действиями
export const ActionsContainer = ({ 
	children, 
	className = '',
	alignment = 'right' // 'left', 'center', 'right', 'between'
}) => {
	const alignments = {
		left: 'justify-start',
		center: 'justify-center', 
		right: 'justify-end',
		between: 'justify-between'
	}

	return (
		<div className={`flex items-center space-x-3 ${alignments[alignment]} ${className}`}>
			{children}
		</div>
	)
} 