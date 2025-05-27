import { useState, useEffect } from 'react'
import { Input, Submit, SelectInput } from '../../components/Components.jsx'
import ApiClient from '../../../api/api.js'

const Structure = () => {
	const [departments, setDepartments] = useState([])
	const [employees, setEmployees] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [editingDept, setEditingDept] = useState(null)

	// данные формы
	const [deptName, setDeptName] = useState('')
	const [shortName, setShortName] = useState('')
	const [description, setDescription] = useState('')
	const [parentId, setParentId] = useState('')
	const [headId, setHeadId] = useState('')
	const [formValid, setFormValid] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		setFormValid(deptName.trim() && shortName.trim())
	}, [deptName, shortName])

	const loadData = async () => {
		try {
			const [deptData, empData] = await Promise.all([
				ApiClient.getDepartments(),
				ApiClient.getEmployees()
			])
			setDepartments(deptData)
			setEmployees(empData)
		} catch (err) {
			setError('Ошибка загрузки данных')
		} finally {
			setLoading(false)
		}
	}

	const showError = (message) => {
		setError(message)
		setTimeout(() => setError(''), 5000)
	}

	const clearForm = () => {
		setDeptName('')
		setShortName('')
		setDescription('')
		setParentId('')
		setHeadId('')
		setEditingDept(null)
		setShowCreateForm(false)
	}

	const handleCreate = () => {
		clearForm()
		setShowCreateForm(true)
	}

	const handleEdit = (dept) => {
		setDeptName(dept.name)
		setShortName(dept.short_name || '')
		setDescription(dept.description || '')
		setParentId(dept.parent_id || '')
		setHeadId(dept.head?.id || '')
		setEditingDept(dept)
		setShowCreateForm(true)
	}

	const handleSubmit = async () => {
		if (!formValid) return

		setSubmitting(true)
		try {
			const departmentData = {
				name: deptName,
				short_name: shortName,
				description: description,
				parent_id: parentId || null,
				head_user_id: headId || null
			}

			if (editingDept) {
				await ApiClient.updateDepartment(editingDept.id, departmentData)
			} else {
				await ApiClient.createDepartment(departmentData)
			}

			await loadData()
			clearForm()
		} catch (err) {
			showError(err.message || 'Ошибка сохранения')
		} finally {
			setSubmitting(false)
		}
	}

	const handleDelete = async (deptId, deptName) => {
		if (!confirm(`Удалить подразделение "${deptName}"?`)) return

		try {
			await ApiClient.deleteDepartment(deptId)
			await loadData()
		} catch (err) {
			showError(err.message || 'Ошибка удаления')
		}
	}

	// получаем плоский список всех подразделений для выбора родителя
	const getAllDepartments = (depts, level = 0) => {
		let result = []
		depts.forEach(dept => {
			result.push({
				id: dept.id,
				name: '  '.repeat(level) + dept.name,
				level
			})
			if (dept.children && dept.children.length > 0) {
				result = result.concat(getAllDepartments(dept.children, level + 1))
			}
		})
		return result
	}

	const renderDepartmentTree = (depts, level = 0) => {
		return depts.map(dept => (
			<div key={dept.id} className={`${level > 0 ? 'ml-8' : ''}`}>
				<div className='bg-white rounded-xl shadow-sm p-4 mb-3 border-1 border-gray-200 relative'>
					<div className='flex justify-between items-start'>
						<div className='flex-1'>
							<div className='flex items-center gap-3 mb-2'>
								<h3 className='text-lg font-bold'>{dept.name}</h3>
								{dept.short_name && (
									<span className='bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold'>
										{dept.short_name}
									</span>
								)}
							</div>

							{dept.description && (
								<p className='text-gray-600 mb-2'>{dept.description}</p>
							)}

							{dept.head && (
								<div className='flex items-center gap-2 mb-2'>
									<img className='h-5' src='icons/user.svg' alt='' />
									<p className='text-sm'>
										Руководитель: <span className='font-semibold'>{dept.head.name}</span>
									</p>
								</div>
							)}

							<div className='flex items-center gap-2 text-sm text-gray-500'>
								<img className='h-4' src='icons/calendar-days.svg' alt='' />
								<span>Создано: {dept.created_at}</span>
								{dept.children && dept.children.length > 0 && (
									<>
										<span className='mx-2'>•</span>
										<img className='h-4' src='icons/users.svg' alt='' />
										<span>Подразделений: {dept.children.length}</span>
									</>
								)}
							</div>
						</div>

						<div className='flex gap-2'>
							<button
								onClick={() => handleEdit(dept)}
								className='p-2 rounded-lg hover:bg-gray-100 transition-all'
							>
								<img className='h-5' src='icons/square-pen.svg' alt='Редактировать' />
							</button>
							<button
								onClick={() => handleDelete(dept.id, dept.name)}
								className='p-2 rounded-lg hover:bg-red-100 transition-all'
							>
								<img className='h-5 red-icon' src='icons/trash-2.svg' alt='Удалить' />
							</button>
						</div>
					</div>
				</div>

				{dept.children && dept.children.length > 0 && (
					<div className='border-l-2 border-gray-200 pl-4 ml-4'>
						{renderDepartmentTree(dept.children, level + 1)}
					</div>
				)}
			</div>
		))
	}

	if (loading) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<div className='text-xl'>Загрузка структуры...</div>
			</div>
		)
	}

	return (
		<div className='w-full'>
			{error && (
				<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
					{error}
				</div>
			)}

			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-4xl font-bold'>Структура университета</h1>
				<button
					onClick={handleCreate}
					className='flex items-center gap-2 text-white bg-[#820000] px-4 pt-2 pb-3 rounded-lg text-xl font-semibold hover:bg-[#a00000] transition-all'
				>
					<img className='h-6 invert-100' src='icons/plus.svg' alt='' />
					Новое подразделение
				</button>
			</div>

			{showCreateForm && (
				<div className='bg-white rounded-2xl p-6 mb-6 border-1 border-gray-300'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-2xl font-bold'>
							{editingDept ? 'Редактирование подразделения' : 'Новое подразделение'}
						</h2>
						<button
							onClick={clearForm}
							className='text-gray-500 hover:text-gray-700 text-2xl'
						>
							×
						</button>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='flex flex-col'>
							<p className='ml-2 font-semibold mb-2'>
								Название подразделения<span className='text-red-800'>*</span>
							</p>
							<input
								type='text'
								placeholder='Например: Деканат информатики'
								className='border-b-2 text-xl border-gray-300 px-2 py-2 font-normal outline-none'
								value={deptName}
								onChange={e => setDeptName(e.target.value)}
							/>
						</div>

						<div className='flex flex-col'>
							<p className='ml-2 font-semibold mb-2'>
								Краткое название<span className='text-red-800'>*</span>
							</p>
							<input
								type='text'
								placeholder='Например: ДИ'
								className='border-b-2 text-xl border-gray-300 px-2 py-2 font-normal outline-none'
								value={shortName}
								onChange={e => setShortName(e.target.value)}
							/>
						</div>

						<div className='flex flex-col'>
							<p className='ml-2 font-semibold mb-2'>Родительское подразделение</p>
							<select
								value={parentId}
								onChange={e => setParentId(e.target.value)}
								className='border-b-2 text-xl border-gray-300 px-2 py-2 font-normal outline-none'
							>
								<option value=''>Корневое подразделение</option>
								{getAllDepartments(departments)
									.filter(d => !editingDept || d.id !== editingDept.id)
									.map(dept => (
										<option key={dept.id} value={dept.id}>
											{dept.name}
										</option>
									))}
							</select>
						</div>

						<div className='flex flex-col'>
							<p className='ml-2 font-semibold mb-2'>Руководитель</p>
							<select
								value={headId}
								onChange={e => setHeadId(e.target.value)}
								className='border-b-2 text-xl border-gray-300 px-2 py-2 font-normal outline-none'
							>
								<option value=''>Не назначен</option>
								{employees.map(emp => (
									<option key={emp.id} value={emp.id}>
										{emp.name}
									</option>
								))}
							</select>
						</div>

						<div className='col-span-2 flex flex-col'>
							<p className='ml-2 font-semibold mb-2'>Описание</p>
							<textarea
								placeholder='Описание подразделения и его функций'
								className='border-1 text-lg border-gray-300 px-3 py-2 rounded-xl h-24 font-normal outline-none resize-none'
								value={description}
								onChange={e => setDescription(e.target.value)}
							/>
						</div>
					</div>

					<div className='flex gap-3 mt-6'>
						<Submit
							onClick={handleSubmit}
							placeholder={submitting ? 'Сохранение...' : (editingDept ? 'Обновить' : 'Создать')}
							disable={!formValid || submitting}
							isAuth={false}
						/>
						<button
							onClick={clearForm}
							className='px-6 py-3 bg-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-400 transition-all'
						>
							Отмена
						</button>
					</div>
				</div>
			)}

			<div className='space-y-4'>
				{departments.length === 0 ? (
					<div className='h-40 w-full flex items-center justify-center text-2xl text-gray-400 bg-white rounded-2xl border-1 border-gray-200'>
						<div className='flex flex-col items-center gap-3'>
							<img className='h-16 opacity-30' src='icons/file-text.svg' alt='' />
							<p>Подразделения не созданы</p>
						</div>
					</div>
				) : (
					renderDepartmentTree(departments)
				)}
			</div>
		</div>
	)
}

export default Structure