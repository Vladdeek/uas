import React from 'react'
import Icon from './Icon.jsx'

// Базовый модальный компонент с правильной поддержкой скроллинга
export const BaseModal = ({ 
	isOpen, 
	onClose, 
	title, 
	subtitle, 
	icon, 
	headerColor = '#820000',
	maxWidth = 'max-w-md',
	maxHeight = 'max-h-[90vh]',
	children,
	className = '',
	closable = true,
	scrollable = true
}) => {
	if (!isOpen) return null

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget && closable && onClose) {
			onClose()
		}
	}

	return (
		<div 
			className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-5 overflow-y-auto"
			onClick={handleBackdropClick}
		>
			<div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} ${maxHeight} w-full my-8 transform transition-all duration-300 scale-100 opacity-100 flex flex-col ${className}`}>
				{/* Header - всегда фиксированная */}
				<div 
					className="text-white px-6 py-4 rounded-t-2xl flex-shrink-0"
					style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}
				>
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							{icon && (
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
									<Icon name={icon} size={16} color="white" />
								</div>
							)}
							<div>
								<h2 className="text-xl font-bold">{title}</h2>
								{subtitle && <p className="text-white text-opacity-80 text-sm">{subtitle}</p>}
							</div>
						</div>
						{closable && onClose && (
							<button 
								onClick={onClose}
								className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
							>
								<Icon name="x" size={20} color="white" />
							</button>
						)}
					</div>
				</div>

				{/* Content - скроллируемый контент */}
				<div className={`flex-1 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'} p-6`}>
					{children}
				</div>
			</div>
		</div>
	)
}

// Модальное окно для форм с поддержкой скроллинга
export const FormModal = ({ 
	isOpen, 
	onClose, 
	title, 
	subtitle,
	icon,
	onSubmit, 
	loading = false,
	submitText = 'Сохранить',
	cancelText = 'Отмена',
	headerColor = '#820000',
	maxWidth = 'max-w-md',
	maxHeight = 'max-h-[90vh]',
	children,
	className = '',
	showFooter = true,
	closable = true,
	scrollable = true
}) => {
	if (!isOpen) return null

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget && closable && onClose) {
			onClose()
		}
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSubmit && onSubmit(e)
	}

	return (
		<div 
			className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-5 overflow-y-auto"
			onClick={handleBackdropClick}
		>
			<div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} ${maxHeight} w-full my-8 transform transition-all duration-300 scale-100 opacity-100 flex flex-col ${className}`}>
				{/* Header */}
				<div 
					className="text-white px-6 py-4 rounded-t-2xl flex-shrink-0"
					style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}
				>
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							{icon && (
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
									<Icon name={icon} size={16} color="white" />
								</div>
							)}
							<div>
								<h2 className="text-xl font-bold">{title}</h2>
								{subtitle && <p className="text-white text-opacity-80 text-sm">{subtitle}</p>}
							</div>
						</div>
						{closable && onClose && (
							<button 
								onClick={onClose}
								className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
							>
								<Icon name="x" size={20} color="white" />
							</button>
						)}
					</div>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
					<div className={`flex-1 p-6 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
						<div className="space-y-4">
							{children}
						</div>
					</div>
					
					{/* Footer - всегда видимый */}
					{showFooter && (
						<div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
							{closable && onClose && (
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
									disabled={loading}
								>
									{cancelText}
								</button>
							)}
							<button
								type="submit"
								disabled={loading}
								className="px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
								style={{ backgroundColor: headerColor }}
							>
								{loading && <Icon name="refresh-cw" size={16} className="animate-spin" />}
								<span>{loading ? 'Сохранение...' : submitText}</span>
							</button>
						</div>
					)}
				</form>
			</div>
		</div>
	)
}

