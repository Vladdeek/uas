import React from 'react'

// Базовый skeleton элемент
export const SkeletonBox = ({ 
	width = 'w-full', 
	height = 'h-4', 
	className = '',
	delay = 0 
}) => {
	return (
		<div 
			className={`${width} ${height} bg-gray-300 rounded shimmer ${className}`}
			style={{ animationDelay: `${delay}ms` }}
		></div>
	)
}

// Skeleton для карточки
export const SkeletonCard = ({ 
	delay = 0, 
	variant = 'default',
	className = '' 
}) => {
	const variants = {
		default: {
			container: "animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100",
			header: (
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<SkeletonBox width="w-10" height="h-10" className="rounded-lg" />
						<div className="space-y-2">
							<SkeletonBox width="w-24" height="h-5" />
							<SkeletonBox width="w-16" height="h-3" />
						</div>
					</div>
					<div className="flex space-x-2">
						<SkeletonBox width="w-8" height="h-8" className="rounded-lg" />
						<SkeletonBox width="w-8" height="h-8" className="rounded-lg" />
					</div>
				</div>
			),
			content: (
				<div className="space-y-3">
					<SkeletonBox width="w-full" height="h-3" />
					<SkeletonBox width="w-3/4" height="h-3" />
					<SkeletonBox width="w-1/2" height="h-3" />
				</div>
			)
		},
		role: {
			container: "animate-pulse bg-white rounded-xl shadow-sm p-6 border border-gray-100",
			header: (
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<SkeletonBox width="w-10" height="h-10" className="rounded-lg" />
						<div className="space-y-2">
							<SkeletonBox width="w-32" height="h-5" />
							<SkeletonBox width="w-20" height="h-3" />
						</div>
					</div>
					<div className="flex space-x-1">
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
					</div>
				</div>
			),
			content: (
				<div className="space-y-2">
					<SkeletonBox width="w-full" height="h-3" />
					<SkeletonBox width="w-2/3" height="h-3" />
				</div>
			)
		},
		department: {
			container: "animate-pulse bg-white rounded-xl shadow-sm p-6 border border-slate-200",
			header: (
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<SkeletonBox width="w-10" height="h-10" className="rounded-lg" />
						<div className="space-y-2">
							<SkeletonBox width="w-40" height="h-5" />
							<SkeletonBox width="w-24" height="h-3" />
						</div>
					</div>
					<div className="flex space-x-1">
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
						<SkeletonBox width="w-8" height="h-8" className="rounded" />
					</div>
				</div>
			),
			content: (
				<div className="space-y-2">
					<SkeletonBox width="w-full" height="h-3" />
					<SkeletonBox width="w-5/6" height="h-3" />
					<div className="mt-4 pt-4 border-t border-slate-200">
						<SkeletonBox width="w-32" height="h-4" />
					</div>
				</div>
			)
		}
	}

	const selectedVariant = variants[variant] || variants.default

	return (
		<div 
			className={`${selectedVariant.container} ${className}`}
			style={{ animationDelay: `${delay}ms` }}
		>
			{selectedVariant.header}
			{selectedVariant.content}
		</div>
	)
}

// Skeleton для строки таблицы
export const SkeletonRow = ({ 
	columns = 4, 
	delay = 0,
	hasActions = true,
	className = ''
}) => {
	return (
		<tr 
			className={`animate-pulse ${className}`}
			style={{ animationDelay: `${delay}ms` }}
		>
			{Array.from({ length: columns }, (_, index) => (
				<td key={index} className="px-6 py-4 whitespace-nowrap">
					{index === 0 ? (
						<div className="flex items-center space-x-3">
							<SkeletonBox width="w-10" height="h-10" className="rounded-full" />
							<div className="space-y-1">
								<SkeletonBox width="w-24" height="h-4" />
								<SkeletonBox width="w-32" height="h-3" />
							</div>
						</div>
					) : index === columns - 1 && hasActions ? (
						<div className="flex items-center justify-end space-x-2">
							<SkeletonBox width="w-8" height="h-8" className="rounded" />
							<SkeletonBox width="w-8" height="h-8" className="rounded" />
						</div>
					) : (
						<SkeletonBox width="w-20" height="h-4" />
					)}
				</td>
			))}
		</tr>
	)
}

