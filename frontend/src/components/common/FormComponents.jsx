import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'

// Базовые стили для полей ввода
const baseInputStyles = {
	border: '1px solid #d1d5db',
	borderRadius: '8px',
	padding: '8px 12px',
	width: '100%',
	transition: 'all 0.2s'
}

const focusColor = '#770002'

// Универсальное поле ввода
export const FormInput = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	className = '',
	...props 
}) => {
	const handleFocus = (e) => {
		e.target.style.borderColor = focusColor
		e.target.style.boxShadow = `0 0 0 2px ${focusColor}40`
	}

	const handleBlur = (e) => {
		e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'
		e.target.style.boxShadow = 'none'
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<input
				{...props}
				required={required}
				className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors duration-200 ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
				style={baseInputStyles}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Поле для текстовой области
export const FormTextarea = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	rows = 3,
	className = '',
	...props 
}) => {
	const handleFocus = (e) => {
		e.target.style.borderColor = focusColor
		e.target.style.boxShadow = `0 0 0 2px ${focusColor}40`
	}

	const handleBlur = (e) => {
		e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'
		e.target.style.boxShadow = 'none'
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<textarea
				{...props}
				required={required}
				rows={rows}
				className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors duration-200 ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
				style={baseInputStyles}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Поле выбора
export const FormSelect = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	options = [],
	placeholder = 'Выберите...',
	className = '',
	...props 
}) => {
	const handleFocus = (e) => {
		e.target.style.borderColor = focusColor
		e.target.style.boxShadow = `0 0 0 2px ${focusColor}40`
	}

	const handleBlur = (e) => {
		e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'
		e.target.style.boxShadow = 'none'
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<select
				{...props}
				required={required}
				className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors duration-200 ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
				style={baseInputStyles}
				onFocus={handleFocus}
				onBlur={handleBlur}
			>
				<option value="">{placeholder}</option>
				{options.map((option, index) => (
					<option key={index} value={option.value || option}>
						{option.label || option}
					</option>
				))}
			</select>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Группа чекбоксов
export const FormCheckboxGroup = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	options = [],
	value = [],
	onChange,
	className = ''
}) => {
	const handleChange = (optionValue, checked) => {
		const newValue = checked 
			? [...value, optionValue]
			: value.filter(v => v !== optionValue)
		onChange && onChange(newValue)
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<div className="space-y-2">
				{options.map((option, index) => (
					<label key={index} className="flex items-center">
						<input
							type="checkbox"
							checked={value.includes(option.value || option)}
							onChange={(e) => handleChange(option.value || option, e.target.checked)}
							className="mr-2"
							style={{ accentColor: focusColor }}
						/>
						<span className="text-sm text-gray-700">{option.label || option}</span>
					</label>
				))}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Группа радиокнопок
export const FormRadioGroup = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	options = [],
	value,
	onChange,
	name,
	className = ''
}) => {
	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<div className="space-y-2">
				{options.map((option, index) => (
					<label key={index} className="flex items-center">
						<input
							type="radio"
							name={name}
							value={option.value || option}
							checked={value === (option.value || option)}
							onChange={(e) => onChange && onChange(e.target.value)}
							className="mr-2"
							style={{ accentColor: focusColor }}
						/>
						<span className="text-sm text-gray-700">{option.label || option}</span>
					</label>
				))}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Универсальный рендерер полей на основе типа
export const FormFieldRenderer = ({ field, value, onChange, error }) => {
	const { name, label, type: fieldType, required, options, placeholder } = field

	// Отладочная информация
	console.log('FormFieldRenderer:', { name, fieldType, field })

	const commonProps = {
		value: value || '',
		onChange: (e) => onChange(name, e.target.value),
		label,
		required,
		error,
		placeholder
	}

	switch (fieldType) {
		case 'text':
		case 'email':
		case 'tel':
		case 'url':
			return <FormInput {...commonProps} type={fieldType} />
		
		case 'number':
			return <FormInput {...commonProps} type="number" />
		
		case 'password':
			return <FormInput {...commonProps} type="password" />
		
		case 'date':
			return <FormInput {...commonProps} type="date" />
		
		case 'textarea':
			return <FormTextarea {...commonProps} onChange={(e) => onChange(name, e.target.value)} />
		
		case 'select':
			return (
				<FormSelectWithSearch
					{...commonProps} 
					options={options || []}
					onChange={(e) => onChange(name, e.target.value)}
					searchPlaceholder="Поиск варианта..."
				/>
			)
		
		case 'checkbox':
			return (
				<FormCheckboxGroup
					{...commonProps}
					options={options || []}
					value={value || []}
					onChange={(newValue) => onChange(name, newValue)}
				/>
			)
		
		case 'radio':
			return (
				<FormRadioGroup
					{...commonProps}
					options={options || []}
					name={name}
					onChange={(newValue) => onChange(name, newValue)}
				/>
			)

		case 'file':
			return (
				<FormFileUpload
					label={label}
					required={required}
					error={error}
					multiple={field.multiple || false}
					accept={field.accept || '*/*'}
					value={value || []}
					onChange={(newValue) => onChange(name, newValue)}
					onUpload={field.onUpload}
					uploading={field.uploading || false}
				/>
			)
		
		default:
			return (
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-yellow-800">Неподдерживаемый тип поля: {fieldType}</p>
				</div>
			)
	}
}

// Кнопка с иконкой и состояниями загрузки
export const FormButton = ({ 
	type = 'button',
	variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
	size = 'md', // 'sm', 'md', 'lg'
	loading = false,
	disabled = false,
	icon,
	children,
	className = '',
	...props
}) => {
	const variants = {
		primary: 'text-white hover:opacity-90',
		secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
		danger: 'text-white hover:opacity-90',
		success: 'bg-green-600 text-white hover:bg-green-700'
	}

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	}

	const getButtonStyle = () => {
		if (variant === 'primary' || variant === 'danger') {
			return {
				backgroundColor: '#770002',
				transition: 'all 0.2s'
			}
		}
		return {}
	}

	const handleMouseEnter = (e) => {
		if (variant === 'primary' || variant === 'danger') {
			e.target.style.backgroundColor = '#550001'
		}
	}

	const handleMouseLeave = (e) => {
		if (variant === 'primary' || variant === 'danger') {
			e.target.style.backgroundColor = '#770002'
		}
	}

	return (
		<button
			{...props}
			type={type}
			disabled={disabled || loading}
			style={getButtonStyle()}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`
				${variants[variant]} 
				${sizes[size]} 
				rounded-lg transition-all duration-200 disabled:opacity-50 
				flex items-center space-x-2 font-medium
				${className}
			`}
		>
			{loading ? (
				<Icon name="refresh-cw" size={16} className="animate-spin" />
			) : icon ? (
				<Icon name={icon} size={16} />
			) : null}
			<span>{children}</span>
		</button>
	)
}

