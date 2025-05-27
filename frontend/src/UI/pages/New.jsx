import { useEffect, useState } from 'react'
import { SelectInput, Input, Submit } from '../components/Components'

const New = ({ type }) => {
	const [nameNewForm, setNameNewForm] = useState('')
	const [descriptionNewForm, setDescriptionNewForm] = useState('')
	const [responsible, setResponsible] = useState('')
	const [period, setPeriod] = useState('')
	const [selectedType, setSelectedType] = useState('Текст')
	const [options, setOptions] = useState([])
	const [fieldName, setFieldName] = useState('')
	const [fieldValues, setFieldValues] = useState({})
	const [previewFields, setPreviewFields] = useState([])
	const [isRequired, setIsRequired] = useState(false)
	const [Enabled, setEnabled] = useState(false)

	const handleAddOption = () => {
		setOptions([...options, ''])
	}

	const handleOptionChange = (index, value) => {
		const updatedOptions = [...options]
		updatedOptions[index] = value
		setOptions(updatedOptions)
	}

	const handleRemoveOption = index => {
		const updatedOptions = options.filter((_, i) => i !== index)
		setOptions(updatedOptions)
	}

	const removeField = indexToRemove => {
		setPreviewFields(prevFields =>
			prevFields.filter((_, index) => index !== indexToRemove)
		)
	}

	const handleAddField = () => {
		if (!fieldName.trim()) return

		const newField = {
			name: fieldName,
			type: selectedType,
			required: isRequired,
			options: selectedType === 'Выпадающее меню' ? options : [],
		}

		setPreviewFields(prev => [...prev, newField])

		if (selectedType === 'Выпадающее меню' && options.length > 0) {
			const index = previewFields.length
			setFieldValues(prev => ({ ...prev, [index]: options[0] }))
		}
		setSelectedType('Текст')
		setFieldName('')
		setOptions([])
		setIsRequired(false)
	}

	useEffect(() => {
		setEnabled(!fieldName.trim())
	}, [fieldName])

	return (
		<div className='w-full'>
			<div className='w-full flex gap-3'>
				<div className='w-full flex flex-col gap-3 bg-white px-5 py-7 rounded-2xl'>
					<p className='text-4xl font-bold ml-2'>Основная информация</p>
					<div className='flex flex-col w-full'>
						<p className='ml-2 font-semibold border-gray-950'>
							Название формы {type === 'отчеты' ? 'отчёта' : 'заявки'}
							<span className='text-red-800'>*</span>
						</p>
						<input
							type='text'
							placeholder='Название'
							className='border-b-2 text-xl border-gray-300 px-2 py-1 font-normal outline-none'
							value={nameNewForm}
							onChange={e => setNameNewForm(e.target.value)}
						/>
					</div>
					<div className='flex flex-col w-full'>
						<p className='ml-2 font-semibold border-gray-950'>
							Ответственный<span className='text-red-800'>*</span>
						</p>
						<SelectInput
							optionsMass={['Деканат', 'Отдел кадров']}
							onChange={setResponsible}
						/>
					</div>
					<div className='flex flex-col gap-1 w-full'>
						<p className='ml-2 font-semibold border-gray-950'>
							Описание формы {type === 'отчеты' ? 'отчёта' : 'заявки'}:
						</p>
						<textarea
							placeholder={`Описание`}
							className='border-1 text-lg border-gray-300 px-2 py-1 rounded-xl h-30 font-normal outline-none'
							value={descriptionNewForm}
							onChange={e => setDescriptionNewForm(e.target.value)}
						/>
					</div>
					{type === 'отчеты' ? (
						<div className='flex flex-col w-full'>
							<p className='ml-2 font-semibold border-gray-950'>
								Периодичность<span className='text-red-800'>*</span>
							</p>
							<SelectInput
								optionsMass={['Одноразовый', 'Многоразовый']}
								onChange={setPeriod}
							/>
						</div>
					) : (
						<>
							<div className='flex flex-col w-full'>
								<p className='ml-2 font-semibold border-gray-950'>
									Доступно для:<span className='text-red-800'>*</span>
								</p>
								<SelectInput optionsMass={['1', '2']} onChange={setPeriod} />
							</div>
							<div className='flex gap-2 items-center p-1'>
								<input
									type='checkbox'
									checked={isRequired}
									onChange={() => setIsRequired(prev => !prev)}
								/>
								<p className='text-lg'>Активно после регистрации</p>
							</div>
						</>
					)}
				</div>
				<div className='w-full flex flex-col gap-4 bg-white px-5 py-7 rounded-2xl'>
					<p className='text-4xl font-bold ml-2'>Конструктор полей</p>
					<div className='flex flex-col w-full'>
						<p className='ml-2 font-semibold'>Тип поля:</p>
						<select
							value={selectedType}
							onChange={e => setSelectedType(e.target.value)}
							className='border-b-2 text-xl border-gray-300 px-2 py-1 font-normal outline-none'
						>
							<option value='Текст'>Текст</option>
							<option value='Выпадающее меню'>Выпадающее меню</option>
						</select>
					</div>
					<div className='flex flex-col w-full'>
						<p className='ml-2 font-semibold'>
							Название поля<span className='text-red-800'>*</span>
						</p>
						<input
							type='text'
							placeholder='Название'
							className='border-b-2 text-xl border-gray-300 px-2 py-1 font-normal outline-none'
							value={fieldName}
							onChange={e => setFieldName(e.target.value)}
						/>
					</div>
					<div className='flex gap-2 items-center p-1'>
						<input
							type='checkbox'
							checked={isRequired}
							onChange={() => setIsRequired(prev => !prev)}
						/>
						<p className='text-lg'>Обязательное поле</p>
					</div>
					{selectedType === 'Выпадающее меню' && (
						<div className='flex flex-col gap-2 mt-2'>
							<p className='ml-2 font-semibold'>Варианты выбора</p>
							{options.map((opt, index) => (
								<div key={index} className='flex gap-2 items-center'>
									<input
										type='text'
										placeholder='Вариант'
										className='w-full border-b-2 text-xl border-gray-300 px-2 py-1 font-normal outline-none'
										value={opt}
										onChange={e => handleOptionChange(index, e.target.value)}
									/>
									<button
										onClick={() => handleRemoveOption(index)}
										className='px-2'
									>
										<img
											src='icons/trash-2.svg'
											alt=''
											className='red-icon hover:scale-110 transition-all'
										/>
									</button>
								</div>
							))}
							<button
								onClick={handleAddOption}
								className='mt-2 w-fit px-3 py-1 rounded-lg text-red-700 transition'
							>
								+ Добавить вариант
							</button>
						</div>
					)}
					<Submit
						onClick={handleAddField}
						placeholder={'Добавить поле'}
						isAuth={false}
						disable={Enabled}
					/>
				</div>
			</div>

			<div className='flex flex-col gap-3 w-full mt-4 border-dashed border-gray-400 border-1 rounded-2xl p-2 h-full overflow-auto'>
				<div className='bg-[#c10f1a10] flex flex-col gap-2 border-1 border-[#c10f1a50] rounded-xl p-4'>
					<p className='text-2xl font-semibold'>{nameNewForm}</p>
					<p className='rounded-lg'>{descriptionNewForm}</p>
					<div className='flex items-center gap-3'>
						{responsible && (
							<p className='rounded-full border-1 border-gray-500 text-gray-500 font-semibold bg-gray-200 px-4 pb-1'>
								{responsible}
							</p>
						)}
						{period && (
							<p className='rounded-full border-1 border-gray-500 text-gray-500 font-semibold bg-gray-200 px-4 pb-1'>
								{period}
							</p>
						)}
					</div>
				</div>

				<div className='bg-white flex flex-col gap-4 border-1 border-gray-400 rounded-xl p-3'>
					<p className='text-2xl font-bold'>Созданные поля</p>
					{previewFields.map((field, i) => (
						<div className='flex justify-between border-1 border-gray-200 p-5 bg-[#fafafa] rounded-lg'>
							<div key={i} className=' '>
								<div className='flex gap-3'>
									<p className='text-sm bg-[#c10f1a30] text-[#c10f1a] px-4 pb-0.5 font-semibold rounded-full'>
										<span>{field.type}</span>
									</p>
									{field.required && (
										<p className='text-sm bg-[#c10f1a30] text-[#c10f1a] px-4 pb-0.5 font-semibold rounded-full'>
											<span>Обязательное</span>
										</p>
									)}
								</div>

								<p className='font-semibold text-lg'>{field.name}</p>

								{field.type === 'Выпадающее меню' &&
									field.options?.length > 0 && (
										<p className='text-sm text-gray-700'>
											<span className='font-medium'>Варианты:</span>{' '}
											{field.options.join(', ')}
										</p>
									)}
							</div>
							<button onClick={() => removeField(i)} className='px-2'>
								<img
									src='icons/trash-2.svg'
									alt='Удалить'
									className='red-icon hover:scale-110 transition-all'
								/>
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default New
