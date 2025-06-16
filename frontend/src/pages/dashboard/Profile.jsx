import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ApiClient from '../../api/api'
import { Loader } from '../../components/common'

const Profile = () => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [currentUser, setCurrentUser] = useState(null)

	useEffect(() => {
		loadCurrentUser()
		loadUserProfile()
	}, [])

	const loadCurrentUser = () => {
		const userData = ApiClient.getCurrentUser()
		if (userData) {
			setCurrentUser(userData)
		}
	}

	const loadUserProfile = async () => {
		try {
			setLoading(true)
			const userData = await ApiClient.getUserProfile()
			// Загружаем информацию о подразделении пользователя
			if (userData.id) {
				try {
					console.log('Загружаем подразделение для пользователя ID:', userData.id)
					const departmentInfo = await ApiClient.getUserDepartment(userData.id)
					console.log('Информация о подразделении:', departmentInfo)
					userData.department_info = departmentInfo
				} catch (err) {
					console.log('Подразделение не найдено для пользователя:', err)
				}
			}
			setUser(userData)
		} catch (error) {
			console.error('Ошибка загрузки профиля:', error)
			toast.error('Ошибка загрузки профиля')
		} finally {
			setLoading(false)
		}
	}

	// Функция проверки ролей
	const hasRole = requiredRoles => {
		if (!user?.roles || !Array.isArray(user.roles)) return false
		return requiredRoles.some(role => user.roles.includes(role))
	}

	const generateAvatarUrl = (user) => {
		if (!user) return '/icons/user.svg'
		const name = user.full_name || user.username || 'User'
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=820000&color=fff`
	}

	const formatDate = (dateStr) => {
		if (!dateStr) return 'Не указана'
		try {
			return new Date(dateStr).toLocaleDateString('ru-RU')
		} catch {
			return 'Не указана'
		}
	}

	if (loading) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader />
			</div>
		)
	}

	if (!user) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>Ошибка загрузки профиля</h2>
					<p className='text-gray-600'>Не удалось загрузить данные пользователя</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-10 items-center w-full pt-5'>
			<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Основная информация</p>
				</div>
				<div className='flex gap-3'>
					<img className='rounded-full w-20 h-20' src={generateAvatarUrl(user)} alt='Avatar' />
					<div className='flex flex-col gap-2 flex-1'>
						<p className='font-bold text-xl'>{user.full_name || user.username}</p>
						<p className='font-semibold'>{user.roles?.join(', ') || 'Роли не назначены'}</p>
						{/* Показываем дату рождения только если она есть */}
						{(user.profile?.birth_date || user.birth_date || user.birthDate || user.profile?.birthDate) && (
							<p className='font-thin'>
								Дата рождения: {formatDate(user.profile?.birth_date || user.birth_date || user.birthDate || user.profile?.birthDate)}
							</p>
						)}
					</div>
				</div>
			</div>
			
			{user.roles && user.roles.length > 0 && (
				<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
					<div className='flex justify-between items-center'>
						<p className='font-bold text-2xl'>Дополнительная информация</p>
					</div>
					<div className='grid grid-cols-2 gap-5 text-md'>
						{/* Подразделение - только для сотрудников */}
						{hasRole(['Сотрудник']) && (user.department_info?.department_name || user.profile?.department) && (
							<div className='w-full items-center gap-1'>
								<p>Подразделение:</p>
								<p className='font-bold'>{user.department_info?.department_name || user.profile?.department}</p>
							</div>
						)}
						
						{/* Должность - только для сотрудников */}
						{hasRole(['Сотрудник']) && (user.department_info?.role_name || user.profile?.position) && (
							<div className='w-full items-center gap-1'>
								<p>Должность:</p>
								<p className='font-bold'>{user.department_info?.role_name || user.profile?.position}</p>
							</div>
						)}
						
						{/* Ученая степень - только для преподавателей */}
						{hasRole(['Преподаватель']) && user.profile?.academic_degree && (
							<div className='w-full items-center gap-1'>
								<p>Ученая степень:</p>
								<p className='font-bold'>{user.profile?.academic_degree}</p>
							</div>
						)}
						
						{/* Кафедра - для преподавателей и студентов */}
						{(hasRole(['Преподаватель']) || hasRole(['Студент'])) && user.profile?.chair && (
							<div className='w-full items-center gap-1'>
								<p>Кафедра:</p>
								<p className='font-bold'>{user.profile?.chair}</p>
							</div>
						)}
						
						{/* Направление подготовки - только для студентов */}
						{hasRole(['Студент']) && user.profile?.direction && (
							<div className='w-full items-center gap-1'>
								<p>Направление подготовки:</p>
								<p className='font-bold'>{user.profile?.direction}</p>
							</div>
						)}
						
						{/* Курс - только для студентов */}
						{hasRole(['Студент']) && user.profile?.course && (
							<div className='w-full items-center gap-1'>
								<p>Курс:</p>
								<p className='font-bold'>{user.profile?.course}</p>
							</div>
						)}
						
						{/* Группа - только для студентов */}
						{hasRole(['Студент']) && user.profile?.group_name && (
							<div className='w-full items-center gap-1'>
								<p>Группа:</p>
								<p className='font-bold'>{user.profile?.group_name}</p>
							</div>
						)}
						
						{/* Школа - только для школьников */}
						{hasRole(['Школьник']) && user.profile?.school && (
							<div className='w-full items-center gap-1'>
								<p>Школа:</p>
								<p className='font-bold'>{user.profile?.school}</p>
							</div>
						)}
						
						{/* Индикатор администратора */}
						{hasRole(['Админ']) && (
							<div className='w-full items-center gap-1'>
								<p className='font-bold'>Администратор</p>
							</div>
						)}
					</div>
				</div>
			)}

			<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Контактная информация</p>
				</div>
				<div className='flex gap-3 text-md'>
					<div className='w-1/2'>
						<p>Основной email:</p>
						<p className='font-bold'>{user.email || 'Не указан'}</p>
					</div>
					{user.phone && (
						<div className='w-1/2'>
							<p>Основной телефон:</p>
							<p className='font-bold'>{user.phone}</p>
						</div>
					)}
				</div>
			</div>
			
			<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Пароль</p>
					<img className='cursor-pointer' src='icons/square-pen.svg' alt='' />
				</div>
				<div className='flex gap-3 text-md'>
					<div className='w-1/2'>
						<p>Обновлен 2 дня назад</p>
						<p className='font-bold'>•••••••••</p>
					</div>
				</div>
			</div>
			

		</div>
	)
}

export default Profile
