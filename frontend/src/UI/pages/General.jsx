import SBChapter, {
	AccordSBChapter,
	InSBChapter,
} from '../components/SBChapter'
import Sidebar from '../components/SideBar'
import { useState } from 'react'
import Profile from './chapters/Profile'
import Applications from './chapters/Applications'
import Report from './chapters/Report'
import { useNavigate } from 'react-router-dom'

const General = () => {
	const navigate = useNavigate()
	const [activeIndex, setActiveIndex] = useState(0)
	const FullName = ['Рязанов', 'Владислав', 'Денисович']
	const colors = [
		'f5b7b1',
		'e8daef',
		'aed6f1',
		'a2d9ce',
		'abebc6',
		'f9e79f',
		'fad7a0',
		'edbb99',
		'',
	]
	const avatar = `https://ui-avatars.com/api/?name=${FullName.slice(0, 2).join(
		'+'
	)}&background=${colors[0]}&color=fff`

	// Все возможные роли
	const allRoles = [
		'Сотрудник',
		'Студент',
		'Школьник',
		'Абитуриент',
		'Преподаватель',
		'Админ',
	]

	const userRoles = [allRoles[0], allRoles[4], allRoles[5]]

	// Функция проверки ролей
	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}

	const renderContent = () => {
		switch (activeIndex) {
			case 0:
				return (
					<Profile
						img_path={avatar}
						role={userRoles.join(', ')}
						FullName={FullName.join(' ')}
						username={'vladdeek'}
						BirthDate={'27 сентября 2005 г.'}
						email={'vladryazanov2709@gmail.com'}
						phone={'+7 (990) 052-06-70'}
						userRoles={userRoles}
					/>
				)
			case 1:
				return <Applications />
			case 2:
				return <Report chap={'Конструктор отчета'} />
			case 3:
				return <div>Расписание</div>
			case 4:
				return <div>Учебный план</div>
			case 5:
				return <div>Нагрузка/Поступление</div>
			case 6:
				return <div>Новости</div>
			case 7:
				return <Report chap={'Все отчеты'} />
			case 8:
				return <div>Панель</div>
			default:
				return null
		}
	}

	return (
		<>
			<Sidebar
				username={FullName}
				role={userRoles.join(', ')}
				img_path={avatar}
			>
				<SBChapter
					icon_name='user.svg'
					chapter_name='Профиль'
					isActive={activeIndex === 0}
					onClick={() => setActiveIndex(0)}
				/>

				{/* Заявки и Отчеты (для сотрудника) */}
				{hasRole(['Сотрудник']) && (
					<>
						<SBChapter
							icon_name='clipboard-check.svg'
							chapter_name='Заявки'
							isActive={activeIndex === 1}
							onClick={() => setActiveIndex(1)}
						/>
						<AccordSBChapter icon_name='file-text.svg' chapter_name='Отчеты'>
							{hasRole(['Админ']) && (
								<InSBChapter
									icon_name='clipboard-check.svg'
									chapter_name='Конструктор отчета'
									isActive={activeIndex === 2}
									onClick={() => setActiveIndex(2)}
								/>
							)}

							<InSBChapter
								icon_name='clipboard-check.svg'
								chapter_name='Все отчеты'
								isActive={activeIndex === 7}
								onClick={() => setActiveIndex(7)}
							/>
						</AccordSBChapter>
					</>
				)}

				{/* Расписание (для студента или преподавателя) */}
				{hasRole(['Студент', 'Преподаватель']) && (
					<SBChapter
						icon_name='calendar-days.svg'
						chapter_name='Расписание'
						isActive={activeIndex === 3}
						onClick={() => setActiveIndex(3)}
					/>
				)}

				{/* Учебный план (только для студента) */}
				{hasRole(['Студент']) && (
					<SBChapter
						icon_name='book-open-text.svg'
						chapter_name='Учебный план'
						isActive={activeIndex === 4}
						onClick={() => setActiveIndex(4)}
					/>
				)}

				{/* Нагрузка (только для преподавателя) */}
				{hasRole(['Преподаватель']) && (
					<SBChapter
						icon_name='file-chart-column.svg'
						chapter_name='Нагрузка'
						isActive={activeIndex === 5}
						onClick={() => setActiveIndex(5)}
					/>
				)}

				{/* Поступление (только для абитуриента) */}
				{hasRole(['Абитуриент']) && (
					<SBChapter
						icon_name='graduation-cap.svg'
						chapter_name='Поступление'
						isActive={activeIndex === 5}
						onClick={() => setActiveIndex(5)}
					/>
				)}

				{/* Новости (для всех, у кого есть хотя бы одна роль) */}
				{userRoles.length > 0 && (
					<SBChapter
						icon_name='newspaper.svg'
						chapter_name='Новости'
						isActive={activeIndex === 6}
						onClick={() => setActiveIndex(6)}
					/>
				)}

				{/* Поступление (только для абитуриента) */}
				{hasRole(['Админ']) && (
					<SBChapter
						icon_name='shield-user.svg'
						chapter_name='Панель администратора'
						isActive={activeIndex === 8}
						onClick={() => setActiveIndex(8)}
					/>
				)}
				<SBChapter
					icon_name='log-out.svg'
					chapter_name='Выйти'
					isActive={activeIndex === 9}
					onClick={() => navigate('/auth')}
				/>
			</Sidebar>

			<main className='ml-96 p-4'>{renderContent()}</main>
		</>
	)
}

export default General
