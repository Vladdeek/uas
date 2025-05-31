import { motion, AnimatePresence } from 'framer-motion'

const Modal = ({ isOpen, onClose, title, children, buttons }) => {
	if (!isOpen) return null

	return (
		<AnimatePresence>
			<div className='fixed inset-0 z-50 flex items-center justify-center'>
				{/* Затемненный фон */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.5 }}
					exit={{ opacity: 0 }}
					className='absolute inset-0 bg-black'
					onClick={onClose}
				/>

				{/* Модальное окно */}
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					transition={{ duration: 0.2 }}
					className='relative bg-white rounded-3xl p-6 shadow-xl min-w-[400px] z-10'
				>
					{/* Заголовок */}
					{title && (
						<h2 className='text-2xl font-semibold mb-4 text-center'>
							{title}
						</h2>
					)}

					{/* Контент */}
					<div className='mb-6'>{children}</div>

					{/* Кнопки */}
					{buttons && (
						<div className='flex justify-center gap-4'>
							{buttons}
						</div>
					)}
				</motion.div>
			</div>
		</AnimatePresence>
	)
}

export default Modal 