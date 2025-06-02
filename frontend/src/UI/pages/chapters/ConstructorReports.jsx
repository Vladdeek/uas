import { Children } from 'react'

const ConstructorReports = ({
	onClick,
	ConstName,
	ConstBtn,
	children,
	type,
}) => {
	return (
		<>
			<div className=' items-center w-full'>
				<div className='flex justify-between items-center'>
					<h1 className='text-4xl font-bold mb-5'>Конструктор {ConstName}</h1>
					<button
						onClick={onClick}
						className='flex items-center gap-2 text-white bg-[#820000] px-3 pt-1 pb-2 rounded-lg text-2xl font-semibold'
					>
						<img
							className='h-full invert-100 pt-1'
							src='icons/plus.svg'
							alt=''
						/>
						{ConstBtn}
					</button>
				</div>

				<div className={` ${!type ? 'grid grid-cols-4 gap-10' : 'w-full'}`}>
					{children}
				</div>
			</div>
		</>
	)
}
export default ConstructorReports
