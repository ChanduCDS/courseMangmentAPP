import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'
import type { CourseListParams, CategoryListParams, EnrollmentListParams } from '../services/apiClient'
import type {
  AdminDashboardData, Category, Course, Enrollment, InstructorDashboardData, Notification,
  PaginatedResponse, StudentDashboardData,
} from '../types'

const d = <T,>(r: { data: T }) => r.data

export const usePublicCourses = (p?: CourseListParams) =>
  useQuery({ queryKey: ['public-courses', p], queryFn: () => apiClient.getPublishedCourses(p).then(d<PaginatedResponse<Course>>), placeholderData: keepPreviousData })
export const usePublicCourse = (id?: string) =>
  useQuery({ queryKey: ['public-course', id], queryFn: () => apiClient.getPublishedCourseById(id!).then(d<Course>), enabled: !!id })
export const useCourseStats = () =>
  useQuery({ queryKey: ['course-stats'], queryFn: () => apiClient.getCourseStats().then(d<Record<string, number>>) })

export const useCourses = (p?: CourseListParams) =>
  useQuery({ queryKey: ['courses', p], queryFn: () => apiClient.getCourses(p).then(d<PaginatedResponse<Course>>), placeholderData: keepPreviousData })
export const useCourse = (id?: string) =>
  useQuery({ queryKey: ['course', id], queryFn: () => apiClient.getCourseById(id!).then(d<Course>), enabled: !!id })

export const useCategories = (p?: CategoryListParams) =>
  useQuery({ queryKey: ['categories', p], queryFn: () => apiClient.getCategories(p).then(d<PaginatedResponse<Category>>), placeholderData: keepPreviousData })
export const useActiveCategories = (enabled = true) =>
  useQuery({ queryKey: ['categories-active'], queryFn: () => apiClient.getActiveCategories().then(d<Category[]>), enabled })

export const useEnrollments = (p?: EnrollmentListParams) =>
  useQuery({ queryKey: ['enrollments', p], queryFn: () => apiClient.getEnrollments(p).then(d<PaginatedResponse<Enrollment>>), placeholderData: keepPreviousData })
export const useMyEnrollments = (p?: EnrollmentListParams) =>
  useQuery({ queryKey: ['my-enrollments', p], queryFn: () => apiClient.getMyEnrollments(p).then(d<PaginatedResponse<Enrollment>>), placeholderData: keepPreviousData })

export const useAdminDashboard = () => useQuery({ queryKey: ['dash-admin'], queryFn: () => apiClient.getAdminDashboard().then(d<AdminDashboardData>) })
export const useInstructorDashboard = () => useQuery({ queryKey: ['dash-instructor'], queryFn: () => apiClient.getInstructorDashboard().then(d<InstructorDashboardData>) })
export const useStudentDashboard = () => useQuery({ queryKey: ['dash-student'], queryFn: () => apiClient.getStudentDashboard().then(d<StudentDashboardData>) })

export const useNotifications = (page = 0, size = 20) =>
  useQuery({ queryKey: ['notifications', page, size], queryFn: () => apiClient.getNotifications({ page, size }).then(d<PaginatedResponse<Notification>>) })
export const useUnreadCount = () =>
  useQuery({ queryKey: ['unread-count'], queryFn: () => apiClient.getUnreadCount().then(d<number>), refetchInterval: 60000 })
