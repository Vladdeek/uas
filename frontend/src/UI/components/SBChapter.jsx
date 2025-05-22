import { useState } from 'react'

const SBChapter = ({ icon_name, chapter_name, isActive, onClick }) => {
	return (
		<li onClick={onClick}>
			<div
				className={`flex items-center p-2 text-white rounded-lg gap-3 cursor-pointer transition
				${isActive ? 'bg-[#c10f1a]' : 'hover:bg-[#c10f1a]'}`}
			>
				<img className='h-6 invert-100' src={`icons/${icon_name}`} alt='' />
				<span className='flex-1 pb-[2px] whitespace-nowrap font-semibold'>
					{chapter_name}
				</span>
				<img
					className='h-6 invert-100'
					src={`icons/chevron-right.svg`}
					alt=''
				/>
			</div>
		</li>
	)
}

const AccordSBChapter = ({ icon_name, chapter_name, children }) => {
	const [isShow, setIsShow] = useState(false)

	const handleClick = () => {
		setIsShow(!isShow)
	}

	return (
		<li onClick={handleClick}>
			<div
				className={`flex flex-col justify-center text-white rounded-lg gap-3 cursor-pointer transition `}
			>
				<div className={`flex gap-3 p-2 rounded-lg hover:bg-[#c10f1a]`}>
					<img className='h-6 invert-100' src={`icons/${icon_name}`} alt='' />
					<span
						className={`flex-1 w-full pb-[2px] whitespace-nowrap font-semibold `}
					>
						{chapter_name}
					</span>
					<img
						className={`h-6 invert-100 transition-all rotate-90 ${
							isShow && 'rotate-y-180'
						}`}
						src={`icons/chevron-right.svg`}
						alt=''
					/>
				</div>
				{isShow && <div className='flex flex-col ml-9 gap-1'>{children}</div>}
			</div>
		</li>
	)
}

const InSBChapter = ({ chapter_name, isActive, onClick }) => {
	return (
		<div
			onClick={onClick}
			className={`flex items-center p-2 text-white rounded-lg gap-3 cursor-pointer transition
				${isActive ? 'bg-[#c10f1a]' : 'hover:bg-[#c10f1a]'}`}
		>
			<span className='flex-1 pb-[2px] whitespace-nowrap font-semibold'>
				{chapter_name}
			</span>
		</div>
	)
}

export default SBChapter
export { AccordSBChapter, InSBChapter }
