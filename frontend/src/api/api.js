const url = ['http://localhost:5000/api', 'http://82.202.130.12:5000/api']

// API клиент для работы с бэкендом
const API_BASE_URL = url[1]

class ApiClient {
	constructor() {
		this.token = localStorage.getItem('access_token')
	}

	// базовый метод для запросов
	async request(endpoint, options = {}, retry = true) {
	const url = `${API_BASE_URL}${endpoint}`

	const config = {
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	}

	// ✅ добавляем токен
	if (this.token) {
		config.headers.Authorization = `Bearer ${this.token}`
		console.log("🔐 Using token:", this.token)
	}

	try {
		const response = await fetch(url, config)
		const data = await response.json()

		if (!response.ok) {
			if (response.status === 401 && retry) {
				console.warn('🔁 Токен истёк. Пытаемся обновить...')
				await this.refreshToken()
				return this.request(endpoint, options, false)
			}
			throw new Error(data.error || 'Ошибка API')
		}

		return data
	} catch (error) {
		console.error('❌ API Error:', error)
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

		// сохраняем токены
		if (response.access_token) {
			localStorage.setItem('access_token', response.access_token)
			localStorage.setItem('refresh_token', response.refresh_token)
			localStorage.setItem('user_data', JSON.stringify(response.user))
			this.token = response.access_token
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
		return response
	}

	async logout() {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('user_data')
		this.token = null
	}

	// работа с профилем
	async getUserProfile() {
		return this.request('/user/profile')
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

	async getEmployees() {
		return this.request('/users/employees')
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
}

export default new ApiClient()
