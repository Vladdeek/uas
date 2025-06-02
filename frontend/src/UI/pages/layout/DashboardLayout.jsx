import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar, { SBLink, SBLinkButton } from '../../components/SideBar.jsx'
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
				<SBLink
					to={'profile'}
					icon_name={'user.svg'}
					chapter_name={'Профиль'}
				/>

				{has('Сотрудник') && (
					<>
						<SBLink
							to={'applications'}
							icon_name={'clipboard-check.svg'}
							chapter_name={'Заявки'}
						/>
						<SBLink
							to={'reports'}
							icon_name={'file-text.svg'}
							chapter_name={'Отчёты'}
						/>
					</>
				)}

				{has('Студент') && (
					<>
						<SBLink
							to={'schedule'}
							icon_name={'calendar-days.svg'}
							chapter_name={'Расписание'}
						/>
						<SBLink
							to={'plan'}
							icon_name={'book-open-text.svg'}
							chapter_name={'Учебный план'}
						/>
					</>
				)}

				{has('Преподаватель') && (
					<SBLink
						to={'load'}
						icon_name={'file-chart-column.svg'}
						chapter_name={'Нагрузка'}
					/>
				)}

				{roles.length > 0 && (
					<SBLink
						to={'news'}
						icon_name={'newspaper.svg'}
						chapter_name={'Новости'}
					/>
				)}

				{has('Админ') && (
					<>
						<SBLink
							to={'structure'}
							icon_name={'git-fork.svg'}
							chapter_name={'Структура'}
						/>
						<SBLink
							to={'constructor/applications'}
							icon_name={'clipboard-check.svg'}
							chapter_name={'Конструктор заявок'}
						/>
						<SBLink
							to={'constructor/reports'}
							icon_name={'file-text.svg'}
							chapter_name={'Конструктор отчётов'}
						/>
					</>
				)}

				<SBLinkButton
					onClick={async () => {
						await ApiClient.logout()
						navigate('/auth')
					}}
					icon_name='log-out.svg'
					chapter_name='Выйти'
				/>
			</Sidebar>

			<main className='ml-96 p-4'>
				<Outlet />
			</main>
		</>
	)
}