// Skeleton для списка
export const SkeletonList = ({ 
	items = 5, 
	itemHeight = 'h-16',
	className = ''
}) => {
	return (
		<div className={`space-y-4 ${className}`}>
			{Array.from({ length: items }, (_, index) => (
				<div 
					key={index}
					className={`animate-pulse bg-white rounded-lg border border-gray-200 p-4 ${itemHeight}`}
					style={{ animationDelay: `${index * 100}ms` }}
				>
					<div className="flex items-center space-x-3">
						<SkeletonBox width="w-12" height="h-12" className="rounded-lg" />
						<div className="flex-1 space-y-2">
							<SkeletonBox width="w-1/3" height="h-4" />
							<SkeletonBox width="w-1/2" height="h-3" />
						</div>
						<SkeletonBox width="w-16" height="h-6" className="rounded-full" />
					</div>
				</div>
			))}
		</div>
	)
}

// Skeleton для формы
export const SkeletonForm = ({ 
	fields = 4,
	className = ''
}) => {
	return (
		<div className={`space-y-6 ${className}`}>
			{Array.from({ length: fields }, (_, index) => (
				<div key={index} className="animate-pulse" style={{ animationDelay: `${index * 100}ms` }}>
					<SkeletonBox width="w-24" height="h-4" className="mb-2" />
					<SkeletonBox width="w-full" height="h-10" className="rounded-lg" />
				</div>
			))}
			<div className="flex justify-end space-x-3 pt-4">
				<SkeletonBox width="w-20" height="h-10" className="rounded-lg" />
				<SkeletonBox width="w-24" height="h-10" className="rounded-lg" />
			</div>
		</div>
	)
}

// Skeleton для заголовка страницы
export const SkeletonPageHeader = ({ 
	hasActions = true,
	className = ''
}) => {
	return (
		<div className={`animate-pulse bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<SkeletonBox width="w-12" height="h-12" className="rounded-lg mr-4" />
					<div>
						<SkeletonBox width="w-48" height="h-8" className="mb-2" />
						<SkeletonBox width="w-32" height="h-4" />
					</div>
				</div>
				{hasActions && (
					<div className="flex items-center space-x-3">
						<SkeletonBox width="w-24" height="h-10" className="rounded-lg" />
						<SkeletonBox width="w-32" height="h-10" className="rounded-lg" />
					</div>
				)}
			</div>
		</div>
	)
}

// Skeleton для табов
export const SkeletonTabs = ({ 
	tabs = 3,
	className = ''
}) => {
	return (
		<div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
			<div className="border-b border-slate-200 px-6">
				<div className="flex space-x-8">
					{Array.from({ length: tabs }, (_, index) => (
						<div 
							key={index}
							className="animate-pulse py-4"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							<SkeletonBox width="w-16" height="h-4" />
						</div>
					))}
				</div>
			</div>
			<div className="p-6">
				<div className="space-y-4">
					<SkeletonBox width="w-full" height="h-4" />
					<SkeletonBox width="w-3/4" height="h-4" />
					<SkeletonBox width="w-1/2" height="h-4" />
				</div>
			</div>
		</div>
	)
}

// Skeleton для статистики
export const SkeletonStats = ({ 
	items = 4,
	columns = 4,
	className = ''
}) => {
	const gridCols = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
	}

	return (
		<div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
			{Array.from({ length: items }, (_, index) => (
				<div 
					key={index}
					className="animate-pulse bg-white rounded-xl shadow-sm border border-slate-200 p-6"
					style={{ animationDelay: `${index * 100}ms` }}
				>
					<div className="flex items-center justify-between">
						<div>
							<SkeletonBox width="w-16" height="h-4" className="mb-2" />
							<SkeletonBox width="w-12" height="h-8" className="mb-1" />
							<SkeletonBox width="w-20" height="h-3" />
						</div>
						<SkeletonBox width="w-10" height="h-10" className="rounded-lg" />
					</div>
				</div>
			))}
		</div>
	)
} 