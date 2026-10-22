import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const state = store.getState()
        const token = state.auth.accessToken
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const state = store.getState()
            const refreshToken = state.auth.refreshToken

            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              })

              const { accessToken, refreshToken: newRefreshToken } = response.data.data
              store.dispatch(
                setCredentials({
                  user: state.auth.user!,
                  accessToken,
                  refreshToken: newRefreshToken,
                })
              )

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
              }
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            store.dispatch(logout())
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  getClient(): AxiosInstance {
    return this.client
  }

  // Auth endpoints
  async register(data: RegisterRequest) {
    const response = await this.client.post('/auth/register', data)
    return response.data
  }

  async login(data: LoginRequest) {
    const response = await this.client.post('/auth/login', data)
    return response.data
  }

  async logout() {
    const response = await this.client.post('/auth/logout')
    return response.data
  }

  async forgotPassword(data: ForgotPasswordRequest) {
    const response = await this.client.post('/auth/forgot-password', data)
    return response.data
  }

  async resetPassword(data: ResetPasswordRequest) {
    const response = await this.client.post('/auth/reset-password', data)
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    return response.data
  }

  // Public courses
  async getPublishedCourses(params?: CourseListParams) {
    const response = await this.client.get('/public/courses', { params })
    return response.data
  }

  async getFeaturedCourses() {
    const response = await this.client.get('/public/courses/featured')
    return response.data
  }

  async getPublishedCourseById(id: string) {
    const response = await this.client.get(`/public/courses/${id}`)
    return response.data
  }

  async getPublishedCourseByCode(code: string) {
    const response = await this.client.get(`/public/courses/code/${code}`)
    return response.data
  }

  async getCourseStats() {
    const response = await this.client.get('/public/courses/stats')
    return response.data
  }

  // Courses (admin/instructor)
  async getCourses(params?: CourseListParams) {
    const response = await this.client.get('/courses', { params })
    return response.data
  }

  async getCourseById(id: string) {
    const response = await this.client.get(`/courses/${id}`)
    return response.data
  }

  async createCourse(data: CourseCreateRequest) {
    const response = await this.client.post('/courses', data)
    return response.data
  }

  async updateCourse(id: string, data: CourseUpdateRequest) {
    const response = await this.client.put(`/courses/${id}`, data)
    return response.data
  }

  async publishCourse(id: string) {
    const response = await this.client.patch(`/courses/${id}/publish`)
    return response.data
  }

  async archiveCourse(id: string) {
    const response = await this.client.post(`/courses/${id}/archive`)
    return response.data
  }

  async restoreCourse(id: string) {
    const response = await this.client.post(`/courses/${id}/restore`)
    return response.data
  }

  async deleteCourse(id: string) {
    const response = await this.client.delete(`/courses/${id}`)
    return response.data
  }

  // Categories
  async getCategories(params?: CategoryListParams) {
    const response = await this.client.get('/categories', { params })
    return response.data
  }

  async getActiveCategories() {
    const response = await this.client.get('/categories/active')
    return response.data
  }

  async getCategoryById(id: string) {
    const response = await this.client.get(`/categories/${id}`)
    return response.data
  }

  async createCategory(data: CategoryCreateRequest) {
    const response = await this.client.post('/categories', data)
    return response.data
  }

  async updateCategory(id: string, data: CategoryUpdateRequest) {
    const response = await this.client.put(`/categories/${id}`, data)
    return response.data
  }

  async toggleCategoryStatus(id: string) {
    const response = await this.client.patch(`/categories/${id}/status`)
    return response.data
  }

  async deleteCategory(id: string) {
    const response = await this.client.delete(`/categories/${id}`)
    return response.data
  }

  // Enrollments
  async getEnrollments(params?: EnrollmentListParams) {
    const response = await this.client.get('/enrollments', { params })
    return response.data
  }

  async getEnrollmentById(id: string) {
    const response = await this.client.get(`/enrollments/${id}`)
    return response.data
  }

  async getMyEnrollments(params?: EnrollmentListParams) {
    const response = await this.client.get('/enrollments/my-enrollments', { params })
    return response.data
  }

  async enroll(courseId: string) {
    const response = await this.client.post('/enrollments', null, { params: { courseId } })
    return response.data
  }

  async updateEnrollmentStatus(id: string, status: string) {
    const response = await this.client.patch(`/enrollments/${id}/status`, null, { params: { status } })
    return response.data
  }

  async cancelEnrollment(id: string, reason?: string) {
    const response = await this.client.post(`/enrollments/${id}/cancel`, null, { params: { reason } })
    return response.data
  }

  // Dashboard
  async getAdminDashboard() {
    const response = await this.client.get('/admin/dashboard')
    return response.data
  }

  async getInstructorDashboard() {
    const response = await this.client.get('/instructor/dashboard')
    return response.data
  }

  async getStudentDashboard() {
    const response = await this.client.get('/student/dashboard')
    return response.data
  }

  // Notifications
  async getNotifications(params?: { page?: number; size?: number }) {
    const response = await this.client.get('/notifications', { params })
    return response.data
  }

  async getUnreadCount() {
    const response = await this.client.get('/notifications/unread-count')
    return response.data
  }

  async markAsRead(id: string) {
    const response = await this.client.patch(`/notifications/${id}/read`)
    return response.data
  }

  async markAllAsRead() {
    const response = await this.client.post('/notifications/read-all')
    return response.data
  }
}

// Types
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface CourseListParams {
  status?: string
  categoryId?: string
  instructorId?: string
  difficulty?: string
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface CourseCreateRequest {
  title: string
  courseCode: string
  shortDescription?: string
  fullDescription?: string
  categoryId: string
  thumbnailUrl?: string
  duration?: number
  durationUnit?: string
  fee?: number
  currency?: string
  difficultyLevel?: string
  enrollmentCapacity?: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string
  courseStartDate?: string
  courseEndDate?: string
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  instructorIds?: string[]
}

export interface CourseUpdateRequest {
  title?: string
  courseCode?: string
  shortDescription?: string
  fullDescription?: string
  categoryId?: string
  thumbnailUrl?: string
  duration?: number
  durationUnit?: string
  fee?: number
  currency?: string
  difficultyLevel?: string
  enrollmentCapacity?: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string
  courseStartDate?: string
  courseEndDate?: string
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  instructorIds?: string[]
}

export interface CategoryListParams {
  search?: string
  isActive?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface CategoryCreateRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface CategoryUpdateRequest {
  name?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface EnrollmentListParams {
  studentId?: string
  courseId?: string
  statuses?: string[]
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

// Import setCredentials from authSlice
import { setCredentials } from '../store/slices/authSlice'

export const apiClient = new ApiClient()
export default apiClient