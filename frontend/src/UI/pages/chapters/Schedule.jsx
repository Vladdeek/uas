import { useState } from 'react'
import { Calendar, CheckBox, ToggleBtn } from '../../components/Components'
import {
	ScheduleTable,
	EmptyScheduleTable,
	ScheduleCard,
	TeacherScheduleCard,
} from '../../components/ScheduleCard'
import { parse, isWithinInterval } from 'date-fns'

const Schedule = ({ Month, Today, userRoles }) => {
	const lessonTimes = [
		'8:00 - 9:20',
		'9:30 - 10:50',
		'11:00 - 12:20',
		'12:40 - 14:00',
		'14:10 - 15:30',
		'15:40 - 17:00',
		'17:10 - 18:30',
		'18:40 - 20:00',
	]

	const lessons = [
		{
			lessonTime: 1,
			LessonName: 'Технологии WEB-Разработки',
			Teacher: 'Букреев Д. А.',
			lessonType: 'Лекция',
			Auditoria: '7.203',
			role: 'Студент',
		},
		{
			lessonTime: 3,
			LessonName: 'Система управления базами данных PostgreSQL',
			Teacher: 'Ступницкий В. С.',
			lessonType: 'Лекция',
			Auditoria: '7.203',
			role: 'Студент',
		},
		{
			lessonTime: 6,
			LessonName: 'Анализ данных на языке Python',
			Teacher: 'Мозговенко А. А.',
			Auditoria: '7.308',
			sub_group: 1,
			role: 'Студент',
		},
		{
			lessonTime: 6,
			LessonName: 'Технологии WEB-Разработки',
			Teacher: 'Букреев Д. А.',
			Auditoria: '7.308',
			sub_group: 2,
			role: 'Студент',
		},
		{
			lessonTime: 1,
			LessonName: 'Технологии WEB-Разработки',
			Group: ['31 ИТ', '32 ИТ', '33 ИТ'],
			Auditoria: '7.308',
			lessonType: '',
			role: 'Преподаватель',
		},
		{
			lessonTime: 2,
			LessonName: 'Технологии WEB-Разработки',
			Group: ['31 ИТ', '32 ИТ'],
			Auditoria: '7.203',
			lessonType: 'Лекция',
			role: 'Преподаватель',
		},
		{
			lessonTime: 4,
			LessonName: 'Технологии WEB-Разработки',
			Group: ['31 ИТ'],
			Auditoria: '7.203',
			lessonType: 'Лекция',
			sub_group: 2,
			role: 'Преподаватель',
		},
	]

	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}
	const [role, setRole] = useState('Студент')

	const handleToggle = newRole => {
		setRole(newRole)
	}

	const getCurrentLessonStatus = timeRange => {
		if (!timeRange) return false

		const [startStr, endStr] = timeRange.split(' - ')
		const now = new Date()

		const start = parse(startStr, 'HH:mm', now)
		const end = parse(endStr, 'HH:mm', now)

		return isWithinInterval(now, { start, end })
	}
	return (
		<>
			<div className='flex'>
				<div className='w-3/4 border-r-1 h-screen border-gray-400 pr-4'>
					<div className='w-full flex mt-3 '>
						<div className='w-full flex flex-col '>
							{hasRole(['Студент', 'Преподаватель']) && (
								<div className={` self-center mb-3`}>
									<ToggleBtn
										off={'Студент'}
										on={'Преподаватель'}
										onToggle={handleToggle}
									/>
								</div>
							)}

							{Array.from({ length: 8 }).map((_, index) => {
								const lessonTimeNum = index
								const timeLabel = lessonTimes[lessonTimeNum]

								// фильтруем занятия по времени и роли
								const filteredLessons = lessons.filter(
									l => l.lessonTime - 1 === lessonTimeNum && l.role === role
								)

								return (
									<ScheduleTable key={lessonTimeNum} LessonTime={timeLabel}>
										{filteredLessons.length > 0 ? (
											filteredLessons.map((lesson, idx) =>
												role === 'Студент' ? (
													<ScheduleCard
														key={idx}
														LessonName={lesson.LessonName}
														LessonTime={timeLabel}
														Teacher={lesson.Teacher}
														lessonType={lesson.lessonType}
														Auditoria={lesson.Auditoria}
														sub_group={lesson.sub_group}
														lessonNow={getCurrentLessonStatus(timeLabel)}
													/>
												) : (
													<TeacherScheduleCard
														key={idx}
														LessonName={lesson.LessonName}
														LessonTime={timeLabel}
														Auditoria={lesson.Auditoria}
														lessonType={lesson.lessonType}
														Group={lesson.Group}
														sub_group={lesson.sub_group}
														lessonNow={getCurrentLessonStatus(timeLabel)}
													/>
												)
											)
										) : (
											<EmptyScheduleTable />
										)}
									</ScheduleTable>
								)
							})}
						</div>
					</div>
				</div>
				<div className='w-1/4 pl-4'>
					<Calendar />
				</div>
			</div>
		</>
	)
}
export default Schedule
