import React, { useState, useRef, useEffect } from 'react'
import {
	format,
	startOfMonth,
	endOfMonth,
	getDay,
	eachDayOfInterval,
	isToday,
} from 'date-fns'
import { ru } from 'date-fns/locale'

const PhoneNumInput = ({ value, onChange }) => {
	const formatPhone = input => {
		let numbers = input.replace(/\D/g, '')

		if (numbers.startsWith('8')) {
			numbers = '7' + numbers.slice(1)
		}
		if (!numbers.startsWith('7')) {
			numbers = '7' + numbers
		}

		let formatted = '+7'
		if (numbers.length > 1) {
			formatted += ' (' + numbers.slice(1, 4)
		}
		if (numbers.length >= 4) {
			formatted += ') ' + numbers.slice(4, 7)
		}
		if (numbers.length >= 7) {
			formatted += '-' + numbers.slice(7, 9)
		}
		if (numbers.length >= 9) {
			formatted += '-' + numbers.slice(9, 11)
		}

		return formatted
	}

	const handleChange = e => {
		const input = e.target.value
		const formatted = formatPhone(input)
		onChange(formatted)
	}

	return (
		<div className='border-b-3 border-[#00000010] flex w-full gap-5 p-2'>
			<img className='opacity-15 text-red p-1' src='icons/phone.svg' alt='' />
			<input
				type='tel'
				placeholder='+7 (990) 000-00-00'
				maxLength={18}
				value={value}
				onChange={handleChange}
				className='w-full text-2xl font-normal opacity-50 outline-none'
			/>
		</div>
	)
}

const Input = ({
	type,
	placeholder,
	icon_path,
	isLogin,
	icon,
	value,
	onChange,
	isAuth,
}) => {
	return (
		<div className='flex flex-col gap-1 w-full'>
			<div
				className={`flex border-b-2 border-gray-300 w-full ${
					isAuth ? 'p-2 h-15' : 'h-10'
				} px-2 gap-2`}
			>
				{icon && (
					<img
						className='opacity-15 text-red p-1'
						src={`icons/${icon_path}`}
						alt=''
					/>
				)}
				<input
					type={type}
					placeholder={placeholder}
					className={`${
						isAuth ? 'text-2xl opacity-50' : 'text-xl'
					}  font-normal  outline-none`}
					value={value}
					onChange={onChange}
				/>
			</div>
			{isLogin && (
				<p className='font-semibold text-[#820000] cursor-pointer'>
					Забыли пароль?
				</p>
			)}
		</div>
	)
}

const DateInput = ({ onChange }) => {
	const months = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	]

	const [dayStr, setDayStr] = useState('')
	const [month, setMonth] = useState(0)
	const [yearStr, setYearStr] = useState('')

	// Автоматически преобразуем строки в числа, если это возможно
	useEffect(() => {
		const day = parseInt(dayStr)
		const year = parseInt(yearStr)

		onChange?.({
			day: !isNaN(day) ? day : null,
			month,
			year: !isNaN(year) ? year : null,
		})
	}, [dayStr, month, yearStr])

	return (
		<div className='flex flex-col'>
			<p className='ml-3 text-lg'>Дата рождения</p>
			<div className='flex justify-between text-xl w-full h-15 p-2 gap-3'>
				<input
					placeholder='дд'
					maxLength={2}
					type='text'
					value={dayStr}
					onChange={e => setDayStr(e.target.value.replace(/\D/g, ''))} // только цифры
					className='text-center text-xl flex-1 px-1 py-2 outline-none border-b-2 border-gray-300 w-full'
				/>

				<select
					value={month}
					onChange={e => setMonth(Number(e.target.value))}
					className='text-center text-xl flex-1 px-1 py-2 outline-none border-b-2 border-gray-300'
				>
					{months.map((name, index) => (
						<option key={index} value={index}>
							{name}
						</option>
					))}
				</select>

				<input
					placeholder='гггг'
					maxLength={4}
					type='text'
					value={yearStr}
					onChange={e => setYearStr(e.target.value.replace(/\D/g, ''))} // только цифры
					className='text-center text-xl flex-1 px-1 py-2 outline-none border-b-2 border-gray-300 w-full'
				/>
			</div>
		</div>
	)
}

