import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader1 from '../components/loader'
import ApiClient from '../../api/api.js'

const UserCheck = () => {
	const navigate = useNavigate()

	useEffect(() => {
		const checkAuth = () => {
			if (ApiClient.isAuthenticated()) {
				navigate('/main')
			} else {
				navigate('/auth')
			}
		}

		// Небольшая задержка для отображения лоадера
		const timer = setTimeout(checkAuth, 1000)
		return () => clearTimeout(timer)
	}, [navigate])

	return (
		<div className='w-screen h-screen flex items-center justify-center'>
			<Loader1 />
		</div>
	)
}

export default UserCheck
