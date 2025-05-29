import { Calendar, CheckBox, ToggleBtn } from '../../components/Components'
import {
	ScheduleTable,
	EmptyScheduleTable,
	ScheduleCard,
} from '../../components/ScheduleCard'

const Schedule = ({ Month, Today, userRoles }) => {
	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}
	return (
		<>
			<div className='flex'>
				<div className='w-3/4 border-r-1 h-screen border-gray-400 pr-4'>
					<div className='w-full flex mt-3 '>
						<div className='w-full flex flex-col '>
							{hasRole(['Студент', 'Преподаватель']) && (
								<div className={` self-center mb-3`}>
									<ToggleBtn off={'Студент'} on={'Преподаватель'} />
								</div>
							)}

							<ScheduleTable LessonTime={'8:00 - 9:20'}>
								<ScheduleCard
									LessonName={'Технологии WEB-Разработки'}
									LessonTime={'8:00 - 9:20'}
									Teacher={'Букреев Д. А.'}
									Auditoria={'7.308'}
								/>
							</ScheduleTable>
							<EmptyScheduleTable LessonTime={'9:30 - 10:50'} />
							<ScheduleTable LessonTime={'11:00 - 12:20'}>
								<ScheduleCard
									LessonName={'Система управления базами данных PostgreSQL'}
									LessonTime={'11:00 - 12:20'}
									Teacher={'Ступницкий В. С.'}
									Auditoria={'7.203'}
									lessonNow={true}
								/>
							</ScheduleTable>
							<EmptyScheduleTable LessonTime={'12:30 - 13:50'} />
							<EmptyScheduleTable LessonTime={'14:00 - 15:20'} />
							<ScheduleTable LessonTime={'15:30 - 16:50'}>
								<ScheduleCard
									LessonName={'Анализ данных на языке Python'}
									LessonTime={'15:30 - 16:50'}
									Teacher={'Мозговенко А. А.'}
									Auditoria={'7.308'}
								/>
							</ScheduleTable>
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
