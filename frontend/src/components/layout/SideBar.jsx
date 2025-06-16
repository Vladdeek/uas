import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

const primaryColor = '#820000'
const primaryColorLight = '#82000020'

const Sidebar = memo(({ username, role, img_path, children }) => {
	return (
		<aside
			id='logo-sidebar'
			className='
        fixed top-0 left-0 z-40 w-96 h-screen
        transition-transform -translate-x-full sm:translate-x-0
        text-white flex flex-col'
			style={{backgroundColor: '#820000'}}
			aria-label='Sidebar'
		>
			{/* ——— шапка ——— */}
			<div className='flex items-center gap-3 px-4 py-3 border-b border-red-700'>
				<img
					src={img_path}
					alt='avatar'
					className='w-12 h-12 rounded-full ring-2'
					style={{borderColor: primaryColor}}
				/>
				<div className='leading-tight'>
					<p className='text-xl font-semibold'>
						{Array.isArray(username) ? username.slice(0, 2).join(' ') : username}
					</p>
					<p className='text-md font-thin text-red-200'>{role}</p>
				</div>
			</div>

			{/* ——— меню ——— */}
			<nav className='flex-1 overflow-y-auto px-3 py-4 hide-scrollbar'>
				<ul className='space-y-2 font-medium flex flex-col'>{children}</ul>
			</nav>

			{/* ——— версия ——— */}
			<p className='mb-2 ml-4 font-medium text-sm text-red-200'>Версия 0.0.1.4</p>
		</aside>
	)
})

Sidebar.displayName = 'Sidebar'

/**
 * SBSection — заголовок раздела
 */
export const SBSection = memo(({ title }) => (
	<li className="mt-6 mb-2 px-3">
		<div className="text-xs font-semibold uppercase tracking-wider text-red-300">
			{title}
		</div>
	</li>
))

SBSection.displayName = 'SBSection'

/**
 * SBLink — стилизованная навигационная ссылка
 * Использует иконку, название раздела и активное состояние.
 */
export const SBLink = memo(({ to, icon_name, chapter_name }) => (
	<li>
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'flex items-center p-3 rounded-lg gap-3 cursor-pointer transition-colors duration-200 group',
					isActive 
						? 'text-white shadow-lg' 
						: 'text-red-200 hover:text-white',
				].join(' ')
			}
			style={({ isActive }) => isActive ? { backgroundColor: primaryColor } : {}}
					onMouseEnter={(e) => !e.currentTarget.classList.contains('active') && (e.currentTarget.style.backgroundColor = '#600000')}
		onMouseLeave={(e) => !e.currentTarget.classList.contains('active') && (e.currentTarget.style.backgroundColor = '')}
		>
			<img 
				className='h-5 invert opacity-75 group-hover:opacity-100' 
				src={`icons/${icon_name}`} 
				alt='' 
			/>
			<span className='flex-1 whitespace-nowrap font-medium'>
				{chapter_name}
			</span>
			<img 
				className='h-4 invert opacity-50 group-hover:opacity-75 transition-opacity' 
				src='icons/chevron-right.svg' 
				alt='chevron' 
			/>
		</NavLink>
	</li>
))

SBLink.displayName = 'SBLink'

export const SBLinkButton = memo(({ onClick, icon_name, chapter_name }) => (
	<li>
		<button
			onClick={onClick}
			className='
				flex items-center p-3 rounded-lg gap-3 cursor-pointer transition-colors duration-200 group
				w-full text-left text-red-200 hover:text-white
			'
			onMouseEnter={(e) => e.target.style.backgroundColor = '#600000'}
			onMouseLeave={(e) => e.target.style.backgroundColor = ''}
		>
			<img 
				className='h-5 invert opacity-75 group-hover:opacity-100' 
				src={`icons/${icon_name}`} 
				alt='' 
			/>
			<span className='flex-1 whitespace-nowrap font-medium'>
				{chapter_name}
			</span>
			<img 
				className='h-4 invert opacity-50 group-hover:opacity-75 transition-opacity' 
				src='icons/chevron-right.svg' 
				alt='chevron' 
			/>
		</button>
	</li>
))

SBLinkButton.displayName = 'SBLinkButton'

Sidebar.propTypes = {
	username: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.string)
	]).isRequired,
	role: PropTypes.string.isRequired,
	img_path: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
}

SBSection.propTypes = {
	title: PropTypes.string.isRequired,
}

SBLink.propTypes = {
	to: PropTypes.string.isRequired,
	icon_name: PropTypes.string.isRequired,
	chapter_name: PropTypes.string.isRequired,
}

SBLinkButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	icon_name: PropTypes.string.isRequired,
	chapter_name: PropTypes.string.isRequired,
}

export default Sidebar
