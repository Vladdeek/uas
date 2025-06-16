import { createRoot } from 'react-dom/client'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import App from './App.jsx'
import './styles/styles.css'
import 'react-toastify/dist/ReactToastify.css'

const root = createRoot(document.getElementById('root'))

root.render(
	<React.StrictMode>
		<App />
		<ToastContainer
			position="top-right"
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="light"
		/>
	</React.StrictMode>
)
