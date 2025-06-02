import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

export default function Sidebar({ username, role, img_path, children }) {
	return (
		<aside
			id='logo-sidebar'
			className='
        fixed top-0 left-0 z-40 w-96 h-screen
        transition-transform -translate-x-full sm:translate-x-0
        bg-[#820000] text-white flex flex-col'
			aria-label='Sidebar'
		>
			{/* ——— шапка ——— */}
			<div className='flex items-center gap-3 px-4 py-3 border-b border-red-900'>
				<img
					src={img_path}
					alt='avatar'
					className='w-12 h-12 rounded-full ring-2 ring-white'
				/>
				<div className='leading-tight'>
					<p className='text-xl font-semibold'>
						{username.slice(0, 2).join(' ')}
					</p>
					<p className='text-md font-thin'>{role}</p>
				</div>
			</div>

			{/* ——— меню ——— */}
			<nav className='flex-1 overflow-y-auto px-3 py-4'>
				<ul className='space-y-2 font-medium flex flex-col'>{children}</ul>
			</nav>

			{/* ——— версия ——— */}
			<p className='mb-2 ml-4 text-white font-semibold'>Версия 0.0.1.4</p>
		</aside>
	)
}

/**
 * SBLink — стилизованная навигационная ссылка
 * Использует иконку, название раздела и активное состояние.
 */
export const SBLink = ({ to, icon_name, chapter_name }) => (
	<li>
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'flex items-center p-2 rounded-lg gap-3 cursor-pointer transition',
					isActive ? 'bg-[#c10f1a]' : 'hover:bg-[#c10f1a]',
				].join(' ')
			}
		>
			<img className='h-6 invert' src={`icons/${icon_name}`} alt='' />
			<span className='flex-1 pb-[2px] whitespace-nowrap font-semibold'>
				{chapter_name}
			</span>
			<img className='h-6 invert' src='icons/chevron-right.svg' alt='chevron' />
		</NavLink>
	</li>
)

export const SBLinkButton = ({ onClick, icon_name, chapter_name }) => (
	<li>
		<button
			onClick={onClick}
			className='
				flex items-center p-2 rounded-lg gap-3 cursor-pointer transition
				hover:bg-[#c10f1a] w-full text-left
			'
		>
			<img className='h-6 invert' src={`icons/${icon_name}`} alt='' />
			<span className='flex-1 pb-[2px] whitespace-nowrap font-semibold'>
				{chapter_name}
			</span>
			<img className='h-6 invert' src='icons/chevron-right.svg' alt='chevron' />
		</button>
	</li>
)

Sidebar.propTypes = {
	username: PropTypes.arrayOf(PropTypes.string).isRequired,
	role: PropTypes.string.isRequired,
	img_path: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
}

SBLink.propTypes = {
	to: PropTypes.string.isRequired,
	icon_name: PropTypes.string.isRequired,
	chapter_name: PropTypes.string.isRequired,
}
