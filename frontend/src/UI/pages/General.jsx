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
import CheckRole from '../components/CheckRole'
import Constructor from './chapters/Constructor'
import New from './New'
import Form from '../components/Form'

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

	const allRoles = [
		'Сотрудник',
		'Студент',
		'Школьник',
		'Абитуриент',
		'Преподаватель',
		'Админ',
	]

	const [userRoles, setUserRoles] = useState([])

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
				return hasRole(['Админ']) ? (
					<Constructor
						onClick={() => setActiveIndex(9)}
						ConstBtn={'Новый отчёт'}
						ConstName={'отчётов'}
					>
						<Form
							form_count_inputs={'N'}
							form_name={'Название отчета'}
							form_description={'Короткое описание отчета'}
							form_role={'Подразделение'}
							form_status={'Статус'}
							form_create={'ДД.ММ.ГГГГ'}
						/>
						<Form
							form_count_inputs={3}
							form_name={'Финансовый отчет за Q1 2024'}
							form_description={'Основные показатели прибыли и убытков'}
							form_role={'Финансовый отдел'}
							form_status={'Статус'}
							form_create={'15.03.2024'}
						/>

						<Form
							form_count_inputs={7}
							form_name={'Анализ продаж по регионам'}
							form_description={'Сравнение эффективности региональных отделов'}
							form_role={'Отдел продаж'}
							form_status={'Статус'}
							form_create={'10.02.2023'}
						/>

						<Form
							form_count_inputs={2}
							form_name={'Отчет по кадровым изменениям'}
							form_description={'Нанятые и уволенные сотрудники за месяц'}
							form_role={'HR-отдел'}
							form_status={'Статус'}
							form_create={'05.05.2024'}
						/>
					</Constructor>
				) : (
					<div className='h-screen w-full flex items-center justify-center text-3xl'>
						<div className='flex gap-2 items-center'>
							<p className='pb-1'>Доступ запрещен</p>
							<img className='h-full' src='icons/ban.svg' alt='' />
						</div>
					</div>
				)

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
			case 9:
				return <New NewName={'новый отчет'} />
			case 10:
				return hasRole(['Админ']) ? (
					<Constructor
						onClick={() => setActiveIndex(11)}
						ConstBtn={'Новая заявка'}
						ConstName={'заявок'}
					>
						<Form
							form_count_inputs={5}
							form_name={'Маркетинговый отчет: эффективность кампаний'}
							form_description={'CTR, конверсии и ROI рекламных каналов'}
							form_role={'Маркетинг'}
							form_status={'Статус'}
							form_create={'22.04.2024'}
						/>

						<Form
							form_count_inputs={4}
							form_name={'Технический аудит серверов'}
							form_description={
								'Загрузка CPU, память, инциденты за последний месяц'
							}
							form_role={'IT-инфраструктура'}
							form_status={'Статус'}
							form_create={'30.12.2023'}
						/>
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
				return <New NewName={'новая заявка'} />
			default:
				return null
		}
	}

	return (
		<>
			<CheckRole
				userRoles={userRoles}
				allRoles={allRoles}
				setUserRoles={setUserRoles}
			/>
			<Sidebar
				username={FullName}
				role={userRoles.join(', ')}
				img_path={avatar}
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

				{hasRole(['Абитуриент']) && (
					<>
						<SBChapter
							icon_name='graduation-cap.svg'
							chapter_name='Поступление'
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
					onClick={() => navigate('/auth')}
				/>
			</Sidebar>

			<main className='ml-96 p-4'>{renderContent()}</main>
		</>
	)
}

export default General
