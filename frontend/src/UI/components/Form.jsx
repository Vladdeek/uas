import { useState, useRef, useEffect } from 'react'

const Form = ({
	form_count_inputs,
	form_create,
	form_description,
	form_name,
	form_role,
	form_status,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const menuRef = useRef(null)

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	const handleEdit = () => {
		console.log('Редактировать')
		setIsMenuOpen(false)
	}

	const handleDelete = () => {
		console.log('Удалить')
		setIsMenuOpen(false)
	}

	// Закрытие меню при клике вне его
	useEffect(() => {
		const handleClickOutside = event => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	return (
		<>
			<div className='bg-white rounded-3xl shadow-sm p-4 relative'>
				<div className='flex justify-between items-center mb-1'>
					<p className='text-lg font-bold ml-1'>{form_name}</p>
					<div className='relative' ref={menuRef}>
						<img
							onClick={toggleMenu}
							className='cursor-pointer transition-all rounded-xl p-1 hover:bg-[#00000010]'
							src='icons/ellipsis.svg'
							alt='Меню'
						/>
						{isMenuOpen && (
							<div className='absolute right-0 mt-2 w-40 bg-white transition-all rounded-md overflow-hidden shadow-lg z-10 border border-gray-200'>
								<button
									onClick={handleEdit}
									className='flex gap-2 w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100'
								>
									<img className='h-5' src='icons/square-pen.svg' alt='' />
									Редактировать
								</button>
								<button
									onClick={handleDelete}
									className='flex gap-2 w-full text-left px-4 py-2 text-sm font-semibold transition-all text-black hover:bg-red-500 hover:text-white group'
								>
									<img
										className='h-5 group-hover:invert transition-all'
										src='icons/trash-2.svg'
										alt='Удалить'
									/>
									Удалить
								</button>
							</div>
						)}
					</div>
				</div>
				<p className='text-stone-700 font-light h-20 border-1 border-gray-200 rounded-lg px-1'>
					{form_description}
				</p>
				<div className='flex items-center gap-1 opacity-50'>
					<img className='h-5' src='icons/users.svg' alt='' />
					<p className=' mb-1'>
						Ответственный:
						<span className='font-semibold'> {form_role}</span>
					</p>
				</div>
				<div className='flex items-center gap-1 mb-3 opacity-50'>
					<img className='h-5' src='icons/list-ordered.svg' alt='' />
					<p className=' mb-1'>
						Полей: <span className='font-semibold'>{form_count_inputs}</span>
					</p>
				</div>

				<div className='flex gap-3'>
					<p className='bg-gray-200 text-gray-500 pb-1 px-2 rounded-full font-normal'>
						{form_create}
					</p>
					<p className='bg-green-200 text-green-500 pb-1 px-2 rounded-full font-semibold'>
						{form_status}
					</p>
				</div>
			</div>
		</>
	)
}

export default Form
