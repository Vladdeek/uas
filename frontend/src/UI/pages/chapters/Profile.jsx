const Profile = ({
	img_path,
	FullName,
	username,
	role,
	BirthDate,
	email,
	phone,
}) => {
	return (
		<div className='flex flex-col gap-10 items-center w-full pt-30'>
			<div className='flex flex-col gap-5 rounded-xl  border-1 border-[#00000015] p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Основная информация</p>
					<p className='cursor-pointer hover:underline'>Редактировать</p>
				</div>
				<div className='flex gap-3'>
					<img className='rounded-full' src={img_path} alt='' />
					<div className='flex flex-col'>
						<p className='font-bold text-xl'>{FullName}</p>
						<p className='font-bold text-[#820000]'>{username}</p>
						<p className='font-thin'>{BirthDate}</p>
						<p className='font-semibold'>{role}</p>
					</div>
				</div>
			</div>
			<div className='flex flex-col gap-5 rounded-xl  border-1 border-[#00000015] p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Контактная информация</p>
					<p className='cursor-pointer hover:underline'>Редактировать</p>
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
			<div className='flex flex-col gap-5 rounded-xl  border-1 border-[#00000015] p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Пароль</p>
					<p className='cursor-pointer hover:underline'>Изменить</p>
				</div>
				<div className='flex gap-3 text-md'>
					<div className='w-1/2'>
						<p>Обновлен 2 дня назад</p>
						<p className='font-bold'>•••••••••</p>
					</div>
				</div>
			</div>
			<div className='flex flex-col gap-5 rounded-xl  border-1 border-[#00000015] p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Двухфакторная аутентификация </p>
					<p className='cursor-pointer hover:underline'>Изменить</p>
				</div>
				<div className='flex gap-3 text-md'>
					<div className='w-1/2'>
						<p>Приложение для генерации кодов </p>
						<p className='font-bold'>Отключено </p>
					</div>
				</div>
			</div>
			<div className='flex flex-col gap-5 rounded-xl  border-1 border-[#00000015] p-4 w-3/5'>
				<div className='flex justify-between items-center'>
					<p className='font-bold text-2xl'>Социальные сети </p>
				</div>
				<div className='grid grid-cols-2 gap-5 text-md'>
					<div className='flex w-full items-center gap-1'>
						<img className='h-6' src='icons/apple.png' alt='' />
						<p className='cursor-pointer hover:underline'>Присоединить</p>
					</div>
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
