import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './styles.css'
import Auth from './UI/pages/Auth.jsx'
import General from './UI/pages/General.jsx'

createRoot(document.getElementById('root')).render(
	<Router>
		<Routes>
			<Route path='/auth' element={<Auth />} />
			<Route path='/' element={<General />} />
		</Routes>
	</Router>
)
