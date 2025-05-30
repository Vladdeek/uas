import { useState } from 'react'
import { Calendar, CheckBox, ToggleBtn } from '../../components/Components'
import {
	ScheduleTable,
	EmptyScheduleTable,
	ScheduleCard,
	TeacherScheduleCard,
} from '../../components/ScheduleCard'

const Schedule = ({ Month, Today, userRoles }) => {
	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}
	const [role, setRole] = useState('Студент')

	const handleToggle = newRole => {
		setRole(newRole)
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

							{role === 'Студент' ? (
								<>
									<ScheduleTable LessonTime={'8:00 - 9:20'}>
										<ScheduleCard
											LessonName={'Технологии WEB-Разработки'}
											LessonTime={'8:00 - 9:20'}
											Teacher={'Букреев Д. А.'}
											lessonType={'Лекция'}
											Auditoria={'7.308'}
										/>
									</ScheduleTable>
									<ScheduleTable LessonTime={'9:30 - 10:50'}>
										<EmptyScheduleTable />
									</ScheduleTable>

									<ScheduleTable LessonTime={'11:00 - 12:20'}>
										<ScheduleCard
											LessonName={'Система управления базами данных PostgreSQL'}
											LessonTime={'11:00 - 12:20'}
											Teacher={'Ступницкий В. С.'}
											lessonType={'Лекция'}
											Auditoria={'7.203'}
											lessonNow={true}
										/>
									</ScheduleTable>
									<ScheduleTable LessonTime={'12:30 - 13:50'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'14:00 - 15:20'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'15:30 - 16:50'}>
										<ScheduleCard
											LessonName={'Анализ данных на языке Python'}
											LessonTime={'15:30 - 16:50'}
											Teacher={'Мозговенко А. А.'}
											Auditoria={'7.308'}
											sub_group={1}
										/>
										<ScheduleCard
											LessonName={'Технологии WEB-Разработки'}
											LessonTime={'8:00 - 9:20'}
											Teacher={'Букреев Д. А.'}
											Auditoria={'7.308'}
											sub_group={2}
										/>
									</ScheduleTable>
									<ScheduleTable LessonTime={'17:00 - 18:20'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'18:20 - 19:50'}>
										<EmptyScheduleTable />
									</ScheduleTable>
								</>
							) : (
								<>
									<ScheduleTable LessonTime={'8:00 - 9:20'}>
										<TeacherScheduleCard
											LessonName={'Технологии WEB-Разработки'}
											LessonTime={'8:00 - 9:20'}
											Auditoria={'7.308'}
											lessonType={''}
											Group={['31 ИТ', '32 ИТ', '33 ИТ']}
											lessonNow={true}
										/>
									</ScheduleTable>
									<ScheduleTable LessonTime={'9:30 - 11:00'}>
										<TeacherScheduleCard
											LessonName={'Технологии WEB-Разработки'}
											LessonTime={'9:30 - 11:00'}
											Auditoria={'7.203'}
											lessonType={'Лекция'}
											Group={['31 ИТ', '32 ИТ']}
										/>
									</ScheduleTable>

									<ScheduleTable LessonTime={'11:00 - 12:20'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'12:30 - 13:50'}>
										<TeacherScheduleCard
											LessonName={'Технологии WEB-Разработки'}
											LessonTime={'12:30 - 13:50'}
											Auditoria={'7.203'}
											lessonType={'Лекция'}
											Group={['31 ИТ']}
											sub_group={2}
										/>
									</ScheduleTable>
									<ScheduleTable LessonTime={'14:00 - 15:20'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'15:30 - 16:50'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'17:00 - 18:20'}>
										<EmptyScheduleTable />
									</ScheduleTable>
									<ScheduleTable LessonTime={'18:20 - 19:50'}>
										<EmptyScheduleTable />
									</ScheduleTable>
								</>
							)}
						</div>
					</div>
				</div>
				<div className='w-1/4 pl-4'>
					<Calendar count_days={31} FromTheDay={3} />
				</div>
			</div>
		</>
	)
}
export default Schedule
