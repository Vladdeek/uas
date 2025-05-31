import { Routes, Route, useLocation } from 'react-router-dom'
import Auth from './UI/pages/Auth'
import General from './UI/pages/General'
import UserCheck from './UI/pages/UserCheck'
import PageTransition from './UI/components/PageTransition'

const App = () => {
	const location = useLocation()

	return (
		<PageTransition>
			<Routes location={location} key={location.pathname}>
				<Route path='/auth' element={<Auth />} />
				<Route path='/main' element={<General />} />
				<Route path='/' element={<UserCheck />} />
			</Routes>
		</PageTransition>
	)
}

export default App 