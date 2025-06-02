import { createRoot } from 'react-dom/client'
import React, { lazy, Suspense } from 'react'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom'
import './styles.css'
import Auth from './UI/pages/Auth.jsx'
import DashboardLayout from './UI/pages/layout/DashboardLayout.jsx'
import Loader from './UI/components/loader.jsx'

/* ---- ленивые страницы (бывшие case-ветки) ---- */
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

createRoot(document.getElementById('root')).render(
	<Router>
		<Suspense fallback={<Loader />}>
			<Routes>
				{/* публичный маршрут */}
				<Route path='/auth' element={<Auth />} />

				{/* защищённая зона */}
				<Route path='/' element={<DashboardLayout />}>
					<Route index element={<Navigate to='profile' replace />} />

					<Route path='profile' element={<Profile />} />
					<Route path='applications' element={<Applications />} />

					{/* отчёты и конструктор отчётов */}
					<Route path='reports' element={<Reports chap='Все отчеты' />} />
					<Route
						path='constructor/reports'
						element={<ConstructorReports key='reports' />}
					/>
					<Route
						path='constructor/reports/new'
						element={<NewPage type='отчеты' />}
					/>

					{/* заявки и конструктор заявок */}
					<Route
						path='constructor/applications'
						element={<ConstructorApplications key='apps' />}
					/>
					<Route
						path='constructor/applications/new'
						element={<NewPage type='заявки' />}
					/>

					<Route path='schedule' element={<Schedule />} />
					<Route path='plan' element={<div>Учебный план</div>} />
					<Route path='load' element={<div>Нагрузка/Поступление</div>} />
					<Route path='news' element={<div>Новости</div>} />
					<Route path='structure' element={<div>Структура</div>} />

					{/* 404 */}
					<Route
						path='*'
						element={<div className='p-10 text-3xl'>Страница не найдена</div>}
					/>
				</Route>
			</Routes>
		</Suspense>
	</Router>
)
