const url = ['http://localhost:5000/api']

// API клиент для работы с бэкендом
const API_BASE_URL = url[0]

class ApiClient {
	constructor() {
		this.token = localStorage.getItem('access_token')
		this.isRefreshing = false
		this.failedQueue = []
		this.refreshTimeout = null
		this.setupTokenRefresh()
	}

	// Настройка автоматического обновления токена
	setupTokenRefresh() {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout)
		}

		const token = localStorage.getItem('access_token')
		if (token) {
			try {
				// Декодируем JWT токен
				const base64Url = token.split('.')[1]
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
				const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
				}).join(''))
				const { exp } = JSON.parse(jsonPayload)

				// Устанавливаем таймер на обновление за 5 минут до истечения
				const currentTime = Math.floor(Date.now() / 1000)
				const timeUntilExpiry = exp - currentTime
				const refreshTime = Math.max(timeUntilExpiry - 300, 0) * 1000 // за 5 минут до истечения

				if (refreshTime > 0) {
					this.refreshTimeout = setTimeout(() => {
						this.refreshToken()
							.then(() => this.setupTokenRefresh())
							.catch(console.error)
					}, refreshTime)
				}
			} catch (error) {
				console.error('Ошибка при настройке обновления токена:', error)
			}
		}
	}

	// Обработка очереди запросов
	processQueue(error, token = null) {
		this.failedQueue.forEach(prom => {
			if (error) {
				prom.reject(error)
			} else {
				prom.resolve(token)
			}
		})
		this.failedQueue = []
	}

	// базовый метод для запросов
	async request(endpoint, options = {}) {
		const url = `${API_BASE_URL}${endpoint}`

		const executeRequest = async (token = this.token) => {
			const config = {
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				...options,
			}

			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}

			const response = await fetch(url, config)
			if (response.status === 401 && endpoint !== '/auth/refresh') {
				// Если это первый запрос, получивший 401
				if (!this.isRefreshing) {
					this.isRefreshing = true
					try {
						const refreshResult = await this.refreshToken()
						this.isRefreshing = false
						this.processQueue(null, refreshResult.access_token)
						// Повторяем исходный запрос с новым токеном
						return this.request(endpoint, options)
					} catch (error) {
						this.isRefreshing = false
						this.processQueue(error, null)
						await this.logout()
						throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
					}
				} else {
					// Если токен уже обновляется, добавляем запрос в очередь
					return new Promise((resolve, reject) => {
						this.failedQueue.push({ resolve, reject })
					}).then(() => {
						return this.request(endpoint, options)
					})
				}
			}

			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Ошибка API')
			}
			return data
		}

		try {
			return await executeRequest()
		} catch (error) {
			console.error('API Error:', error)
			throw error
		}
	}

	// методы авторизации
	async registerStep1(email) {
		return this.request('/auth/register-step1', {
			method: 'POST',
			body: JSON.stringify({ email }),
		})
	}

	async verifyCode(email, code) {
		return this.request('/auth/verify-code', {
			method: 'POST',
			body: JSON.stringify({ email, code }),
		})
	}

	async registerStep3(email, username, password) {
		return this.request('/auth/register-step3', {
			method: 'POST',
			body: JSON.stringify({ email, username, password }),
		})
	}

	async registerStep4(email, profileData) {
		return this.request('/auth/register-step4', {
			method: 'POST',
			body: JSON.stringify({ email, ...profileData }),
		})
	}

	async registerComplete(email, roles) {
		return this.request('/auth/register-complete', {
			method: 'POST',
			body: JSON.stringify({ email, roles }),
		})
	}

	async resendCode(email) {
		return this.request('/auth/resend-code', {
			method: 'POST',
			body: JSON.stringify({ email }),
		})
	}

	async login(email, password) {
		const response = await this.request('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		})

		// сохраняем токены и настраиваем автообновление
		if (response.access_token) {
			localStorage.setItem('access_token', response.access_token)
			localStorage.setItem('refresh_token', response.refresh_token)
			localStorage.setItem('user_data', JSON.stringify(response.user))
			this.token = response.access_token
			this.setupTokenRefresh()
		}

		return response
	}

	async refreshToken() {
		const refreshToken = localStorage.getItem('refresh_token')
		if (!refreshToken) {
			throw new Error('Нет refresh токена')
		}

		const response = await this.request('/auth/refresh', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${refreshToken}`,
			},
		})

		localStorage.setItem('access_token', response.access_token)
		this.token = response.access_token
		this.setupTokenRefresh() // Обновляем таймер после успешного обновления токена
		return response
	}

	async logout() {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout)
		}
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('user_data')
		this.token = null
	}

	// работа с профилем
	async getUserProfile() {
		const data = await this.request('/user/profile')
		if (data.profile) {
			const names = [
				data.profile.last_name,
				data.profile.first_name,
				data.profile.middle_name
			].filter(Boolean)
			data.full_name = names.join(' ') || data.username
		} else {
			data.full_name = data.username
		}
		return data
	}

	// работа с формами
	async getForms() {
		return this.request('/forms')
	}

	async createForm(formData) {
		return this.request('/forms', {
			method: 'POST',
			body: JSON.stringify(formData),
		})
	}

	async deleteForm(formId) {
		return this.request(`/forms/${formId}`, {
			method: 'DELETE',
		})
	}

	// работа со структурой подразделений
	async getDepartments() {
		return this.request('/departments')
	}

	async createDepartment(departmentData) {
		return this.request('/departments', {
			method: 'POST',
			body: JSON.stringify(departmentData),
		})
	}

	async updateDepartment(departmentId, departmentData) {
		return this.request(`/departments/${departmentId}`, {
			method: 'PUT',
			body: JSON.stringify(departmentData),
		})
	}

	async deleteDepartment(departmentId) {
		return this.request(`/departments/${departmentId}`, {
			method: 'DELETE',
		})
	}

	// Новые методы для работы с должностями и сотрудниками подразделений
	async getPositions() {
		return this.request('/departments/positions')
	}

	async createPosition(positionData) {
		return this.request('/departments/positions', {
			method: 'POST',
			body: JSON.stringify(positionData),
		})
	}

	async getDepartmentUsers(departmentId) {
		return this.request(`/departments/${departmentId}/users`)
	}

	async assignUserToDepartment(departmentId, userId, positionId) {
		return this.request(`/departments/${departmentId}/users`, {
			method: 'POST',
			body: JSON.stringify({
				user_id: userId,
				position_id: positionId
			}),
		})
	}

	async removeUserFromDepartment(departmentId, userId) {
		return this.request(`/departments/${departmentId}/users/${userId}`, {
			method: 'DELETE',
		})
	}

	async getEmployees() {
		return this.request('/user/employees')
	}

	// утилиты
	isAuthenticated() {
		return !!this.token && !!localStorage.getItem('user_data')
	}

	getCurrentUser() {
		const userData = localStorage.getItem('user_data')
		return userData ? JSON.parse(userData) : null
	}

	// создание тестового админа
	async createTestAdmin() {
		return this.request('/test/create-admin', {
			method: 'POST',
		})
	}

	// Методы для работы с пользователями и ролями
	async getUsers() {
		return this.request('/user/all', {
			method: 'GET'
		})
	}

	async getRoles() {
		return this.request('/user/roles', {
			method: 'GET'
		})
	}

	async createRole(roleData) {
		return this.request('/user/roles', {
			method: 'POST',
			body: JSON.stringify(roleData)
		})
	}

	async updateUserRoles(userId, roleIds) {
		return this.request(`/user/${userId}/roles`, {
			method: 'PUT',
			body: JSON.stringify({ role_ids: roleIds })
		})
	}
}

export default new ApiClient()
