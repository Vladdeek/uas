import React, { memo, useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar, { SBLink, SBLinkButton, SBSection } from './SideBar.jsx'
import api from '../../api/api.js'

const DashboardLayout = memo(() => {
	const [user, setUser] = useState(null)
	const [roles, setRoles] = useState([])
	const navigate = useNavigate()

	useEffect(() => {
		// Получаем данные пользователя из localStorage
		const userData = api.getCurrentUser()
		console.log('[USER] User data:', userData) // Для отладки
		if (userData) {
			setUser(userData)
			setRoles(userData.roles || [])
			console.log('[ROLES] User roles:', userData.roles) // Для отладки
		}

		// Добавляем слушатель для обновления данных пользователя
		const handleUserUpdate = () => {
			const updatedUserData = api.getCurrentUser()
			if (updatedUserData) {
				setUser(updatedUserData)
				setRoles(updatedUserData.roles || [])
			}
		}

		// Слушаем кастомное событие обновления пользователя
		window.addEventListener('userDataUpdated', handleUserUpdate)

		// Очистка слушателя при размонтировании
		return () => {
			window.removeEventListener('userDataUpdated', handleUserUpdate)
		}
	}, [])

	const handleLogout = async () => {
		await api.logout()
		navigate('/auth')
	}

	if (!user) {
		return null // Не рендерим ничего если нет пользователя
	}

	const has = r => roles.includes(r)
	const isAdmin = has('Админ') || has('admin')
	const hasAnyRole = roles.length > 0

	console.log('[DEBUG] Is admin:', isAdmin, 'Has roles:', hasAnyRole, 'Roles:', roles) // Для отладки

	return (
		<>
			<Sidebar
				username={user.full_name?.split(' ') || [user.username]}
				role={roles.join(', ')}
				img_path={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=820000&color=fff`}
			>
				{/* Общие функции */}
				<SBSection title="Общие" />
				<SBLink
					to={'profile'}
					icon_name={'user.svg'}
					chapter_name={'Профиль'}
				/>

				<SBLink
					to={'applications'}
					icon_name={'file-plus.svg'}
					chapter_name={'Заявки'}
				/>

				{/* Функции для сотрудников - только если есть роли */}
				{hasAnyRole && has('Сотрудник') && (
					<>
						<SBSection title="Отчетность" />
						<SBLink
							to={'reports'}
							icon_name={'file-chart-column.svg'}
							chapter_name={'Мои отчеты'}
						/>
					</>
				)}

				{/* Функции администратора - только если есть роли */}
				{hasAnyRole && isAdmin && (
					<>
						<SBSection title="Администрирование" />
						<SBLink
							to={'users'}
							icon_name={'users.svg'}
							chapter_name={'Пользователи'}
						/>
						<SBLink
							to={'roles'}
							icon_name={'shield-user.svg'}
							chapter_name={'Роли'}
						/>
						<SBLink
							to={'structure'}
							icon_name={'git-fork.svg'}
							chapter_name={'Структура'}
						/>

						<SBSection title="Конструкторы" />
						<SBLink
							to={'applications-constructor'}
							icon_name={'square-pen.svg'}
							chapter_name={'Конструктор заявок'}
						/>
						<SBLink
							to={'reports-constructor'}
							icon_name={'list-ordered.svg'}
							chapter_name={'Конструктор отчетов'}
						/>
					</>
				)}

				{/* Выход */}
				<SBSection title="Система" />
				<SBLinkButton
					onClick={handleLogout}
					icon_name='log-out.svg'
					chapter_name='Выйти'
				/>
			</Sidebar>

			<main className='ml-96 p-4 page-transition'>
				<Outlet />
			</main>
		</>
	)
})

DashboardLayout.displayName = 'DashboardLayout'

export default DashboardLayout
