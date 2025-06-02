import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

export default function SideBar({ username, role, img_path, children }) {
	return (
		<aside
			id='logo-sidebar'
			className='
        fixed top-0 left-0 z-40 w-60 h-screen
        transition-transform -translate-x-full sm:translate-x-0
        bg-slate-900 text-slate-100 flex flex-col'
			aria-label='Sidebar'
		>
			{/* ——— шапка ——— */}
			<div className='flex items-center gap-3 p-4 h-16 border-b border-slate-800'>
				<img
					src={img_path}
					alt='avatar'
					className='w-10 h-10 rounded-full ring-2 ring-slate-700'
				/>
				<div className='leading-tight'>
					<div className='font-semibold'>{username.join(' ')}</div>
					<div className='text-xs text-slate-400'>{role}</div>
				</div>
			</div>

			{/* ——— меню ——— */}
			<nav className='flex-1 overflow-y-auto p-4 space-y-1'>
				{/* Навигационные элементы приходят как children */}
				{children}
			</nav>
		</aside>
	)
}

/* первичная стилизация NavLink — чтобы было подчёркнуто активное состояние */
export const SBLink = ({ to, children }) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			[
				'block px-3 py-2 rounded-md transition',
				isActive
					? 'bg-indigo-600 text-white'
					: 'text-slate-200 hover:bg-slate-800',
			].join(' ')
		}
	>
		{children}
	</NavLink>
)

SideBar.propTypes = {
	username: PropTypes.arrayOf(PropTypes.string).isRequired,
	role: PropTypes.string.isRequired,
	img_path: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
}