// Компонент для загрузки файлов
export const FormFileUpload = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	multiple = false,
	accept,
	value = [], // массив загруженных файлов
	onChange,
	onUpload, // функция для загрузки файла
	uploading = false,
	className = ''
}) => {
	const fileInputRef = React.useRef(null)

	const handleFileSelect = async (e) => {
		const files = Array.from(e.target.files)
		if (files.length === 0) return

		// Если поддерживается загрузка одного файла и выбрано несколько - берем первый
		const filesToUpload = multiple ? files : [files[0]]

		// Загружаем файлы
		for (const file of filesToUpload) {
			if (onUpload) {
				await onUpload(file)
			}
		}

		// Очищаем input
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleRemoveFile = (fileId) => {
		const newValue = value.filter(file => file.id !== fileId)
		onChange && onChange(newValue)
	}

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			
			{/* Кнопка загрузки */}
			<div className="flex items-center space-x-2">
				<input
					ref={fileInputRef}
					type="file"
					multiple={multiple}
					accept={accept}
					onChange={handleFileSelect}
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading}
					className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
				>
					<Icon name={uploading ? "refresh-cw" : "file-plus"} size={16} className={uploading ? "animate-spin" : ""} />
					<span>{uploading ? 'Загрузка...' : 'Выбрать файл'}</span>
				</button>
			</div>

			{/* Список загруженных файлов */}
			{value && value.length > 0 && (
				<div className="space-y-2">
					{value.map(file => (
						<div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center space-x-3">
								<Icon name="file-text" size="w-5 h-5" className="text-gray-500" />
								<div>
									<div className="text-sm font-medium text-gray-900">{file.filename}</div>
									{file.file_size && (
										<div className="text-xs text-gray-500">{formatFileSize(file.file_size)}</div>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleRemoveFile(file.id)}
								className="text-red-500 hover:text-red-700"
							>
								<Icon name="x" size="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}

			{error && <p className="text-sm text-red-600">{error}</p>}
			{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
		</div>
	)
}

// Поле выбора с поиском
export const FormSelectWithSearch = ({ 
	label, 
	required = false, 
	error = null,
	helpText = null,
	options = [],
	placeholder = 'Выберите...',
	searchPlaceholder = 'Поиск...',
	value,
	onChange,
	className = '',
	...props 
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [filteredOptions, setFilteredOptions] = useState(options)
	const [dropdownPosition, setDropdownPosition] = useState({})
	const dropdownRef = useRef(null)
	const buttonRef = useRef(null)

	// Фильтрация опций по поисковому запросу
	useEffect(() => {
		if (!searchTerm) {
			setFilteredOptions(options)
		} else {
			const filtered = options.filter(option => {
				const label = option.label || option
				const value = option.value || option
				return label.toLowerCase().includes(searchTerm.toLowerCase()) ||
					   value.toString().toLowerCase().includes(searchTerm.toLowerCase())
			})
			setFilteredOptions(filtered)
		}
	}, [searchTerm, options])

	// Расчет позиции выпадающего списка
	const calculatePosition = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			setDropdownPosition({
				top: rect.bottom + 4,
				left: rect.left,
				width: rect.width
			})
		}
	}

	// Закрытие при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
				buttonRef.current && !buttonRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleOptionSelect = (option) => {
		const optionValue = option.value || option
		onChange && onChange({ target: { value: optionValue } })
		setIsOpen(false)
		setSearchTerm('')
	}

	const selectedOption = options.find(opt => (opt.value || opt) == value)
	const displayText = selectedOption ? (selectedOption.label || selectedOption) : placeholder

	return (
		<>
			<div className={`space-y-2 ${className}`}>
				{label && (
					<label className="block text-sm font-medium text-gray-700">
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}
				<div className="relative">
					{/* Главная кнопка выбора */}
					<button
						ref={buttonRef}
						type="button"
						onClick={() => {
							calculatePosition()
							setIsOpen(!isOpen)
						}}
						className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors duration-200 bg-white flex items-center justify-between ${
							error ? 'border-red-500' : 'border-gray-300'
						}`}
					>
						<span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
							{displayText}
						</span>
						<Icon 
							name="chevron-down" 
							size={16} 
							className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						/>
					</button>
				</div>
				{error && <p className="text-sm text-red-600">{error}</p>}
				{helpText && <p className="text-xs text-gray-500">{helpText}</p>}
			</div>

			{/* Выпадающий список через портал */}
			{isOpen && createPortal(
				<div 
					ref={dropdownRef}
					className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl"
					style={{
						zIndex: 2147483647,
						top: dropdownPosition.top,
						left: dropdownPosition.left,
						width: dropdownPosition.width
					}}
				>
					{/* Поле поиска */}
					<div className="p-2 border-b border-gray-200">
						<div className="relative">
							<Icon name="search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder={searchPlaceholder}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors duration-200"
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>

					{/* Список опций */}
					<div className="max-h-60 overflow-y-auto">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-2 text-gray-500 text-sm">
								{searchTerm ? 'Ничего не найдено' : 'Нет доступных вариантов'}
							</div>
						) : (
							filteredOptions.map((option, index) => {
								const optionValue = option.value || option
								const isSelected = optionValue == value
								return (
									<button
										key={index}
										type="button"
										onClick={() => handleOptionSelect(option)}
										className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-200 ${
											isSelected ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-900'
										}`}
									>
										{option.label || option}
									</button>
								)
							})
						)}
					</div>
				</div>,
				document.body
			)}
		</>
	)
}