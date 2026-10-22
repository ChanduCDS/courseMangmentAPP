import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { usePublicCourse } from '../../hooks/useData'
import { useAuthStore } from '../../store/hooks'
import { Button } from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { ErrorState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, parseApiError, titleCase } from '../../utils'

export default function StudentCourseDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { data: c, isLoading, isError } = usePublicCourse(id)
  const enroll = useMutation({
    mutationFn: () => apiClient.enroll(id!),
    onSuccess: (r) => { toast.success(r.message || 'Enrolled!'); ['my-enrollments', 'dash-student', 'public-course', 'notifications', 'unread-count'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })) },
    onError: (e) => toast.error(parseApiError(e).message),
  })
  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (isError || !c) return <ErrorState message="Course not found or not available." />
  const isStudent = user?.roles.includes('STUDENT')
  const full = !!c.enrollmentCapacity && c.enrollmentCount >= c.enrollmentCapacity
  return (
    <>
      <Link to="/dashboard/student/courses" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-800 mb-3"><ArrowLeft size={16} />All courses</Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card card-body">
          <div className="flex flex-wrap gap-2 mb-3">{c.categoryName && <span className="badge-primary">{c.categoryName}</span>}<span className="badge-secondary">{titleCase(c.difficultyLevel)}</span><StatusBadge status={c.status} /></div>
          <h1 className="text-2xl font-bold">{c.title}</h1><p className="text-sm text-secondary-500">{c.courseCode}</p>
          <p className="mt-4 text-secondary-700 whitespace-pre-line">{c.fullDescription || c.shortDescription || 'No description provided.'}</p>
          {!!c.instructorNames?.length && <p className="mt-4 text-sm text-secondary-600"><span className="font-medium">Instructors:</span> {c.instructorNames.join(', ')}</p>}
        </div>
        <aside className="card card-body h-fit space-y-4">
          <p className="text-3xl font-bold text-primary-700">{c.fee ? formatCurrency(c.fee, c.currency) : 'Free'}</p>
          <ul className="text-sm text-secondary-600 space-y-2">
            <li className="flex items-center gap-2"><Clock size={16} />{c.duration} {titleCase(c.durationUnit)}</li>
            <li className="flex items-center gap-2"><Users size={16} />{c.enrollmentCount}{c.enrollmentCapacity ? ` / ${c.enrollmentCapacity}` : ''} enrolled</li>
            {c.enrollmentEndDate && <li>Enrollment closes {formatDate(c.enrollmentEndDate)}</li>}
          </ul>
          {isStudent ? <Button fullWidth isLoading={enroll.isPending} disabled={full || c.isEnrollmentOpen === false} onClick={() => enroll.mutate()}>{full ? 'Course full' : c.isEnrollmentOpen === false ? 'Enrollment closed' : 'Enroll now'}</Button>
            : <p className="text-xs text-secondary-500">Only student accounts can enroll.</p>}
        </aside>
      </div>
    </>
  )
}
