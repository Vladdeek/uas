import { Children, useState } from 'react'
import { CheckBox } from './Components'

const ScheduleCard = ({
	LessonName,
	LessonTime,
	Auditoria,
	Teacher,
	lessonNow,
	lessonType,
	sub_group,
}) => {
	return (
		<div
			className={`w-full rounded-md  shadow-[1px_1px_10px_rgba(0,0,0,0.05)] px-6 py-4 ${
				lessonNow
					? 'bg-[#c10f1a] text-white'
					: 'bg-white border-l-6 border-[#c10f1a]'
			}`}
		>
			<div
				className={
					(typeof lessonType !== 'undefined' && 'flex items-center gap-2') ||
					(typeof sub_group !== 'undefined' && 'flex items-center gap-2')
				}
			>
				<p
					className={`text-2xl font-semibold ${
						typeof lessonType !== 'undefined' && 'pb-1'
					}`}
				>
					{LessonName}
				</p>
				{typeof lessonType !== 'undefined' && (
					<p
						className={`text-md font-semibold px-4 pb-0.5 rounded-full ${
							lessonNow ? 'bg-[#ffffff33]' : 'bg-gray-200 text-gray-500'
						} `}
					>
						{lessonType}
					</p>
				)}
				{typeof sub_group !== 'undefined' && (
					<p className={lessonNow ? 'text-white' : 'text-gray-500'}>
						{sub_group} пг.
					</p>
				)}
			</div>
			<p className='text-lg font-normal'>{LessonTime}</p>
			<div className='flex justify-between items-center'>
				<p className='text-lg font-thin'>{Teacher}</p>
				<p
					className={`text-md font-semibold ${
						lessonNow ? 'bg-[#ffffff33]' : 'bg-[#c10f1a]'
					}  text-white px-4  rounded-full`}
				>
					{Auditoria}
				</p>
			</div>
		</div>
	)
}

const TeacherScheduleCard = ({
	LessonName,
	LessonTime,
	Auditoria,
	Group,
	lessonNow,
	lessonType,
	sub_group,
}) => {
	return (
		<>
			<div className='w-full flex flex-col gap-3'>
				<div
					className={`w-full rounded-md  shadow-[1px_1px_10px_rgba(0,0,0,0.05)] px-6 py-4 ${
						lessonNow
							? 'bg-[#c10f1a] text-white'
							: 'bg-white border-l-6 border-[#c10f1a]'
					}`}
				>
					<div className={lessonType.length > 0 && 'flex items-center gap-2'}>
						<p
							className={`text-2xl font-semibold ${
								lessonType.length > 0 && 'pb-1'
							}`}
						>
							{LessonName}
						</p>
						{lessonType.length > 0 && (
							<p
								className={`text-md font-semibold px-4 pb-0.5 rounded-full ${
									lessonNow ? 'bg-[#ffffff33]' : 'bg-gray-200 text-gray-500'
								} `}
							>
								{lessonType}
							</p>
						)}
					</div>

					<p className='text-lg font-normal'>{LessonTime}</p>
					<div className='flex justify-between items-center'>
						<div className='flex gap-1'>
							{Group.map((group, index) => (
								<>
									<div
										key={index}
										className={`flex justify-center items-centertext-md font-semibold px-4 rounded-full ${
											lessonNow ? 'bg-[#ffffff33]' : 'bg-gray-200 text-gray-500'
										} `}
									>
										<p>{group}</p>
									</div>
								</>
							))}
							{typeof sub_group !== 'undefined' && (
								<p className={lessonNow ? 'text-white' : 'text-gray-500'}>
									{sub_group} пг.
								</p>
							)}
						</div>
						<p
							className={`text-md font-semibold ${
								lessonNow ? 'bg-[#ffffff33]' : 'bg-[#c10f1a]'
							}  text-white px-4 rounded-full`}
						>
							{Auditoria}
						</p>
					</div>
				</div>
			</div>
		</>
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

const EmptyScheduleTable = () => {
	return (
		<>
			<div className=' w-full'>
				<div className='w-full px-5 py-3'>
					<p className='text-2xl font-thin text-center text-gray-600'>Пусто</p>
				</div>
			</div>
		</>
	)
}

export { ScheduleCard, EmptyScheduleTable, ScheduleTable, TeacherScheduleCard }
