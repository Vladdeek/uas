import React, { useState } from 'react'
import Icon from './Icon'

// Компонент для создания продвинутого роутинга
export const AdvancedRoutingBuilder = ({ 
	routing, 
	setRouting, 
	users, 
	roles, 
	departments,
	className = '' 
}) => {
	const [activeMode, setActiveMode] = useState(routing?.type || 'auto')

	const routingModes = [
		{ key: 'auto', label: 'Автоматическое назначение', icon: 'zap', description: 'Система автоматически определит исполнителя' },
		{ key: 'manual', label: 'Ручное назначение', icon: 'user', description: 'Заявки создаются без исполнителя' },
		{ key: 'mixed', label: 'Комбинированное', icon: 'git-fork', description: 'Настраиваемые правила назначения' }
	]

	const handleModeChange = (mode) => {
		setActiveMode(mode)
		
		if (mode === 'auto') {
			setRouting({ type: 'auto' })
		} else if (mode === 'manual') {
			setRouting({ type: 'manual' })
		} else if (mode === 'mixed') {
			setRouting({ 
				type: 'mixed', 
				targets: routing?.targets || []
			})
		}
	}

	const addTarget = () => {
		const newTarget = {
			id: Date.now(),
			type: 'user', // user, role, department
			value: '',
			priority: 'normal'
		}
		
		setRouting({
			...routing,
			targets: [...(routing.targets || []), newTarget]
		})
	}

	const updateTarget = (id, field, value) => {
		setRouting({
			...routing,
			targets: routing.targets.map(target => 
				target.id === id ? { ...target, [field]: value } : target
			)
		})
	}

	const removeTarget = (id) => {
		setRouting({
			...routing,
			targets: routing.targets.filter(target => target.id !== id)
		})
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Выбор режима роутинга */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">
					Тип роутинга
				</label>
				<div className="grid grid-cols-1 gap-3">
					{routingModes.map(mode => (
						<div 
							key={mode.key}
							className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
								activeMode === mode.key 
									? 'border-[#770002] bg-red-50' 
									: 'border-gray-200 hover:border-gray-300'
							}`}
							onClick={() => handleModeChange(mode.key)}
						>
							<div className="flex items-start space-x-3">
								<Icon 
									name={mode.icon} 
									className={`w-5 h-5 mt-0.5 ${
										activeMode === mode.key ? 'text-[#770002]' : 'text-gray-500'
									}`} 
								/>
								<div className="flex-1">
									<div className={`font-medium ${
										activeMode === mode.key ? 'text-[#770002]' : 'text-gray-900'
									}`}>
										{mode.label}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										{mode.description}
									</div>
								</div>
								<div className={`w-4 h-4 rounded-full border-2 ${
									activeMode === mode.key 
										? 'border-[#770002] bg-[#770002]' 
										: 'border-gray-300'
								}`}>
									{activeMode === mode.key && (
										<div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Настройки для комбинированного режима */}
			{activeMode === 'mixed' && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Цели назначения
						</label>
						<button
							type="button"
							onClick={addTarget}
							className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#770002] text-white rounded-lg hover:bg-red-800 transition-colors"
						>
							<Icon name="plus" className="w-4 h-4" />
							<span>Добавить цель</span>
						</button>
					</div>

					<div className="space-y-3">
						{routing.targets?.map(target => (
							<TargetEditor
								key={target.id}
								target={target}
								users={users}
								roles={roles}
								departments={departments}
								onUpdate={(field, value) => updateTarget(target.id, field, value)}
								onRemove={() => removeTarget(target.id)}
							/>
						))}

						{(!routing.targets || routing.targets.length === 0) && (
							<div className="text-center py-8 text-gray-500">
								<Icon name="target" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
								<p>Добавьте цели для назначения заявок</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

// Компонент для редактирования отдельной цели
const TargetEditor = ({ target, users, roles, departments, onUpdate, onRemove }) => {
	const getOptions = () => {
		switch (target.type) {
			case 'user':
				return users?.map(user => ({ value: user.id, label: user.full_name || user.username })) || []
			case 'role':
				return roles?.map(role => ({ value: role.id, label: role.display_name })) || []
			case 'department':
				return departments?.map(dept => ({ value: dept.id, label: dept.name })) || []
			default:
				return []
		}
	}

	const priorityOptions = [
		{ value: 'low', label: 'Низкий' },
		{ value: 'normal', label: 'Обычный' },
		{ value: 'high', label: 'Высокий' },
		{ value: 'urgent', label: 'Срочный' }
	]

	return (
		<div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center space-x-2">
					<Icon name="target" className="w-4 h-4 text-gray-500" />
					<span className="text-sm font-medium text-gray-700">Цель назначения</span>
				</div>
				<button
					type="button"
					onClick={onRemove}
					className="text-red-600 hover:text-red-800 transition-colors"
				>
					<Icon name="trash-2" className="w-4 h-4" />
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				{/* Тип цели */}
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
					<select
						value={target.type}
						onChange={(e) => {
							onUpdate('type', e.target.value)
							onUpdate('value', '') // Сбрасываем выбранное значение
						}}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#770002] focus:border-transparent"
					>
						<option value="user">Пользователь</option>
						<option value="role">Роль</option>
						<option value="department">Подразделение</option>
					</select>
				</div>

				{/* Значение */}
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Значение</label>
					<select
						value={target.value}
						onChange={(e) => onUpdate('value', e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#770002] focus:border-transparent"
					>
						<option value="">Выберите...</option>
						{getOptions().map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				{/* Приоритет */}
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Приоритет</label>
					<select
						value={target.priority}
						onChange={(e) => onUpdate('priority', e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#770002] focus:border-transparent"
					>
						{priorityOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	)
}

// Компонент предварительного просмотра роутинга
export const RoutingPreview = ({ routing, users, roles, departments, className = '' }) => {
	const getTargetInfo = (target) => {
		switch (target.type) {
			case 'user':
				const user = users?.find(u => u.id === parseInt(target.value))
				return { name: user?.full_name || user?.username || 'Неизвестный пользователь', icon: 'user' }
			case 'role':
				const role = roles?.find(r => r.id === parseInt(target.value))
				return { name: role?.display_name || 'Неизвестная роль', icon: 'shield-user' }
			case 'department':
				const dept = departments?.find(d => d.id === parseInt(target.value))
				return { name: dept?.name || 'Неизвестное подразделение', icon: 'building' }
			default:
				return { name: 'Неизвестно', icon: 'help-circle' }
		}
	}

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'low': return 'text-blue-600 bg-blue-50'
			case 'normal': return 'text-gray-600 bg-gray-50'
			case 'high': return 'text-orange-600 bg-orange-50'
			case 'urgent': return 'text-red-600 bg-red-50'
			default: return 'text-gray-600 bg-gray-50'
		}
	}

	return (
		<div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
			<h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
				<Icon name="eye" className="w-4 h-4 mr-2" />
				Предварительный просмотр роутинга
			</h4>

			{/* Основной роутинг */}
			<div className="mb-4">
				<h5 className="text-xs font-medium text-gray-700 mb-2">Основной роутинг</h5>
				<div className="bg-white p-3 rounded border">
					{routing?.type === 'auto' && (
						<div className="flex items-center text-sm text-gray-600">
							<Icon name="zap" className="w-4 h-4 mr-2 text-blue-500" />
							Автоматическое назначение системой
						</div>
					)}

					{routing?.type === 'manual' && (
						<div className="flex items-center text-sm text-gray-600">
							<Icon name="user" className="w-4 h-4 mr-2 text-orange-500" />
							Ручное назначение исполнителя
						</div>
					)}

					{routing?.type === 'mixed' && (
						<div>
							<div className="flex items-center text-sm text-gray-600 mb-2">
								<Icon name="git-fork" className="w-4 h-4 mr-2 text-green-500" />
								Комбинированное назначение
							</div>
							{routing.targets?.length > 0 ? (
								<div className="space-y-1">
									{routing.targets.map(target => {
										const info = getTargetInfo(target)
										return (
											<div key={target.id} className="flex items-center justify-between text-xs">
												<div className="flex items-center">
													<Icon name={info.icon} className="w-3 h-3 mr-2 text-gray-400" />
													<span>{info.name}</span>
												</div>
												<span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(target.priority)}`}>
													{target.priority}
												</span>
											</div>
										)
									})}
								</div>
							) : (
								<div className="text-xs text-gray-400">Цели не настроены</div>
							)}
						</div>
					)}

					{!routing && (
						<div className="text-center py-4 text-gray-400">
							<Icon name="alert-triangle" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
							<p className="text-xs">Роутинг не настроен</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
} 