//  React и хуки
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

//  Компоненты из текущего проекта
import Sidebar from '../components/SideBar'
import Form from '../components/Form'
import SBChapter, {
	AccordSBChapter,
	InSBChapter,
} from '../components/SBChapter'

//  Разделы (страницы/главы)
import Profile from './chapters/Profile'
import Applications from './chapters/Applications'
import Report from './chapters/Report'
import Constructor from './chapters/Constructor'
import New from './New'

//  API / Утилиты
import ApiClient from '../../api/api.js'
import Loader1 from '../components/loader.jsx'
import Schedule from './chapters/Schedule.jsx'

const General = () => {
	const navigate = useNavigate()
	//  UI состояния
	const [activeIndex, setActiveIndex] = useState(0) // Текущий активный индекс

	//  Состояния пользователя
	const [userData, setUserData] = useState(null) // Данные пользователя
	const [userRoles, setUserRoles] = useState([]) // Роли пользователя

	//  Состояния форм
	const [forms, setForms] = useState([]) // Список форм

	//  Вспомогательные состояния
	const [loading, setLoading] = useState(true) // Индикатор загрузки
	const [error, setError] = useState('') // Сообщение об ошибке

	// проверяем авторизацию при загрузке
	useEffect(() => {
		if (!ApiClient.isAuthenticated()) {
			navigate('/auth')
			return
		}

		loadUserData()
		loadForms()
	}, [])

	const loadUserData = async () => {
		try {
			const profile = await ApiClient.getUserProfile()
			setUserData(profile)
			setUserRoles(profile.roles || [])
		} catch (error) {
			console.error('Ошибка загрузки профиля:', error)
			// если токен невалидный, перенаправляем на авторизацию
			if (error.message.includes('401') || error.message.includes('токен')) {
				await ApiClient.logout()
				navigate('/auth')
			}
		} finally {
			setLoading(false)
		}
	}

	const loadForms = async () => {
		try {
			const formsData = await ApiClient.getForms()
			setForms(formsData)
		} catch (error) {
			console.error('Ошибка загрузки форм:', error)
			// если нет прав доступа - не показываем ошибку
			if (!error.message.includes('Недостаточно прав')) {
				setError('Ошибка загрузки данных')
			}
		}
	}

	// обновляем формы при смене активного индекса
	useEffect(() => {
		if (activeIndex === 2 || activeIndex === 10) {
			loadForms()
		}
	}, [activeIndex])

	const handleDeleteForm = async formId => {
		try {
			await ApiClient.deleteForm(formId)
			// обновляем список форм
			setForms(forms.filter(f => f.id !== formId))
		} catch (error) {
			console.error('Ошибка удаления формы:', error)
			setError('Ошибка удаления формы')
		}
	}

	const handleLogout = async () => {
		await ApiClient.logout()
		navigate('/auth')
	}

	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}

	// генерируем аватар
	const getAvatar = () => {
		if (!userData || !userData.full_name) {
			return 'https://ui-avatars.com/api/?name=User&background=f5b7b1&color=fff'
		}

		const names = userData.full_name.split(' ')
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
		const color = colors[userData.id % colors.length]

		return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff`
	}

	const renderContent = () => {
		if (loading) {
			return (
				<div className='h-screen w-full flex items-center justify-center'>
					<Loader1 />
				</div>
			)
		}

		switch (activeIndex) {
			case 0:
				return (
					<Profile
						img_path={getAvatar()}
						role={userRoles.join(', ')}
						FullName={userData?.full_name || 'Пользователь'}
						username={userData?.username || 'username'}
						BirthDate={userData?.birth_date || 'Не указано'}
						email={userData?.email || 'email@example.com'}
						phone={userData?.phone || 'Не указан'}
						userRoles={userRoles}
					/>
				)
			case 1:
				return <Applications />
			case 2:
				return hasRole(['Админ']) ? (
					<Constructor
						onClick={() => setActiveIndex(9)}
						ConstBtn={'Новый отчёт'}
						ConstName={'отчётов'}
						type={forms.length === 0}
					>
						{forms.length === 0 && (
							<div className='h-30 w-full flex items-center justify-center text-3xl select-none cursor-default'>
								<div className='flex gap-2 items-center'>
									<p className='pb-1 opacity-30'>Пусто</p>
								</div>
							</div>
						)}
						{forms.map(form => (
							<Form
								key={form.id}
								form_id={form.id}
								form_name={form.name}
								form_description={form.description}
								form_role={form.responsible}
								form_count_inputs={form.fields.length}
								form_create={form.create}
								form_status={form.status}
								onDelete={handleDeleteForm}
							/>
						))}
					</Constructor>
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl select-none cursor-default'>
						<div className='flex gap-2 items-center '>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)

			case 3:
				return <Schedule userRoles={userRoles} />
			case 4:
				return <div>Учебный план</div>
			case 5:
				return <div>Нагрузка/Поступление</div>
			case 6:
				return <div>Новости</div>
			case 7:
				return <Report chap={'Все отчеты'} />
			case 8:
				return hasRole(['Админ']) ? (
					<Structure />
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl'>
						<div className='flex gap-2 items-center'>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)
			case 9:
				return hasRole(['Админ']) ? (
					<New
						type={'отчеты'}
						setActiveIndex={setActiveIndex}
						setForms={setForms}
					/>
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl select-none cursor-default'>
						<div className='flex gap-2 items-center '>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)
			case 10:
				return hasRole(['Админ']) ? (
					<Constructor
						onClick={() => setActiveIndex(11)}
						ConstBtn={'Новая заявка'}
						ConstName={'заявок'}
						type={forms.length === 0}
					>
						{forms.length === 0 && (
							<div className='h-30 w-full flex items-center justify-center text-3xl select-none cursor-default'>
								<div className='flex gap-2 items-center'>
									<p className='pb-1 opacity-30'>Пусто</p>
								</div>
							</div>
						)}
						{forms.map(form => (
							<Form
								key={form.id}
								form_id={form.id}
								form_name={form.name}
								form_description={form.description}
								form_role={form.responsible}
								form_count_inputs={form.fields.length}
								form_create={form.create}
								form_status={form.status}
								onDelete={handleDeleteForm}
							/>
						))}
					</Constructor>
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl'>
						<div className='flex gap-2 items-center'>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)
			case 11:
				return hasRole(['Админ']) ? (
					<New
						type={'заявки'}
						setActiveIndex={setActiveIndex}
						setForms={setForms}
					/>
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl'>
						<div className='flex gap-2 items-center'>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)
			default:
				return null
		}
	}

	if (loading) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<div className='text-xl'>Загрузка профиля...</div>
			</div>
		)
	}

	return (
		<>
			{error && (
				<div className='fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50'>
					{error}
					<button onClick={() => setError('')} className='ml-2 font-bold'>
						×
					</button>
				</div>
			)}

			<Sidebar
				username={userData?.full_name?.split(' ') || ['Пользователь']}
				role={userRoles.join(', ') || 'Не определена'}
				img_path={getAvatar()}
			>
				{hasRole(['Админ']) && (
					<p className='text-white font-bold text-md'>Основные</p>
				)}
				<SBChapter
					icon_name='user.svg'
					chapter_name='Профиль'
					isActive={activeIndex === 0}
					onClick={() => setActiveIndex(0)}
				/>

				{hasRole(['Сотрудник']) && (
					<>
						<SBChapter
							icon_name='clipboard-check.svg'
							chapter_name='Заявки'
							isActive={activeIndex === 1}
							onClick={() => setActiveIndex(1)}
						/>
						<SBChapter
							icon_name='file-text.svg'
							chapter_name='Отчеты'
							isActive={activeIndex === 7}
							onClick={() => setActiveIndex(7)}
						/>
					</>
				)}

				{hasRole(['Студент', 'Преподаватель']) && (
					<>
						<SBChapter
							icon_name='calendar-days.svg'
							chapter_name='Расписание'
							isActive={activeIndex === 3}
							onClick={() => setActiveIndex(3)}
						/>
					</>
				)}

				{hasRole(['Студент']) && (
					<>
						<SBChapter
							icon_name='book-open-text.svg'
							chapter_name='Учебный план'
							isActive={activeIndex === 4}
							onClick={() => setActiveIndex(4)}
						/>
					</>
				)}

				{hasRole(['Преподаватель']) && (
					<>
						<SBChapter
							icon_name='file-chart-column.svg'
							chapter_name='Нагрузка'
							isActive={activeIndex === 5}
							onClick={() => setActiveIndex(5)}
						/>
					</>
				)}

				{userRoles.length > 0 && (
					<SBChapter
						icon_name='newspaper.svg'
						chapter_name='Новости'
						isActive={activeIndex === 6}
						onClick={() => setActiveIndex(6)}
					/>
				)}

				{hasRole(['Админ']) && (
					<>
						<p className='text-white font-bold text-md'>Администратор</p>
						<SBChapter
							icon_name='git-fork.svg'
							chapter_name='Структура'
							isActive={activeIndex === 8}
							onClick={() => setActiveIndex(8)}
						/>
						<SBChapter
							icon_name='clipboard-check.svg'
							chapter_name='Конструктор заявок'
							isActive={activeIndex === 10 || activeIndex === 11}
							onClick={() => setActiveIndex(10)}
						/>
						<SBChapter
							icon_name='file-text.svg'
							chapter_name='Конструктор отчетов'
							isActive={activeIndex === 2 || activeIndex === 9}
							onClick={() => setActiveIndex(2)}
						/>
					</>
				)}

				<SBChapter
					icon_name='log-out.svg'
					chapter_name='Выйти'
					isActive={activeIndex === 100}
					onClick={handleLogout}
				/>
			</Sidebar>

			<main className='ml-96 p-4'>{renderContent()}</main>
		</>
	)
}

export default General
