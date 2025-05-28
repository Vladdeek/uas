import { CheckBox } from './Components'

const ScheduleCard = ({ LessonName, LessonTime }) => {
	return (
		<>
			<div className='w-full rounded-2xl bg-[#c10f1a25] border-1 border-[#c10f1a75] px-5 py-7'>
				<p className='text-2xl font-bold'>{LessonName}</p>
				<p className='text-lg font-thin'>{LessonTime}</p>
			</div>
		</>
	)
}

const EmptyScheduleCard = () => {
	return (
		<>
			<div className='w-full px-5 py-7'>
				<p className='text-2xl font-thin text-center text-gray-600'>Окно</p>
			</div>
		</>
	)
}

export { ScheduleCard, EmptyScheduleCard }
