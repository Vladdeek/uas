import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './styles.css'
import Auth from './UI/pages/Auth.jsx'
import General from './UI/pages/General.jsx'
import UserCheck from './UI/pages/UserCheck.jsx'

createRoot(document.getElementById('root')).render(
	<Router>
		<Routes>
			<Route path='/auth' element={<Auth />} />
			<Route path='/main' element={<General />} />
			<Route path='/' element={<UserCheck />} />
		</Routes>
	</Router>
)
