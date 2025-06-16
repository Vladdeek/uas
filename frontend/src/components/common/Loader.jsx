import React from 'react'

const Loader = ({ 
	text = '', 
	size = 'md', // 'sm', 'md', 'lg'
	variant = 'honeycomb', // 'honeycomb', 'spinner'
	centered = true,
	className = ''
}) => {
	const sizeClasses = {
		sm: 'scale-75',
		md: 'scale-100',
		lg: 'scale-125'
	}

	const renderHoneycombLoader = () => (
		<div className={`honeycomb ${sizeClasses[size]}`} style={{
			'--honeycomb-color': '#770002',
			'--honeycomb-shadow': '#77000240'
		}}>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	)

	const renderSpinnerLoader = () => (
		<div className={`animate-spin rounded-full border-4 border-gray-200 border-t-[#770002] ${
			size === 'sm' ? 'w-8 h-8' : 
			size === 'md' ? 'w-12 h-12' : 
			'w-16 h-16'
		}`}></div>
	)

	const content = (
		<div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
			{variant === 'honeycomb' ? renderHoneycombLoader() : renderSpinnerLoader()}
			{text && (
				<div 
					className={`font-medium ${
						size === 'sm' ? 'text-sm' : 
						size === 'md' ? 'text-base' : 
						'text-lg'
					}`}
					style={{ color: '#770002' }}
				>
					{text}
				</div>
			)}
		</div>
	)

	if (centered) {
		return (
			<div className="flex items-center justify-center min-h-[200px] w-full">
				{content}
			</div>
		)
	}

	return content
}

export default Loader
