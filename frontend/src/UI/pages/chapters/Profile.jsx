const Profile = ({
	img_path,
	FullName,
	username,
	role,
	BirthDate,
	email,
	phone,
	userRoles,
}) => {
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
					<img className='rounded-full' src={img_path} alt='' />
					<div className='flex flex-col'>
						<p className='font-bold text-xl'>{FullName}</p>
						<p className='font-semibold'>{role}</p>
						<p className='font-thin'>{BirthDate}</p>
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
						<p className='font-bold'>{email}</p>
					</div>
					<div className='w-1/2'>
						<p>Основной телефон:</p>
						<p className='font-bold'>{phone}</p>
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
					<p className='font-bold text-2xl'>Двухфакторная аутентификация </p>
					<img className='cursor-pointer' src='icons/square-pen.svg' alt='' />
				</div>
				<div className='flex gap-3 text-md'>
					<div className='w-1/2'>
						<p>Приложение для генерации кодов </p>
						<p className='font-bold'>Отключено </p>
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
