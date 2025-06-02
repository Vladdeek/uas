import { useState, useEffect } from 'react'
import ApiClient from '../../../api/api.js'
const Profile = ({}) => {
	const [userData, setUserData] = useState(null) // Данные пользователя
	const [userRoles, setUserRoles] = useState([]) // Роли пользователя

	useEffect(() => {
		const loadUserData = async () => {
			try {
				const profile = await ApiClient.getUserProfile()
				setUserData(profile)
				setUserRoles(profile.roles || [])
			} catch (error) {
				console.error('Ошибка загрузки профиля:', error)
				if (error.message.includes('401') || error.message.includes('токен')) {
					await ApiClient.logout()
					navigate('/auth')
				}
			} finally {
				setLoading(false)
			}
		}

		loadUserData()
	}, [])

	const getAvatar = () => {
		if (!userData || !userData.full_name) {
			return 'https://ui-avatars.com/api/?name=User&background=f5b7b1&color=fff'
		}

		const names = userData.full_name.split(' ')
		const initials = names.slice(0, 2).join('+')
		const colors = [
			'f5b7b1',
			'e8daef',
			'aed6f1',
			'a2d9ce',
			'abebc6',
			'f9e79f',
			'fad7a0',
			'edbb99',
		]
		const color = colors[userData.id % colors.length]

		return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff`
	}
	// Функция проверки ролей
	const hasRole = requiredRoles => {
		return requiredRoles.some(role => userRoles.includes(role))
	}
	return (
		<div className='flex flex-col gap-10 items-center w-full pt-15'>
			<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Основная информация</p>
				</div>
				<div className='flex gap-3'>
					<img className='rounded-full' src={getAvatar()} alt='' />
					<div className='flex flex-col'>
						<p className='font-bold text-xl'>
							{userData?.full_name || 'Пользователь'}
						</p>
						<p className='font-semibold'>{userRoles.join(', ')}</p>
						<p className='font-thin'>{userData?.birth_date || 'Не указано'}</p>
					</div>
				</div>
			</div>
			{userRoles.length > 0 && (
				<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
					<div className='flex justify-between items-center'>
						<p className='font-bold text-2xl'>Дополнительная информация</p>
					</div>
					<div className='grid grid-cols-2 gap-5 text-md'>
						{hasRole(['Сотрудник']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p>Должность:</p>
									<p className='font-bold'></p>
								</div>
								<div className=' w-full items-center gap-1'>
									<p>Подразделение:</p>
									<p className='font-bold'></p>
								</div>
							</>
						)}
						{hasRole(['Студент']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p>Направление подготовки:</p>
									<p className='font-bold'></p>
								</div>
								<div className=' w-full items-center gap-1'>
									<p>Кафедра:</p>
									<p className='font-bold'></p>
								</div>
								<div className=' w-full items-center gap-1'>
									<p>Курс:</p>
									<p className='font-bold'></p>
								</div>
								<div className=' w-full items-center gap-1'>
									<p>Группа:</p>
									<p className='font-bold'></p>
								</div>
							</>
						)}
						{hasRole(['Преподаватель']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p>Кафедра:</p>
									<p className='font-bold'></p>
								</div>
								<div className=' w-full items-center gap-1'>
									<p>Ученая степень:</p>
									<p className='font-bold'></p>
								</div>
							</>
						)}
						{hasRole(['Абитуриент']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p>СНИЛС:</p>
									<p className='font-bold'></p>
								</div>
							</>
						)}
						{hasRole(['Школьник']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p>Школа:</p>
									<p className='font-bold'></p>
								</div>
							</>
						)}
						{hasRole(['Админ']) && (
							<>
								<div className=' w-full items-center gap-1'>
									<p className='font-bold'>Администратор</p>
								</div>
							</>
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
						<p className='font-bold'>
							{userData?.email || 'email@example.com'}
						</p>
					</div>
					<div className='w-1/2'>
						<p>Основной телефон:</p>
						<p className='font-bold'>{userData?.phone || 'Не указан'}</p>
					</div>
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
			<div className='flex flex-col gap-5 rounded-xl bg-white border-1 border-gray-300 p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Социальные сети </p>
				</div>
				<div className='grid grid-cols-2 gap-5 text-md'>
					<div className='flex w-full items-center gap-1'>
						<img className='h-6' src='icons/vk.png' alt='' />
						<p className='cursor-pointer hover:underline'>Присоединить</p>
					</div>
					<div className='flex w-full items-center gap-1'>
						<img className='h-6' src='icons/yandex.png' alt='' />
						<p className='cursor-pointer hover:underline'>Присоединить</p>
					</div>
				</div>
			</div>
		</div>
	)
}
export default Profile
