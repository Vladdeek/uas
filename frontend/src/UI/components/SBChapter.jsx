const SBChapter = ({ icon_name, chapter_name, isActive, onClick }) => {
	return (
		<li onClick={onClick}>
			<div
				className={`flex items-center p-2 text-gray-900 rounded-lg gap-3 cursor-pointer transition
				${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
			>
				<img className='h-6 invert-0' src={`icons/${icon_name}`} alt='' />
				<span className='flex-1 pb-[2px] whitespace-nowrap font-semibold'>
					{chapter_name}
				</span>
			</div>
		</li>
	)
}

export default SBChapter