// Модальное окно для просмотра деталей с поддержкой скроллинга
export const DetailModal = ({ 
	isOpen, 
	onClose, 
	title, 
	subtitle,
	icon = 'info',
	headerColor = '#2563eb',
	maxWidth = 'max-w-2xl',
	maxHeight = 'max-h-[90vh]',
	actions,
	children,
	className = '',
	scrollable = true
}) => {
	if (!isOpen) return null

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget && onClose) {
			onClose()
		}
	}

	return (
		<div 
			className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-5 overflow-y-auto"
			onClick={handleBackdropClick}
		>
			<div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} ${maxHeight} w-full my-8 transform transition-all duration-300 scale-100 opacity-100 flex flex-col ${className}`}>
				{/* Header */}
				<div 
					className="text-white px-6 py-4 rounded-t-2xl flex-shrink-0"
					style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}
				>
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							{icon && (
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
									<Icon name={icon} size={16} color="white" />
								</div>
							)}
							<div>
								<h2 className="text-xl font-bold">{title}</h2>
								{subtitle && <p className="text-white text-opacity-80 text-sm">{subtitle}</p>}
							</div>
						</div>
						{onClose && (
							<button 
								onClick={onClose}
								className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
							>
								<Icon name="x" size={20} color="white" />
							</button>
						)}
					</div>
				</div>

				{/* Content */}
				<div className={`flex-1 p-6 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
					<div className="space-y-6">
						{children}
					</div>
				</div>
				
				{/* Actions */}
				{actions && (
					<div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
						{actions}
					</div>
				)}
			</div>
		</div>
	)
}

// Модальное окно подтверждения
export const ConfirmModal = ({ 
	isOpen, 
	onClose, 
	onConfirm,
	title = 'Подтверждение',
	message,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	type = 'danger', // 'danger', 'warning', 'info', 'success'
	loading = false
}) => {
	const colors = {
		danger: '#dc2626',
		warning: '#d97706',
		info: '#2563eb',
		success: '#059669'
	}

	const icons = {
		danger: 'alert-triangle',
		warning: 'alert-triangle',
		info: 'info',
		success: 'check-circle'
	}

	return (
		<BaseModal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			icon={icons[type]}
			headerColor={colors[type]}
			maxWidth="max-w-sm"
			maxHeight="max-h-[50vh]"
			scrollable={false}
		>
			<div className="space-y-4">
				<p className="text-gray-700">{message}</p>
				
				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
						disabled={loading}
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={loading}
						className="px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
						style={{ backgroundColor: colors[type] }}
					>
						{loading && <Icon name="refresh-cw" size={16} className="animate-spin" />}
						<span>{loading ? 'Обработка...' : confirmText}</span>
					</button>
				</div>
			</div>
		</BaseModal>
	)
}

// Большое модальное окно для сложных форм с полноценным скроллингом
export const LargeModal = ({ 
	isOpen, 
	onClose, 
	title, 
	subtitle,
	icon,
	headerColor = '#820000',
	children,
	className = '',
	fullScreen = false,
	scrollable = true
}) => {
	if (!isOpen) return null

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget && onClose) {
			onClose()
		}
	}

	const maxWidthClass = fullScreen ? 'max-w-7xl' : 'max-w-4xl'
	const maxHeightClass = fullScreen ? 'max-h-[95vh]' : 'max-h-[90vh]'
	
	return (
		<div 
			className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-5 overflow-y-auto"
			onClick={handleBackdropClick}
		>
			<div className={`bg-white rounded-2xl shadow-2xl ${maxWidthClass} ${maxHeightClass} w-full my-8 transform transition-all duration-300 scale-100 opacity-100 flex flex-col ${className}`}>
				{/* Header */}
				<div 
					className="text-white px-6 py-4 rounded-t-2xl flex-shrink-0"
					style={{ background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)` }}
				>
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							{icon && (
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
									<Icon name={icon} size={16} color="white" />
								</div>
							)}
							<div>
								<h2 className="text-xl font-bold">{title}</h2>
								{subtitle && <p className="text-white text-opacity-80 text-sm">{subtitle}</p>}
							</div>
						</div>
						{onClose && (
							<button 
								onClick={onClose}
								className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
							>
								<Icon name="x" size={20} color="white" />
							</button>
						)}
					</div>
				</div>

				{/* Content */}
				<div className={`flex-1 p-6 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
					{children}
				</div>
			</div>
		</div>
	)
} 