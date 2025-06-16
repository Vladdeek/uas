import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layout компоненты
import { DashboardLayout, AuthLayout, ProtectedRoute } from './components/layout'

// Страницы
import { 
	Profile, 
	Structure, 
	Schedule, 
	StudyPlan, 
	News 
} from './pages/dashboard'

import { 
	Users, 
	Roles 
} from './pages/users'

import { 
	Applications, 
	NewApplication 
} from './pages/applications'

import { 
	Report 
} from './pages/reports'

import { Auth } from './pages/auth'

// Компоненты конструкторов
import { 
	ApplicationsConstructor 
} from './components/features/applications'

import { 
	ReportsConstructor, 
	Reports 
} from './components/features/reports'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/'
					element={<ProtectedRoute />}
				>
					<Route element={<DashboardLayout />}>
						<Route index element={<Navigate to='profile' />} />
						<Route path='profile' element={<Profile />} />
						<Route path='structure' element={<Structure />} />
						<Route path='users' element={<Users />} />
						<Route path='roles' element={<Roles />} />
						<Route path='applications' element={<Applications />} />
						<Route path='constructor/applications' element={<NewApplication />} />
						<Route path='applications-constructor' element={<ApplicationsConstructor />} />
						<Route path='reports' element={<Reports />} />
						<Route path='reports-constructor' element={<ReportsConstructor />} />
						<Route path='schedule' element={<Schedule />} />
						<Route path='plan' element={<StudyPlan />} />
						<Route path='news' element={<News />} />
						<Route path='load' element={<Report />} />
					</Route>
				</Route>
				<Route path='/auth/*' element={<AuthLayout />}>
					<Route index element={<Auth />} />
					<Route path='login' element={<Auth />} />
					<Route path='register' element={<Auth />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App 