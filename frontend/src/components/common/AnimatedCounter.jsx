import React, { useState, useEffect } from 'react'

const AnimatedCounter = ({ endValue, delay = 0, duration = 2000 }) => {
	const [count, setCount] = useState(0)

	useEffect(() => {
		const timer = setTimeout(() => {
			let start = 0
			const increment = endValue / (duration / 50) // 50ms intervals
			
			const counter = setInterval(() => {
				start += increment
				if (start >= endValue) {
					setCount(endValue)
					clearInterval(counter)
				} else {
					setCount(Math.floor(start))
				}
			}, 50)

			return () => clearInterval(counter)
		}, delay)

		return () => clearTimeout(timer)
	}, [endValue, delay, duration])

	return <span>{count}</span>
}

export default AnimatedCounter 