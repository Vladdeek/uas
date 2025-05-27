import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	PhoneNumInput,
	Input,
	Submit,
	AuthToggleText,
	Push,
	DateInput,
	SelectInput,
	CheckBox,
} from '../components/Components'

const Auth = () => {
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)
	const [RegStep, setRegStep] = useState(1)
	const [login, setLogin] = useState(true)
	const [register, setRegister] = useState(true)
	const [student, setStudent] = useState(false)
	const [teacher, setTeacher] = useState(false)
	const [worker, setWorker] = useState(false)
	const [schoolboy, setSchoolboy] = useState(false)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [phone, setPhone] = useState('')
	const [code, setCode] = useState(['', '', '', '', ''])
	const [username, setUsername] = useState('')
	const [nameUser, setNameUser] = useState('')
	const [surname, setSurname] = useState('')
	const [patronymic, setPatronymic] = useState('')
	const [birthDate, setBirthDate] = useState(['', '', ''])
	const [gender, setGender] = useState('')

	useEffect(() => {
		if (isLogin === true) {
			setLogin(!(email.trim() && password.trim()))
		} else {
			if (RegStep === 1) {
				setRegister(!email.trim())
			} else if (RegStep === 2) {
				const filled = code.every(digit => digit !== '')
				setRegister(!filled)
			} else if (RegStep === 3) {
				setRegister(!(email.trim() && password.trim() && username.trim()))
			} else if (RegStep === 4) {
				const isAllNamesFilled =
					surname.trim() && patronymic.trim() && nameUser.trim()
				const hasBirthDate =
					birthDate.day && birthDate.month >= 0 && birthDate.year // учти, что month может быть 0
				const hasGender = gender.trim()
				setRegister(!(isAllNamesFilled && hasBirthDate && hasGender))
			} else if (RegStep === 5) {
				const isAnyRoleChecked = student || teacher || worker || schoolboy
				setRegister(!isAnyRoleChecked)
			}
		}
	}, [
		phone,
		code,
		email,
		password,
		username,
		nameUser,
		patronymic,
		surname,
		birthDate,
		gender,
		student,
		teacher,
		worker,
		schoolboy,
		isLogin,
		RegStep,
	])

	const handleLoginData = () => {
		console.log(
			`Успешная авторизация\n` + `Почта: ${email}\n` + `Пароль: ${password}`
		)
		navigate('/')
	}
	const handleRegData = () => {
		const { day, month, year } = birthDate

		console.log(
			`Успешная регистрация\n` +
				`Номер телефона: ${phone}\n` +
				`Код: ${code}\n` +
				`Почта: ${email}\n` +
				`Имя пользователя: ${username}\n` +
				`Пароль: ${password}\n` +
				`Фамилия: ${surname}\n` +
				`Имя: ${nameUser}\n` +
				`Отчество: ${patronymic}\n` +
				`Дата рождения: ${String(day).padStart(2, '0')}.${String(
					month + 1
				).padStart(2, '0')}.${year}\n` +
				`Пол: ${gender}\n` +
				`Роли:\n` +
				`Студент - ${student ? '✔' : '✘'}\n` +
				`Преподаватель - ${teacher ? '✔' : '✘'}\n` +
				`Сотрудник - ${worker ? '✔' : '✘'}\n` +
				`Школьник - ${schoolboy ? '✔' : '✘'}`
		)
		navigate('/')
	}

	return (
		<div className='relative w-full h-screen flex items-center justify-center overflow-hidden'>
			<div className='square absolute inset-0 z-0 pointer-events-none flex'>
				<span className='flex-1 left-50'></span>
				<span className='flex-1 left-50'></span>
				<span className='flex-1 left-50'></span>
			</div>

			<form className='z-10 absolute bg-[#ffffff] rounded-3xl p-15 backdrop-blur-md shadow-xl w-125'>
				{isLogin ? (
					<div className='flex flex-col items-center gap-5'>
						<p className='text-black text-4xl font-semibold mb-5'>
							Авторизация
						</p>
						<Input
							type='email'
							placeholder='example@email.com'
							icon_path='mail.svg'
							icon={true}
							value={email}
							onChange={e => setEmail(e.target.value)}
							isAuth={true}
						/>
						<Input
							isLogin={isLogin}
							type='password'
							placeholder='Пароль'
							icon_path='lock.svg'
							icon={true}
							value={password}
							onChange={e => setPassword(e.target.value)}
							isAuth={true}
						/>
						<Submit
							placeholder='Войти'
							disable={login}
							onClick={handleLoginData}
							isAuth={true}
						/>
						<AuthToggleText
							text='Еще нет учетной записи?'
							linkText='Регистрация'
							onClick={() => setIsLogin(false)}
						/>
					</div>
				) : (
					<div className='flex flex-col items-center gap-5'>
						<p className='text-black text-4xl font-semibold mb-5'>
							Регистрация
						</p>
						{RegStep === 1 ? (
							<>
								<Input
									type='email'
									placeholder='example@email.com'
									icon_path='mail.svg'
									icon={true}
									value={email}
									onChange={e => setEmail(e.target.value)}
									isAuth={true}
								/>
								<Submit
									placeholder='Продолжить'
									disable={register}
									onClick={() => {
										setRegStep(2)
										setRegister(true)
									}}
									isAuth={true}
								/>
								<AuthToggleText
									text=''
									linkText='У меня уже есть аккаунт'
									onClick={() => setIsLogin(true)}
								/>
							</>
						) : RegStep === 2 ? (
							<>
								<p className='text-center text-xl'>
									Введите код из письма. Мы отправили его на указанный вами
									электронный адрес.
								</p>

								<Push code={code} setCode={setCode} />

								<AuthToggleText
									text=''
									linkText='Отправить новый код'
									onClick={() => setIsLogin(true)}
								/>

								<Submit
									placeholder='Продолжить'
									disable={register}
									onClick={() => {
										setRegStep(3)
										setRegister(true)
									}}
									isAuth={true}
								/>
							</>
						) : RegStep === 3 ? (
							<>
								<Input
									type='text'
									placeholder='Имя пользователя'
									icon_path='user-pen.svg'
									icon={true}
									value={username}
									onChange={e => setUsername(e.target.value)}
									isAuth={true}
								/>

								<Input
									type='password'
									placeholder='Пароль'
									icon_path='lock.svg'
									icon={true}
									value={password}
									onChange={e => setPassword(e.target.value)}
									isAuth={true}
								/>
								<Submit
									placeholder='Продолжить'
									disable={register}
									onClick={() => {
										setRegStep(4)
										setRegister(true)
									}}
									isAuth={true}
								/>
							</>
						) : RegStep === 4 ? (
							<>
								<div className='flex flex-col w-full'>
									<Input
										type='text'
										placeholder='Фамилия'
										icon_path=''
										icon={false}
										value={surname}
										onChange={e => setSurname(e.target.value)}
										isAuth={true}
									/>
									<Input
										type='text'
										placeholder='Имя'
										icon_path=''
										icon={false}
										value={nameUser}
										onChange={e => setNameUser(e.target.value)}
										isAuth={true}
									/>
									<Input
										type='text'
										placeholder='Отчество'
										icon_path=''
										icon={false}
										value={patronymic}
										onChange={e => setPatronymic(e.target.value)}
										isAuth={true}
									/>
								</div>

								<DateInput onChange={setBirthDate} />
								<SelectInput
									placeholder='Пол'
									optionsMass={['Мужской', 'Женский']}
									onChange={setGender}
								/>
								<Submit
									placeholder='Подтвердить'
									disable={register}
									onClick={() => {
										setRegStep(5)
										setRegister(true)
									}}
									isAuth={true}
								/>
							</>
						) : (
							<>
								<div className='flex flex-col w-full'>
									<p className='text-center text-xl font-normal mb-4'>
										Выбор роли
									</p>
									<div className='bg-[#fafafa] rounded-xl  mx-auto p-3 border-1 border-gray-300'>
										<CheckBox
											placeholder={'Студент'}
											disabled={schoolboy && true}
											onChange={() => setStudent(prev => !prev)}
										/>
										<CheckBox
											placeholder={'Преподаватель'}
											disabled={schoolboy && true}
											onChange={() => setTeacher(prev => !prev)}
										/>
										<CheckBox
											placeholder={'Сотрудник'}
											disabled={(teacher && true) || (schoolboy && true)}
											checked={teacher ? true : worker}
											onChange={() => setWorker(prev => !prev)}
										/>
										<CheckBox
											placeholder={'Школьник'}
											disabled={
												(teacher && true) ||
												(student && true) ||
												(worker && true)
											}
											onChange={() => setSchoolboy(prev => !prev)}
										/>
									</div>

									<Submit
										placeholder='Подтвердить'
										disable={register}
										onClick={handleRegData}
										isAuth={true}
									/>
								</div>
							</>
						)}
					</div>
				)}
			</form>
		</div>
	)
}

export default Auth
