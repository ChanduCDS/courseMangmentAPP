export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string
  roles: string[]
  isEmailVerified: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Course {
  id: string
  title: string
  courseCode: string
  shortDescription?: string
  fullDescription?: string
  categoryId: string
  categoryName?: string
  categoryIcon?: string
  categoryColor?: string
  thumbnailUrl?: string
  duration: number
  durationUnit: string
  fee: number
  currency: string
  difficultyLevel: string
  status: string
  enrollmentCapacity?: number
  enrollmentStartDate?: string
  enrollmentEndDate?: string
  courseStartDate?: string
  courseEndDate?: string
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  enrollmentCount: number
  isEnrollmentOpen: boolean
  instructorIds: string[]
  instructorNames: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  archivedAt?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  sortOrder: number
  courseCount: number
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseTitle: string
  courseCode: string
  courseThumbnailUrl?: string
  status: string
  enrolledAt: string
  confirmedAt?: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  progressPercentage: number
  finalGrade?: string
  certificateIssued: boolean
  certificateIssuedAt?: string
  certificateUrl?: string
  paymentStatus: string
  paymentAmount?: number
  paymentCurrency?: string
  paymentReference?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  referenceType?: string
  referenceId?: string
  isRead: boolean
  readAt?: string
  priority: string
  actionUrl?: string
  actionLabel?: string
  expiresAt?: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
    path?: string
  }
  timestamp: string
}

export interface DashboardStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  inactiveCourses: number
  archivedCourses: number
  totalStudents: number
  totalInstructors: number
  activeEnrollments: number
}

export interface AdminDashboardData extends DashboardStats {
  enrollmentTrend: MonthlyStat[]
  categoryDistribution: CategoryStat[]
  popularCourses: PopularCourse[]
  recentEnrollments: RecentEnrollment[]
  recentCourseUpdates: RecentCourse[]
}

export interface InstructorDashboardData {
  totalAssignedCourses: number
  totalEnrolledStudents: number
  courseStats: CourseEnrollmentStat[]
  recentEnrollments: RecentEnrollment[]
}

export interface StudentDashboardData {
  enrolledCourses: number
  inProgressCourses: number
  completedCourses: number
  enrollments: Enrollment[]
  recommendedCourses: Course[]
}

export interface MonthlyStat {
  month: string
  count: number
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryColor: string
  courseCount: number
}

export interface PopularCourse {
  courseId: string
  courseTitle: string
  courseCode: string
  enrollmentCount: number
  revenue: number
}

export interface RecentEnrollment {
  enrollmentId: string
  studentId: string
  studentName: string
  courseId: string
  courseTitle: string
  status: string
  enrolledAt: string
}

export interface RecentCourse {
  courseId: string
  courseTitle: string
  courseCode: string
  status: string
  updatedAt: string
  updatedBy: string
}

export interface CourseEnrollmentStat {
  courseId: string
  courseTitle: string
  courseCode: string
  enrolledStudents: number
  capacity?: number
}