const SelectInput = ({ placeholder, optionsMass, onChange }) => {
	const [value, setValue] = useState(optionsMass[0])

	useEffect(() => {
		onChange?.(value)
	}, [value])

	return (
		<div className='flex flex-col w-full'>
			<p className='ml-3 text-lg'>{placeholder}</p>
			<select
				value={value}
				onChange={e => setValue(e.target.value)}
				className='pl-2 text-xl flex-1 px-1 py-2 outline-none border-b-2 border-gray-300'
			>
				{optionsMass.map((option, index) => (
					<option key={index} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	)
}
const CheckBox = ({ placeholder, onChange, disabled, checked }) => {
	return (
		<label className='checkbox-container'>
			<input
				className='custom-checkbox'
				checked={checked}
				type='checkbox'
				onChange={onChange}
				disabled={disabled}
			/>
			<span className='checkmark'></span>
			<p className='text-lg'>{placeholder} </p>
		</label>
	)
}

const ToggleBtn = ({ off, on }) => {
	return (
		<label for='filter' className='switch' aria-label='Toggle Filter'>
			<input type='checkbox' id='filter' />
			<span className='!px-4 !pb-3 !pt-2 text-xl'>{off}</span>
			<span className='!px-4 !pb-3 !pt-2 text-xl'>{on}</span>
		</label>
	)
}

const Submit = ({ placeholder, disable, onClick, isAuth }) => {
	const handleClick = e => {
		e.preventDefault() // предотврати отправку формы и перезагрузку
		if (!disable && onClick) {
			onClick()
		}
	}

	return (
		<input
			className={`text-white font-semibold rounded-2xl  ${
				disable ? 'bg-gray-300 cursor-default' : 'bg-[#820000] cursor-pointer'
			}  ${
				isAuth ? 'my-10 text-2xl p-5 w-full' : 'text-xl p-3 mx-auto w-2/3'
			} `}
			type='submit'
			value={placeholder}
			disabled={disable}
			onClick={handleClick} // теперь безопасно
		/>
	)
}

const AuthToggleText = ({ text, linkText, onClick }) => {
	return (
		<div className='flex gap-1 text-xl'>
			<p className='cursor-default'>{text}</p>
			<p
				className='text-[#820000] font-semibold cursor-pointer hover:text-[#820000]'
				onClick={onClick}
			>
				{linkText}
			</p>
		</div>
	)
}

const Push = ({ code, setCode }) => {
	const inputsRef = useRef([])

	const handleChange = (e, index) => {
		const value = e.target.value

		// Ввод только одной цифры
		if (/^\d$/.test(value)) {
			const newCode = [...code]
			newCode[index] = value
			setCode(newCode)

			if (index < inputsRef.current.length - 1) {
				inputsRef.current[index + 1].focus()
			}
		} else {
			const newCode = [...code]
			newCode[index] = ''
			setCode(newCode)
		}
	}

	return (
		<div className='flex gap-2'>
			{Array(5)
				.fill(0)
				.map((_, i) => (
					<input
						key={i}
						type='text'
						maxLength={1}
						value={code[i] || ''}
						onChange={e => handleChange(e, i)}
						ref={el => (inputsRef.current[i] = el)}
						className='h-20 w-15 text-2xl text-center rounded-xl shadow-xs border border-[#00000010] outline-none focus:border-[#820000] focus:shadow-sm focus:shadow-[#99000050]'
					/>
				))}
		</div>
	)
}

const Calendar = () => {
	const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
	const [currentDate, setCurrentDate] = useState(new Date())
	const [activeIndex, setActiveIndex] = useState(null)

	const start = startOfMonth(currentDate)
	const end = endOfMonth(currentDate)
	const allDays = eachDayOfInterval({ start, end })

	// getDay() возвращает 0 (вс)–6 (сб), нужно сместить: Пн = 1 => Вс = 7
	const startOffset = (getDay(start) + 6) % 7 // Пример: Вт → 1, Сб → 5

	const prevMonth = () => {
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
		setActiveIndex(null)
	}

	const nextMonth = () => {
		setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
		setActiveIndex(null)
	}

	return (
		<div className='bg-white rounded-2xl p-4'>
			<div className='flex items-center justify-between'>
				<img
					onClick={prevMonth}
					className='hover:scale-115 opacity-50 hover:opacity-100 rotate-180 transition-all cursor-pointer'
					src='icons/chevron-right.svg'
					alt='Previous month'
				/>
				<p className='text-2xl font-bold'>
					{format(currentDate, 'LLLL yyyy', { locale: ru })}
				</p>
				<img
					onClick={nextMonth}
					className='hover:scale-115 opacity-50 hover:opacity-100 transition-all cursor-pointer'
					src='icons/chevron-right.svg'
					alt='Next month'
				/>
			</div>

			<p className='text-lg font-thin'>
				Сегодня {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ru })}
			</p>

			<div className='grid grid-cols-7 gap-2 text-[#820000] mb-1 font-bold mt-2'>
				{weekdays.map((day, index) => (
					<div
						className='h-10 w-10 flex justify-center items-center'
						key={index}
					>
						<p>{day}</p>
					</div>
				))}
			</div>

			<div className='grid grid-cols-7 gap-2'>
				{Array.from({ length: startOffset }).map((_, index) => (
					<div key={`empty-${index}`} className='w-10 h-10'></div>
				))}
				{allDays.map((date, index) => {
					const isActive = index === activeIndex
					const today = isToday(date)
					return (
						<div
							key={index}
							onClick={() => setActiveIndex(index)}
							className={`rounded-lg h-10 w-10 flex justify-center items-center select-none
								${isActive ? 'bg-[#c10f1a] text-white font-semibold' : 'hover:bg-gray-100'}
								${today && !isActive ? 'text-[#c10f1a] font-semibold' : ''}
							`}
						>
							{format(date, 'd')}
						</div>
					)
				})}
			</div>
		</div>
	)
}

const FieldConstructInput = () => {}

export {
	PhoneNumInput,
	Input,
	Submit,
	AuthToggleText,
	Push,
	DateInput,
	SelectInput,
	FieldConstructInput,
	CheckBox,
	ToggleBtn,
	Calendar,
}
