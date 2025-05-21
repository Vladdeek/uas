import SBChapter from './SBChapter'
const Sidebar = ({ children, username, role, img_path }) => {
	return (
		<aside
			id='logo-sidebar'
			class='fixed top-0 left-0 z-40 w-96 h-screen transition-transform -translate-x-full sm:translate-x-0'
			aria-label='Sidebar'
		>
			<div class='h-full px-3 py-4 overflow-y-auto bg-gray-200'>
				<div className='flex items-center gap-3 mb-3'>
					<img className='rounded-full' src={img_path} alt='' />
					<div className='flex flex-col text-black'>
						<p className='text-xl font-semibold'>
							{username.slice(0, 2).join(' ')}
						</p>
						<p className='text-md font-thin'>{role}</p>
					</div>
				</div>

				<ul class='space-y-2 font-medium'>{children}</ul>
			</div>
		</aside>
	)
}
export default Sidebar
