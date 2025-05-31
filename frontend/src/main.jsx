import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
	<Router>
		<AnimatePresence mode='wait'>
			<App />
		</AnimatePresence>
	</Router>
)
