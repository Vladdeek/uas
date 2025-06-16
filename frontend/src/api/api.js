const url = ['http://localhost:5000/api', 'http://82.202.130.12:5000/api']

// API клиент для работы с бэкендом
const API_BASE_URL = url[0]

class ApiClient {
	constructor() {
		this.token = localStorage.getItem('access_token')
		this.isRefreshing = false
		this.refreshPromise = null
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
		}

		try {
			const response = await fetch(url, config)
			
			// Если ответ не JSON, обрабатываем как текст
			let data
			try {
				data = await response.json()
			} catch {
				data = { error: 'Ошибка сервера' }
			}

			if (!response.ok) {
				// Обработка 401 ошибки (токен истёк)
				if (response.status === 401 && retry && this.token) {
					console.warn('🔁 Токен истёк. Пытаемся обновить...')
					
					// Предотвращаем множественные запросы на обновление
					if (this.isRefreshing) {
						await this.refreshPromise
						return this.request(endpoint, options, false)
					}
					
					try {
						await this.refreshToken()
						return this.request(endpoint, options, false)
					} catch (refreshError) {
						console.error('❌ Ошибка обновления токена:', refreshError)
						await this.logout()
						window.location.href = '/auth'
						throw new Error('Сессия истекла. Необходимо войти заново.')
					}
				}
				
				// Обработка других ошибок
				const errorMessage = data.message || data.error || `HTTP ${response.status}`
				throw new Error(errorMessage)
			}

			return data
		} catch (error) {
			// Если это ошибка сети
			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				console.error('❌ CORS/Network Error:', error)
				throw new Error('Ошибка соединения с сервером. Проверьте что бэкенд запущен на http://localhost:5000')
			}
			
