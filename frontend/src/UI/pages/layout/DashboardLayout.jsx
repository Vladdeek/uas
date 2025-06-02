import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from '../../components/SideBar.jsx'
import ApiClient from '../../../api/api.js'
import Loader from '../../components/Loader.jsx'

export default function DashboardLayout() {
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [roles, setRoles] = useState([])

	/* ───────── загрузка профиля ───────── */
	useEffect(() => {
		ApiClient.getUserProfile()
			.then(profile => {
				setUser(profile)
				setRoles(profile.roles ?? [])
			})
			.catch(async err => {
				console.error(err)
				await ApiClient.logout()
				navigate('/auth')
			})
	}, [])

	if (!user)
		return (
			<div className='h-screen flex items-center justify-center'>
				<Loader />
			</div>
		)

	/* генерация аватара как и раньше */
	const getAvatar = () => {
		const names = (user.full_name ?? 'User').split(' ')
		const initials = names.slice(0, 2).join('+')
		const colors = [
			'f5b7b1',
			'e8daef',
			'aed6f1',
			'a2d9ce',
			'abebc6',
			'f9e79f',
			'fad7a0',
			'edbb99',
		]
		const color = colors[user.id % colors.length]
		return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff`
	}

	const has = r => roles.includes(r)

	return (
		<>
			<Sidebar
				username={user.full_name.split(' ')}
				role={roles.join(', ')}
				img_path={getAvatar()}
			>
				{/* ----------- ссылки вместо onClick ----------- */}
				<NavLink to='profile' className='sb-link'>
					Профиль
				</NavLink>

				{has('Сотрудник') && (
					<>
						<NavLink to='applications' className='sb-link'>
							Заявки
						</NavLink>
						<NavLink to='reports' className='sb-link'>
							Отчёты
						</NavLink>
					</>
				)}

				{has('Студент') && (
					<>
						<NavLink to='schedule' className='sb-link'>
							Расписание
						</NavLink>
						<NavLink to='plan' className='sb-link'>
							Учебный план
						</NavLink>
					</>
				)}

				{has('Преподаватель') && (
					<NavLink to='load' className='sb-link'>
						Нагрузка
					</NavLink>
				)}

				{roles.length > 0 && (
					<NavLink to='news' className='sb-link'>
						Новости
					</NavLink>
				)}

				{has('Админ') && (
					<>
						<NavLink to='structure' className='sb-link'>
							Структура
						</NavLink>
						<NavLink to='constructor/reports' className='sb-link'>
							Конструктор отчётов
						</NavLink>
						<NavLink to='constructor/applications' className='sb-link'>
							Конструктор заявок
						</NavLink>
					</>
				)}

				<button
					onClick={async () => {
						await ApiClient.logout()
						navigate('/auth')
					}}
					className='sb-link'
				>
					Выйти
				</button>
			</Sidebar>

			<main className='ml-96 p-4'>
				<Outlet />
			</main>
		</>
	)
}
