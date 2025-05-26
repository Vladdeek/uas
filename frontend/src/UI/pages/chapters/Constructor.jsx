import { Children } from 'react'

const Constructor = ({ onClick, ConstName, ConstBtn, children }) => {
	return (
		<>
			<div className=' items-center w-full'>
				<div className='flex justify-between items-center'>
					<h1 className='text-4xl font-bold mb-5'>Конструктор {ConstName}</h1>
					<button
						onClick={onClick}
						className='flex items-center gap-2 text-white bg-[#820000] px-3 pt-1 pb-2 rounded-xl text-2xl font-semibold'
					>
						<img
							className='h-full invert-100 pt-1'
							src='icons/plus.svg'
							alt=''
						/>
						{ConstBtn}
					</button>
				</div>

				<div className='grid grid-cols-4 gap-10'>{children}</div>
			</div>
		</>
	)
}
export default Constructor
