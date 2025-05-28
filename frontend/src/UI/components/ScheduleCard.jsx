import { Children, useState } from 'react'
import { CheckBox } from './Components'

const ScheduleCard = ({
	LessonName,
	LessonTime,
	Auditoria,
	Teacher,
	lessonNow,
}) => {
	return (
		<div
			className={`w-full rounded-md  shadow-[1px_1px_10px_rgba(0,0,0,0.05)] px-6 py-4 ${
				lessonNow
					? 'bg-[#c10f1a] text-white'
					: 'bg-white border-l-6 border-[#c10f1a]'
			}`}
		>
			<p className='text-2xl font-semibold'>{LessonName}</p>
			<p className='text-lg font-normal'>{LessonTime}</p>
			<div className='flex justify-between items-center'>
				<p className='text-lg font-thin'>{Teacher}</p>
				<p
					className={`text-md font-semibold ${
						lessonNow ? 'bg-[#ffffff33]' : 'bg-[#c10f1a]'
					}  text-white px-4 pb-0.5 rounded-full`}
				>
					{Auditoria}
				</p>
			</div>
		</div>
	)
}

const ScheduleTable = ({ LessonTime, children }) => {
	const [subGroup, setSubGroup] = useState(0)
	return (
		<>
			<div className='w-full flex'>
				<p className='w-1/10 border-r-1 border-b-1 border-gray-400 h-full font-semibold text-xl'>
					{LessonTime}
				</p>
				<div className='p-4 w-full border-b-1 border-gray-400 flex flex-col gap-3'>
					{children}
				</div>
			</div>
		</>
	)
}

const EmptyScheduleTable = ({ LessonTime }) => {
	return (
		<>
			<div className='w-full flex'>
				<p className='w-1/10 border-r-1 border-b-1 border-gray-400 h-full font-semibold text-xl'>
					{LessonTime}
				</p>
				<div className='p-4 w-full border-b-1 border-gray-400'>
					<div className='w-full px-5 py-7'>
						<p className='text-2xl font-thin text-center text-gray-600'>
							Пусто
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

export { ScheduleCard, EmptyScheduleTable, ScheduleTable }
