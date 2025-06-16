import React from 'react'
import Icon from './Icon.jsx'

export const BaseCard = ({ 
	children, 
	className = '',
	variant = 'default',
	hover = true,
	delay = 0,
	...props 
}) => {
	const variants = {
		default: 'bg-white border-gray-100',
		department: 'bg-white border-slate-200',
		role: 'bg-white border-gray-100'
	}

	return (
		<div 
			className={`
				${variants[variant]} 
				rounded-xl shadow-sm p-6 border 
				${hover ? 'hover:shadow-md transition-all duration-300 no-hover-scale group' : ''}
				${className}
			`}
			style={{ animationDelay: `${delay}ms` }}
			{...props}
		>
			{children}
		</div>
	)
}

// Карточка с заголовком и действиями
export const ActionCard = ({ 
	icon,
	title,
	subtitle,
	description,
	badge,
	actions,
	children,
	className = '',
	variant = 'default',
	delay = 0,
	onClick,
	...props
}) => {
	return (
		<BaseCard 
			variant={variant} 
			className={className} 
			delay={delay}
			onClick={onClick}
			{...props}
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center space-x-3 flex-1 min-w-0">
					{icon && (
						<div className={`flex-shrink-0 p-2 rounded-lg ${
							variant === 'role' ? 'bg-red-50' : 
							variant === 'department' ? 'bg-slate-100' : 'bg-blue-50'
						}`}>
							{typeof icon === 'string' ? (
								<Icon name={icon} size={24} className={
									variant === 'role' ? 'text-red-600' : 
									variant === 'department' ? 'text-slate-600' : 'text-blue-600'
								} />
							) : icon}
						</div>
					)}
					<div className="flex-1 min-w-0">
						<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
							{title}
						</h3>
						{subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
					</div>
				</div>
				
				{/* Badge */}
				{badge && (
					<div className="flex-shrink-0 ml-2">
						{badge}
					</div>
				)}
			</div>

			{/* Actions */}
			{actions && (
				<div className="flex justify-end mb-4">
					{actions}
				</div>
			)}

			{/* Content */}
			{description && (
				<div className="space-y-2 mb-4">
					<p className="text-sm text-gray-600">{description}</p>
				</div>
			)}

			{children}
		</BaseCard>
	)
}

// Статистическая карточка
export const StatCard = ({ 
	title, 
	value, 
	icon, 
	color = 'blue',
	trend,
	className = ''
}) => {
	const colors = {
		blue: 'bg-blue-50 text-blue-600',
		red: 'bg-red-50 text-red-600',
		green: 'bg-green-50 text-green-600',
		yellow: 'bg-yellow-50 text-yellow-600',
		purple: 'bg-purple-50 text-purple-600'
	}

	return (
		<BaseCard className={`${className}`} hover={false}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-2xl font-bold text-gray-900">{value}</p>
					{trend && (
						<p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
							{trend.value}
						</p>
					)}
				</div>
				{icon && (
					<div className={`p-3 rounded-lg ${colors[color]}`}>
						<Icon name={icon} size={24} />
					</div>
				)}
			</div>
		</BaseCard>
	)
} 