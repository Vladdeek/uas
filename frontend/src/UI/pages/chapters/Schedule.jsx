import { CheckBox } from '../../components/Components'
import { EmptyScheduleCard, ScheduleCard } from '../../components/ScheduleCard'

const Schedule = ({ Month, Today }) => {
	return (
		<>
			<div className='w-3/4 border-r-1 h-screen border-gray-400 pr-4'>
				<p className='text-2xl font-bold'>{Month}</p>
				<p className='text-lg font-thin'>{Today}</p>
				<CheckBox placeholder={'Школьник'} />
				<div className='w-full flex mt-3'>
					<div className='w-full flex flex-col'>
						<div className='w-full flex'>
							<p className='w-1/10 border-r-1 border-b-1 border-gray-400 h-full font-semibold text-xl'>
								8:00 - 9:20
							</p>
							<div className='p-4 w-full border-b-1 border-gray-400'>
								<ScheduleCard
									LessonName={'технологии веб разработки'}
									LessonTime={'8:00 - 9:20'}
								/>
							</div>
						</div>
						<div className='w-full flex'>
							<p className='w-1/10 border-r-1 border-b-1 border-gray-400 h-full font-semibold text-xl'>
								9:30 - 10:50
							</p>
							<div className='p-4 w-full border-b-1 border-gray-400'>
								<EmptyScheduleCard />
							</div>
						</div>
						<div className='w-full flex'>
							<p className='w-1/10 border-r-1 border-b-1 border-gray-400 h-full font-semibold text-xl'>
								11:00 - 12:20
							</p>
							<div className='p-4 w-full border-b-1 border-gray-400'>
								<ScheduleCard
									LessonName={'технологии веб разработки'}
									LessonTime={'11:00 - 12:20'}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
export default Schedule
