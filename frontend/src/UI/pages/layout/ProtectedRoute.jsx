import { Navigate, Outlet } from 'react-router-dom'
import api from '../api/api.js' // ваш ApiClient

export default function ProtectedRoute() {
	return api.isAuthenticated() ? (
		<Outlet /> // рендер вложенных маршрутов
	) : (
		<Navigate to='/auth' replace />
	)
}