			// Если это ошибка CORS
			if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
				console.error('❌ CORS Error:', error)
				throw new Error('Ошибка CORS. Проверьте настройки сервера.')
			}
			
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
		// Очищаем старые токены перед входом
		await this.logout()
		
		const response = await this.request('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		}, false) // Не пытаемся обновлять токен при логине

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

		// Предотвращаем множественные запросы на обновление
		if (this.isRefreshing) {
			return this.refreshPromise
		}

		this.isRefreshing = true
		this.refreshPromise = this._performRefresh(refreshToken)

		try {
			const result = await this.refreshPromise
			return result
		} finally {
			this.isRefreshing = false
			this.refreshPromise = null
		}
	}

	async _performRefresh(refreshToken) {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${refreshToken}`,
				},
			})

			if (!response.ok) {
				throw new Error('Ошибка обновления токена')
			}

			const data = await response.json()
			
			if (data.access_token) {
				localStorage.setItem('access_token', data.access_token)
				this.token = data.access_token
			}

			return data
		} catch (error) {
			// При ошибке обновления очищаем все токены
			await this.logout()
			throw error
		}
	}

	async logout() {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('user_data')
		this.token = null
		this.isRefreshing = false
		this.refreshPromise = null
	}

	// работа с профилем
	async getUserProfile() {
		return this.request('/user/profile')
	}

	// работа с формами
	async getForms() {
		return this.request('/forms/')
	}

	async createForm(formData) {
		return this.request('/forms/', {
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
		return this.request('/departments/')
	}

	async createDepartment(departmentData) {
		return this.request('/departments/', {
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
		return this.request('/user/employees')
	}

	// API для управления сотрудниками подразделений
	async getDepartmentEmployees(departmentId) {
		return this.request(`/departments/${departmentId}/employees`)
	}

	async addDepartmentEmployee(departmentId, employeeData) {
		return this.request(`/departments/${departmentId}/employees`, {
			method: 'POST',
			body: JSON.stringify(employeeData),
		})
	}

	async updateDepartmentEmployee(departmentId, employeeId, employeeData) {
		return this.request(`/departments/${departmentId}/employees/${employeeId}`, {
			method: 'PUT',
			body: JSON.stringify(employeeData),
		})
	}

	async removeDepartmentEmployee(departmentId, employeeId) {
		return this.request(`/departments/${departmentId}/employees/${employeeId}`, {
			method: 'DELETE',
		})
	}

	// API для управления пользователями
	async getUsers() {
		return this.request('/users/')
	}

	async getUserById(userId) {
		return this.request(`/users/${userId}/`)
	}

	async updateUser(userId, userData) {
		return this.request(`/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(userData),
		})
	}

	async deleteUser(userId) {
		return this.request(`/users/${userId}`, {
			method: 'DELETE',
		})
	}

	async updateUserProfile(userId, profileData) {
		console.log('updateUserProfile вызван с данными:', { userId, profileData })
		return this.request(`/users/${userId}/profile`, {
			method: 'PUT',
			body: JSON.stringify(profileData),
		})
	}

	async getUserDepartment(userId) {
		// Получаем все подразделения и ищем пользователя в их сотрудниках
		try {
			console.log('Получаем подразделения для поиска пользователя', userId)
			const departments = await this.request('/departments/')
			console.log('Все подразделения:', departments)
			
			// Рекурсивно ищем пользователя во всех подразделениях и их дочерних подразделениях
			const findUserInDepartments = (depts) => {
				for (const dept of depts) {
					if (dept.employees) {
						const userEmployee = dept.employees.find(emp => emp.user_id === parseInt(userId))
						if (userEmployee) {
							console.log('Найденный сотрудник:', userEmployee)
							return {
								department_name: dept.name,
								role_name: userEmployee.role?.display_name || userEmployee.role?.name,
								department_id: dept.id,
								role_id: userEmployee.role_id
							}
						}
					}
					// Рекурсивно ищем в дочерних подразделениях
					if (dept.children && dept.children.length > 0) {
						const result = findUserInDepartments(dept.children)
						if (result) return result
					}
				}
				return null
			}
			
			const result = findUserInDepartments(departments)
			if (result) {
				return result
			}
			
			throw new Error('User not found in any department')
		} catch (error) {
			console.log('Ошибка при получении подразделений:', error)
			throw error
		}
	}

	// API для управления ролями
	async getRoles() {
		return this.request('/roles/')
	}

	async createRole(roleData) {
		return this.request('/roles/', {
			method: 'POST',
			body: JSON.stringify(roleData),
		})
	}

	async updateRole(roleId, roleData) {
		return this.request(`/roles/${roleId}`, {
			method: 'PUT',
			body: JSON.stringify(roleData),
		})
	}

	async deleteRole(roleId) {
		return this.request(`/roles/${roleId}`, {
			method: 'DELETE',
		})
	}

	// утилиты
	isAuthenticated() {
		return !!this.token && !!localStorage.getItem('user_data')
	}

	getCurrentUser() {
		const userData = localStorage.getItem('user_data')
		return userData ? JSON.parse(userData) : null
	}

	// Новый метод для обновления данных пользователя в localStorage
	async updateCurrentUserData() {
		try {
			const currentUserData = await this.getUserProfile()
			localStorage.setItem('user_data', JSON.stringify(currentUserData))
			
			// Генерируем событие для уведомления компонентов
			window.dispatchEvent(new CustomEvent('userDataUpdated', { 
				detail: currentUserData 
			}))
			
			return currentUserData
		} catch (error) {
			console.error('Ошибка обновления данных пользователя:', error)
			throw error
		}
	}

	// создание тестового админа
	async createTestAdmin() {
		return this.request('/dev/test/create-admin', {
			method: 'POST',
		})
	}

	// API для заявок
	async getApplicationTypes() {
		return this.request('/applications/types')
	}

	async getApplicationStatuses() {
		return this.request('/applications/statuses')
	}

	async getApplications(params = {}) {
		const searchParams = new URLSearchParams()
		if (params.status) searchParams.append('status', params.status)
		if (params.type_id) searchParams.append('type_id', params.type_id)
		if (params.assignee_view) searchParams.append('assignee_view', 'true')
		if (params.priority) searchParams.append('priority', params.priority)
		if (params.search) searchParams.append('search', params.search)
		if (params.date_from) searchParams.append('date_from', params.date_from)
		if (params.date_to) searchParams.append('date_to', params.date_to)
		if (params.assignee_id) searchParams.append('assignee_id', params.assignee_id)
		if (params.department_id) searchParams.append('department_id', params.department_id)
		if (params.limit) searchParams.append('limit', params.limit)
		if (params.offset) searchParams.append('offset', params.offset)
		if (params.sort_by) searchParams.append('sort_by', params.sort_by)
		if (params.sort_order) searchParams.append('sort_order', params.sort_order)
		
		const url = searchParams.toString() 
			? `/applications/?${searchParams.toString()}` 
			: '/applications/'
		
		return this.request(url)
	}

	async getApplicationsStats(params = {}) {
		const searchParams = new URLSearchParams()
		if (params.assignee_view) searchParams.append('assignee_view', 'true')
		
		const url = searchParams.toString() 
			? `/applications/stats?${searchParams.toString()}` 
			: '/applications/stats'
		
		return this.request(url)
	}

	async createApplication(applicationData) {
		return this.request('/applications/', {
			method: 'POST',
			body: JSON.stringify(applicationData),
		})
	}

	async getApplication(applicationId) {
		return this.request(`/applications/${applicationId}`)
	}

	async performApplicationAction(applicationId, actionData) {
		return this.request(`/applications/${applicationId}/action`, {
			method: 'POST',
			body: JSON.stringify(actionData),
		})
	}

	async addApplicationComment(applicationId, commentData) {
		return this.request(`/applications/${applicationId}/comments`, {
			method: 'POST',
			body: JSON.stringify(commentData),
		})
	}

	async applyApplicationToProfile(applicationId) {
		return this.request(`/applications/${applicationId}/apply-to-profile`, {
			method: 'POST',
		})
	}

	async createApplicationType(typeData) {
		return this.request('/applications/types', {
			method: 'POST',
			body: JSON.stringify(typeData),
		})
	}

	// Методы для управления роутингом (заглушки, так как роутинг встроен в типы заявок)
	async getRoutingRules() {
		// Возвращаем пустой массив, так как роутинг встроен в типы заявок
		return []
	}

	async createRoutingRule(ruleData) {
		// Заглушка для создания правил роутинга
		return { message: 'Правило роутинга создано' }
	}

	async updateApplicationType(typeId, typeData) {
		return this.request(`/applications/types/${typeId}`, {
			method: 'PUT',
			body: JSON.stringify(typeData),
		})
	}

	async deleteApplicationType(typeId) {
		return this.request(`/applications/types/${typeId}`, {
			method: 'DELETE',
		})
	}

	// ================= ОТЧЕТЫ =================
	
	async getReportTypes() {
		return this.request('/reports/types')
	}

	async createReportType(typeData) {
		return this.request('/reports/types', {
			method: 'POST',
			body: JSON.stringify(typeData)
		});
	}

	async updateReportType(typeId, typeData) {
		return this.request(`/reports/types/${typeId}`, {
			method: 'PUT',
			body: JSON.stringify(typeData)
		});
	}

	async deleteReportType(typeId) {
		return this.request(`/reports/types/${typeId}`, {
			method: 'DELETE'
		});
	}

	async getReports(params = {}) {
		const searchParams = new URLSearchParams();
		
		if (params.type_id) searchParams.append('type_id', params.type_id);
		if (params.view_mode) searchParams.append('view_mode', params.view_mode);
		
		const queryString = searchParams.toString();
		const url = queryString ? `/reports?${queryString}` : '/reports';
		
		return this.request(url);
	}

	async createReport(reportData) {
		return this.request('/reports', {
			method: 'POST',
			body: JSON.stringify(reportData)
		});
	}

	async getReport(reportId) {
		return this.request(`/reports/${reportId}`);
	}

	async updateReport(reportId, reportData) {
		return this.request(`/reports/${reportId}`, {
			method: 'PUT',
			body: JSON.stringify(reportData)
		});
	}

	async deleteReport(reportId) {
		return this.request(`/reports/${reportId}`, {
			method: 'DELETE'
		});
	}

	async getReportsStats() {
		return this.request('/reports/stats');
	}

	async getReportsByType(typeId) {
		const params = new URLSearchParams({ type_id: typeId })
		return this.request(`/reports/?${params.toString()}`)
	}

	// ================ FILE API ================
	async uploadFile(file) {
		const formData = new FormData();
		formData.append('file', file);
		
		return this.request('/files/upload', {
			method: 'POST',
			body: formData,
			// Не устанавливаем Content-Type для FormData - браузер сделает это автоматически
			headers: {} 
		});
	}

	async getFileInfo(fileId) {
		return this.request(`/files/${fileId}`);
	}

	async downloadFile(fileId) {
		const url = `${API_BASE_URL}/files/${fileId}/download`
		
		const config = {
			method: 'GET',
			headers: {}
		}

		// Добавляем токен авторизации
		if (this.token) {
			config.headers.Authorization = `Bearer ${this.token}`
		}

		try {
			const response = await fetch(url, config)
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Ошибка при скачивании файла' }))
				throw new Error(errorData.message || 'Ошибка при скачивании файла')
			}

			// Получаем данные файла
			const blob = await response.blob()
			
			// Получаем имя файла из заголовков или используем дефолтное
			const contentDisposition = response.headers.get('Content-Disposition')
			let filename = `file_${fileId}`
			
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1].replace(/["']/g, '')
				}
			}

			// Создаем ссылку для скачивания
			const downloadUrl = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = downloadUrl
			link.download = filename
			document.body.appendChild(link)
			link.click()
			
			// Очищаем ресурсы
			document.body.removeChild(link)
			window.URL.revokeObjectURL(downloadUrl)
			
			return { success: true, filename }
		} catch (error) {
			console.error('❌ Download Error:', error)
			throw error
		}
	}

	async deleteFile(fileId) {
		return this.request(`/files/${fileId}`, {
			method: 'DELETE'
		});
	}

	async getUserFiles() {
		return this.request('/files');
	}
}

// Создаем и экспортируем экземпляр API
const api = new ApiClient()
export default api
