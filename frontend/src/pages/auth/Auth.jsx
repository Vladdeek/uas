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
} from '../../components/common'
import ApiClient from '../../api/api.js'

const Auth = () => {
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)
	const [regStep, setRegStep] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// состояния для валидации
	const [loginValid, setLoginValid] = useState(false)
	const [registerValid, setRegisterValid] = useState(false)

	// данные для регистрации
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [code, setCode] = useState(['', '', '', '', ''])

	// личные данные
	const [surname, setSurname] = useState('')
	const [nameUser, setNameUser] = useState('')
	const [patronymic, setPatronymic] = useState('')
	const [birthDate, setBirthDate] = useState(null)
	const [gender, setGender] = useState('')



	// валидация в зависимости от шага
	useEffect(() => {
		if (isLogin) {
			setLoginValid(email.trim() && password.trim())
		} else {
			switch (regStep) {
				case 1:
					setRegisterValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
					break
				case 2:
					setRegisterValid(code.every(digit => digit !== ''))
					break
				case 3:
					const isUsernameValid = username.trim() !== ''
					const isPasswordValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
					setRegisterValid(isUsernameValid && isPasswordValid)
					break
				case 4:
					const hasNames =
						surname.trim() && nameUser.trim() && patronymic.trim()
					const hasBirthDate = birthDate && birthDate.day && birthDate.year
					const hasGender = gender.trim()
					setRegisterValid(hasNames && hasBirthDate && hasGender)
					break
				default:
					setRegisterValid(false)
			}
		}
	}, [
		isLogin,
		regStep,
		email,
		password,
		username,
		code,
		surname,
		nameUser,
		patronymic,
		birthDate,
		gender,
	])

	const showError = message => {
		setError(message)
		setTimeout(() => setError(''), 5000)
	}

	const showSuccess = message => {
		setSuccess(message)
		setTimeout(() => setSuccess(''), 5000)
	}

	const handleLogin = async () => {
		if (!loginValid) return

		setLoading(true)
		try {
			const response = await ApiClient.login(email, password)
			console.log('Успешная авторизация:', response.user)
			navigate('/')
		} catch (error) {
			showError(error.message || 'Ошибка авторизации')
		} finally {
			setLoading(false)
		}
	}

	const handleRegStep1 = async () => {
		if (!registerValid) return

		setLoading(true)
		try {
			await ApiClient.registerStep1(email)
			setRegStep(2)
			setRegisterValid(false)
		} catch (error) {
			showError(error.message || 'Ошибка отправки кода')
		} finally {
			setLoading(false)
		}
	}

	const handleRegStep2 = async () => {
		if (!registerValid) return

		setLoading(true)
		try {
			const codeString = code.join('')
			await ApiClient.verifyCode(email, codeString)
			setRegStep(3)
			setRegisterValid(false)
		} catch (error) {
			showError(error.message || 'Неверный код')
		} finally {
			setLoading(false)
		}
	}

	const handleRegStep3 = async () => {
		if (!registerValid) return

		setLoading(true)
		try {
			await ApiClient.registerStep3(email, username, password)
			setRegStep(4)
			setRegisterValid(false)
		} catch (error) {
			showError(error.message || 'Ошибка сохранения данных')
		} finally {
			setLoading(false)
		}
	}

	const handleRegStep4 = async () => {
		if (!registerValid) return

		setLoading(true)
		try {
			const profileData = {
				first_name: nameUser,
				last_name: surname,
				middle_name: patronymic,
				birth_date: `${birthDate.year}-${String(birthDate.month + 1).padStart(
					2,
					'0'
				)}-${String(birthDate.day).padStart(2, '0')}`,
				gender: gender,
			}

			await ApiClient.registerStep4(email, profileData)
			
			// Сразу завершаем регистрацию без выбора ролей
			await ApiClient.registerComplete(email, []) // Пустой массив ролей
			
			console.log('Регистрация завершена успешно без ролей')
			// автоматически логинимся
			await ApiClient.login(email, password)
			navigate('/')
		} catch (error) {
			showError(error.message || 'Ошибка завершения регистрации')
		} finally {
			setLoading(false)
		}
	}



	const resendCode = async () => {
		try {
			await ApiClient.resendCode(email)
			showSuccess('Новый код отправлен на email')
		} catch (error) {
			showError(error.message || 'Ошибка отправки кода')
		}
	}

	return (
		<div className='relative w-full h-screen flex items-center justify-center overflow-hidden'>
			<div className='square absolute inset-0 z-0 pointer-events-none flex'>
				<span className='flex-1 left-50'></span>
				<span className='flex-1 left-50'></span>
				<span className='flex-1 left-50'></span>
			</div>

			<form className='z-10 absolute bg-[#ffffff] rounded-3xl p-15 backdrop-blur-md shadow-xl w-125'>
				{error && (
					<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
						{error}
					</div>
				)}

				{success && (
					<div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
						{success}
					</div>
				)}

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
							placeholder={loading ? 'Входим...' : 'Войти'}
							disable={!loginValid || loading}
							onClick={handleLogin}
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
						{regStep === 1 ? (
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
									placeholder={loading ? 'Отправляем...' : 'Продолжить'}
									disable={!registerValid || loading}
									onClick={handleRegStep1}
									isAuth={true}
								/>
								<AuthToggleText
									text=''
									linkText='У меня уже есть аккаунт'
									onClick={() => setIsLogin(true)}
								/>
							</>
						) : regStep === 2 ? (
							<>
								<p className='text-center text-xl'>
									Введите код из письма. Мы отправили его на указанный вами
									электронный адрес.
								</p>

								<Push code={code} setCode={setCode} />

								<AuthToggleText
									text=''
									linkText='Отправить новый код'
									onClick={resendCode}
								/>

								<Submit
									placeholder={loading ? 'Проверяем...' : 'Продолжить'}
									disable={!registerValid || loading}
									onClick={handleRegStep2}
									isAuth={true}
								/>
							</>
						) : regStep === 3 ? (
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
									placeholder={loading ? 'Сохраняем...' : 'Продолжить'}
									disable={!registerValid || loading}
									onClick={handleRegStep3}
									isAuth={true}
								/>
							</>
						) : regStep === 4 ? (
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
									placeholder={loading ? 'Завершаем регистрацию...' : 'Завершить регистрацию'}
									disable={!registerValid || loading}
									onClick={handleRegStep4}
									isAuth={true}
								/>
							</>
						) : null}
					</div>
				)}
			</form>
		</div>
	)
}

export default Auth
