import React, { useState, useMemo } from 'react'
import Icon from './Icon.jsx'

export const AccessControlSettings = ({ 
	access = { type: 'all', values: [] }, 
	setAccess, 
	roles = [], 
	departments = [], 
	users = [], 
	inputStyles,
	focusHandler, 
	blurHandler,
	label = "Настройки доступа"
}) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [expandedGroups, setExpandedGroups] = useState({})

	const getAvailableItems = () => {
		switch (access.type) {
			case 'roles':
				return roles.map(role => ({ 
					id: role.id, 
					name: role.display_name,
					subtitle: role.name,
					type: 'role'
				}))
			case 'departments':
				return departments.map(dept => ({ 
					id: dept.id, 
					name: dept.name,
					subtitle: dept.short_name || dept.description,
					type: 'department'
				}))
			case 'users':
				return users.map(user => ({ 
					id: user.id, 
					name: user.full_name || user.username,
					subtitle: user.email,
					department: user.profile?.department || 'Не указано',
					type: 'user'
				}))
			default:
				return []
		}
	}

	// Фильтрация по поиску
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return getAvailableItems()
		
		const query = searchQuery.toLowerCase()
		return getAvailableItems().filter(item => 
			item.name.toLowerCase().includes(query) ||
			(item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
			(item.department && item.department.toLowerCase().includes(query))
		)
	}, [searchQuery, roles, departments, users, access.type])

	// Группировка пользователей по подразделениям
	const groupedUsers = useMemo(() => {
		if (access.type !== 'users') return {}
		
		const groups = {}
		filteredItems.forEach(user => {
			const dept = user.department || 'Без подразделения'
			if (!groups[dept]) groups[dept] = []
			groups[dept].push(user)
		})
		return groups
	}, [filteredItems, access.type])

	const handleTypeChange = (type) => {
		setAccess({ type, values: [] })
		setSearchQuery('')
		setExpandedGroups({})
	}

	const handleItemToggle = (itemId) => {
		const values = access.values || []
		const isSelected = values.includes(itemId)
		
		const newValues = isSelected 
			? values.filter(id => id !== itemId)
			: [...values, itemId]
		
		setAccess({ ...access, values: newValues })
	}

	const handleSelectAll = () => {
		const allIds = filteredItems.map(item => item.id)
		setAccess({ ...access, values: allIds })
	}

	const handleClearAll = () => {
		setAccess({ ...access, values: [] })
	}

	const toggleGroup = (groupName) => {
		setExpandedGroups(prev => ({
			...prev,
			[groupName]: !prev[groupName]
		}))
	}

	const selectedCount = (access.values || []).length
	const totalCount = getAvailableItems().length

	const getTypeIcon = (type) => {
		switch (type) {
			case 'roles': return 'crown.svg'
			case 'departments': return 'building.svg'  
			case 'users': return 'users.svg'
			case 'users_with_roles': return 'user-circle.svg'
			case 'users_without_roles': return 'user-plus.svg'
			default: return 'shield-user.svg'
		}
	}

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					{label}
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon name={getTypeIcon(access.type || 'all')} className="w-4 h-4 text-gray-400" />
					</div>
					<select
						value={access.type || 'all'}
						onChange={(e) => handleTypeChange(e.target.value)}
						className={`${inputStyles} pl-10`}
						onFocus={focusHandler}
						onBlur={blurHandler}
					>
						<option value="all">Все пользователи</option>
						<option value="users_with_roles">Все пользователи с ролями</option>
						<option value="users_without_roles">Пользователи без ролей</option>
						<option value="roles">По ролям</option>
						<option value="departments">По подразделениям</option>
						<option value="users">Конкретные пользователи</option>
					</select>
				</div>
			</div>

			{access.type && access.type !== 'all' && (
				<div className="border rounded-lg p-4 bg-gray-50">
					{/* Заголовок с счетчиком */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center space-x-2">
							<Icon name={getTypeIcon(access.type)} className="w-4 h-4 text-gray-600" />
							<span className="text-sm font-medium text-gray-700">
								{access.type === 'roles' ? 'Роли' : 
								 access.type === 'departments' ? 'Подразделения' : 
								 'Пользователи'}
							</span>
							<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
								{selectedCount} из {totalCount}
							</span>
						</div>
						
						{totalCount > 0 && (
							<div className="flex space-x-2">
								<button
									type="button"
									onClick={handleSelectAll}
									className="text-xs text-blue-600 hover:text-blue-800 font-medium"
								>
									Все
								</button>
								<button
									type="button"
									onClick={handleClearAll}
									className="text-xs text-gray-600 hover:text-gray-800 font-medium"
								>
									Очистить
								</button>
							</div>
						)}
					</div>

					{/* Поиск */}
					{totalCount > 5 && (
						<div className="mb-3">
							<div className="relative">
								<Icon name="search.svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder={`Поиск ${access.type === 'roles' ? 'ролей' : access.type === 'departments' ? 'подразделений' : 'пользователей'}...`}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					)}

					{/* Список элементов */}
					<div className="max-h-64 overflow-y-auto space-y-1">
						{access.type === 'users' && Object.keys(groupedUsers).length > 1 ? (
							// Группированные пользователи по подразделениям
							Object.entries(groupedUsers).map(([deptName, deptUsers]) => (
								<div key={deptName} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
									<button
										type="button"
										onClick={() => toggleGroup(deptName)}
										className="flex items-center space-x-2 w-full text-left py-1 px-2 rounded hover:bg-gray-100"
									>
										<Icon 
											name={expandedGroups[deptName] ? "chevron-down.svg" : "chevron-right.svg"} 
											className="w-3 h-3 text-gray-500" 
										/>
										<span className="text-sm font-medium text-gray-700">{deptName}</span>
										<span className="text-xs text-gray-500">({deptUsers.length})</span>
									</button>
									
									{(expandedGroups[deptName] ?? true) && (
										<div className="ml-5 space-y-1 mt-1">
											{deptUsers.map(user => (
												<ItemRow
													key={user.id}
													item={user}
													isSelected={(access.values || []).includes(user.id)}
													onToggle={() => handleItemToggle(user.id)}
												/>
											))}
										</div>
									)}
								</div>
							))
						) : (
							// Обычный список
							filteredItems.map(item => (
								<ItemRow
									key={item.id}
									item={item}
									isSelected={(access.values || []).includes(item.id)}
									onToggle={() => handleItemToggle(item.id)}
								/>
							))
						)}
						
						{filteredItems.length === 0 && (
							<div className="text-center py-4 text-gray-500">
								<Icon name="search.svg" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
								<p className="text-sm">Ничего не найдено</p>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery('')}
										className="text-blue-600 text-xs mt-1 hover:underline"
									>
										Очистить поиск
									</button>
								)}
							</div>
						)}
					</div>

					{/* Сводка выбранных */}
					{selectedCount > 0 && (
						<div className="mt-3 pt-3 border-t border-gray-200">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Выбрано элементов:</span>
								<span className="font-medium text-gray-900">{selectedCount}</span>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

// Компонент для отображения отдельного элемента
const ItemRow = ({ item, isSelected, onToggle }) => {
	const getItemIcon = (type) => {
		switch (type) {
			case 'role': return 'crown.svg'
			case 'department': return 'building.svg'
			case 'user': return 'user.svg'
			default: return 'circle.svg'
		}
	}

	return (
		<label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-150">
			<input
				type="checkbox"
				checked={isSelected}
				onChange={onToggle}
				className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
			/>
			<Icon name={getItemIcon(item.type)} className="w-4 h-4 text-gray-500 flex-shrink-0" />
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-gray-900 truncate">
					{item.name}
				</div>
				{item.subtitle && (
					<div className="text-xs text-gray-500 truncate">
						{item.subtitle}
					</div>
				)}
			</div>
			{isSelected && (
				<Icon name="check.svg" className="w-4 h-4 text-green-600 flex-shrink-0" />
			)}
		</label>
	)
}

export const AccessControlDisplay = ({ accessControl }) => {
	if (!accessControl) return (
		<span className="inline-flex items-center space-x-1 text-green-600">
			<Icon name="shield-user.svg" className="w-4 h-4" />
			<span>Для всех</span>
		</span>
	)

	try {
		const control = JSON.parse(accessControl)
		if (control.type === 'all' || !control.type) {
			return (
				<span className="inline-flex items-center space-x-1 text-green-600">
					<Icon name="shield-user.svg" className="w-4 h-4" />
					<span>Для всех</span>
				</span>
			)
		}

		if (control.type === 'users_with_roles') {
			return (
				<span className="inline-flex items-center space-x-1 text-blue-600">
					<Icon name="user-circle.svg" className="w-4 h-4" />
					<span>С ролями</span>
				</span>
			)
		}

		if (control.type === 'users_without_roles') {
			return (
				<span className="inline-flex items-center space-x-1 text-orange-600">
					<Icon name="user-plus.svg" className="w-4 h-4" />
					<span>Без ролей</span>
				</span>
			)
		}

		const typeLabels = {
			roles: { label: 'Роли', icon: 'crown.svg' },
			departments: { label: 'Подразделения', icon: 'building.svg' }, 
			users: { label: 'Пользователи', icon: 'users.svg' }
		}

		const config = typeLabels[control.type]
		if (!config) {
			return (
				<span className="inline-flex items-center space-x-1 text-gray-500">
					<Icon name="shield-user.svg" className="w-4 h-4" />
					<span>Для всех</span>
				</span>
			)
		}

		const count = (control.values || []).length

		return (
			<span className="inline-flex items-center space-x-1 text-blue-600">
				<Icon name={config.icon} className="w-4 h-4" />
				<span>{config.label}</span>
				<span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
					{count}
				</span>
			</span>
		)
	} catch {
		return (
			<span className="inline-flex items-center space-x-1 text-gray-500">
				<Icon name="shield-user.svg" className="w-4 h-4" />
				<span>Для всех</span>
			</span>
		)
	}
} 