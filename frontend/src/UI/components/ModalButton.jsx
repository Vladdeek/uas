const ModalButton = ({ onClick, variant = 'primary', children }) => {
	const baseClasses = 'px-6 py-2 rounded-xl font-medium transition-all duration-200 ease-in-out'
	const variants = {
		primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
		secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
		danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
	}

	return (
		<button
			onClick={onClick}
			className={`${baseClasses} ${variants[variant]}`}
		>
			{children}
		</button>
	)
}

export default ModalButton 