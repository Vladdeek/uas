import React from 'react'

const Icon = ({ name, size = 16, className = '', color, style = {} }) => {
	// Объединяем стили
	const combinedStyle = {
		transition: 'filter 0.2s',
		...style
	}

	// Если передан цвет, применяем фильтр для его достижения
	if (color) {
		// Простой способ окрашивания SVG через filter
		if (color === '#770002' || color === 'red') {
			combinedStyle.filter = 'invert(11%) sepia(100%) saturate(7206%) hue-rotate(357deg) brightness(78%) contrast(118%)'
		} else if (color === 'white' || color === '#ffffff') {
			combinedStyle.filter = 'invert(1)'
		} else if (color === 'gray' || color === '#6b7280') {
			combinedStyle.filter = 'invert(0.5)'
		} else {
			// Для других цветов используем стандартный серый
			combinedStyle.filter = 'invert(0.3)'
		}
	} else {
		// По умолчанию темно-серые иконки
		combinedStyle.filter = 'invert(0.3)'
	}

	return (
		<img 
			src={`/icons/${name}.svg`}
			alt=""
			width={size}
			height={size}
			className={`inline-block ${className}`}
			style={combinedStyle}
		/>
	)
}

export default Icon 