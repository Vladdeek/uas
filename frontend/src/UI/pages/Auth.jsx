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
} from '../components/Components'

const Auth = () => {
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)
	const [RegStep, setRegStep] = useState(1)
	const [login, setLogin] = useState(true)
	const [register, setRegister] = useState(true)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [phone, setPhone] = useState('')
	const [code, setCode] = useState(['', '', '', '', ''])
	const [username, setUsername] = useState('')
	const [nameUser, setNameUser] = useState('')
	const [surname, setSurname] = useState('')
	const [patronymic, setPatronymic] = useState('')

	useEffect(() => {
		if (isLogin === true) {
			setLogin(!(email.trim() && password.trim()))
		} else {
			if (RegStep === 1) {
				const digits = phone.replace(/\D/g, '')
				setRegister(digits.length < 11)
			} else if (RegStep === 2) {
				const filled = code.every(digit => digit !== '')
				setRegister(!filled)
			} else if (RegStep === 3) {
				setRegister(!(email.trim() && password.trim() && username.trim()))
			} else {
				setRegister(!(surname.trim() && patronymic.trim() && nameUser.trim()))
			}
		}
	}, [phone, code, email, password, username, nameUser, patronymic, surname])

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
						/>
						<Input
							isLogin={isLogin}
							type='password'
							placeholder='Пароль'
							icon_path='lock.svg'
							icon={true}
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
						<Submit placeholder='Войти' disable={login} />
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
								<PhoneNumInput value={phone} onChange={setPhone} />
								<Submit
									placeholder='Продолжить'
									disable={register}
									onClick={() => {
										setRegStep(2)
										setRegister(true)
									}}
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
									Введите код из СМС. Мы отправили его на указанный номер
									телефона.
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
								/>
								<Input
									type='email'
									placeholder='example@email.com'
									icon_path='mail.svg'
									icon={true}
									value={email}
									onChange={e => setEmail(e.target.value)}
								/>
								<Input
									type='password'
									placeholder='Пароль'
									icon_path='lock.svg'
									icon={true}
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
								<Submit
									placeholder='Продолжить'
									disable={register}
									onClick={() => {
										setRegStep(4)
										setRegister(true)
									}}
								/>
							</>
						) : (
							<>
								<div className='flex flex-col w-full'>
									<Input
										type='text'
										placeholder='Фамилия'
										icon_path=''
										icon={false}
										value={surname}
										onChange={e => setSurname(e.target.value)}
									/>
									<Input
										type='text'
										placeholder='Имя'
										icon_path=''
										icon={false}
										value={nameUser}
										onChange={e => setNameUser(e.target.value)}
									/>
									<Input
										type='text'
										placeholder='Отчество'
										icon_path=''
										icon={false}
										value={patronymic}
										onChange={e => setPatronymic(e.target.value)}
									/>
								</div>

								<DateInput icon_path={'calendar-days.svg'} />
								<SelectInput
									placeholder='Пол'
									optionsMass={['Мужской', 'Женский']}
								/>
								<Submit placeholder='Подтвердить' disable={register} />
							</>
						)}
					</div>
				)}
			</form>
		</div>
	)
}

export default Auth
