import { createRoot } from 'react-dom/client'
import React, { lazy, Suspense, useState, useEffect } from 'react'
import ApiClient from './api/api.js'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from 'react-router-dom'
import './styles.css'
import Auth from './UI/pages/Auth.jsx'
import DashboardLayout from './UI/pages/layout/DashboardLayout.jsx'
import Loader from './UI/components/Loader.jsx'
import StudyPlan from './UI/pages/chapters/StudyPlan.jsx'
import News from './UI/pages/chapters/News.jsx'

// ленивые страницы
const Profile = lazy(() => import('./UI/pages/chapters/Profile.jsx'))
const Applications = lazy(() => import('./UI/pages/chapters/Applications.jsx'))
const Reports = lazy(() => import('./UI/pages/chapters/Report.jsx'))
const Schedule = lazy(() => import('./UI/pages/chapters/Schedule.jsx'))
const ConstructorReports = lazy(() =>
	import('./UI/pages/chapters/ConstructorReports.jsx')
)
const ConstructorApplications = lazy(() =>
	import('./UI/pages/chapters/ConstructorApplications.jsx')
)
const Structure = lazy(() => import('./UI/pages/chapters/Structure.jsx'))
const NewPage = lazy(() => import('./UI/pages/New.jsx'))

function App() {
	const [userData, setUserData] = useState(null)
	const [userRoles, setUserRoles] = useState([])
	const [loading, setLoading] = useState(true)

	const navigate = useNavigate()

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
	}, [navigate])

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

	return (
		<Suspense fallback={<Loader />}>
			<Routes>
				<Route path='/auth' element={<Auth />} />
				<Route path='/' element={<DashboardLayout />}>
					<Route index element={<Navigate to='profile' replace />} />
					<Route
						path='profile'
						element={
							<Profile
								img_path={getAvatar()}
								role={userRoles.join(', ')}
								FullName={userData?.full_name || 'Пользователь'}
								username={userData?.username || 'username'}
								BirthDate={userData?.birth_date || 'Не указано'}
								email={userData?.email || 'email@example.com'}
								phone={userData?.phone || 'Не указан'}
								userRoles={userRoles}
								loading={loading}
							/>
						}
					/>
					<Route path='applications' element={<Applications />} />
					<Route path='reports' element={<Reports />} />
					<Route path='constructor/reports' element={<ConstructorReports />} />
					<Route
						path='constructor/reports/new'
						element={<NewPage type='отчеты' />}
					/>
					<Route
						path='constructor/applications'
						element={<ConstructorApplications />}
					/>
					<Route
						path='constructor/applications/new'
						element={<NewPage type='заявки' />}
					/>
					<Route path='schedule' element={<Schedule userRoles={userRoles} />} />
					<Route path='plan' element={<StudyPlan />} />
					<Route path='load' element={<div>Нагрузка/Поступление</div>} />
					<Route path='news' element={<News />} />
					<Route path='structure' element={<Structure />} />
					<Route
						path='*'
						element={<div className='p-10 text-3xl'>Страница не найдена</div>}
					/>
				</Route>
			</Routes>
		</Suspense>
	)
}

createRoot(document.getElementById('root')).render(
	<Router>
		<App />
	</Router>
)
