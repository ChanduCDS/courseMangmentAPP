import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '../../services/apiClient'
import { useMyEnrollments } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/Modal'
import { formatDate, parseApiError } from '../../utils'
import type { Enrollment } from '../../types'

export default function StudentEnrollments() {
  const [page, setPage] = useState(0)
  const [target, setTarget] = useState<Enrollment | null>(null)
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useMyEnrollments({ page, size: 10 })
  const cancel = useMutation({
    mutationFn: (id: string) => apiClient.cancelEnrollment(id),
    onSuccess: (r) => { toast.success(r.message || 'Cancelled'); setTarget(null); ['my-enrollments', 'dash-student'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })) },
    onError: (e) => { toast.error(parseApiError(e).message); setTarget(null) },
  })
  return (
    <>
      <PageHeader title="My enrollments" subtitle="Your enrollment history" />
      <div className="card">
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : !data?.content.length ? <EmptyState title="No enrollments yet" description="Enroll in a course to see it here." action={<Link to="/dashboard/student/courses" className="btn-primary btn-sm">Browse courses</Link>} /> : (
          <div className="table-container"><table className="table">
            <thead><tr><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{data.content.map((e) => (
              <tr key={e.id}>
                <td><Link to={`/dashboard/student/courses/${e.courseId}`} className="font-medium hover:text-primary-700">{e.courseTitle}</Link><p className="text-xs text-secondary-500">{e.courseCode}</p></td>
                <td>{formatDate(e.enrolledAt)}</td><td>{e.progressPercentage ?? 0}%</td><td><StatusBadge status={e.status} /></td>
                <td className="text-right">{(e.status === 'PENDING' || e.status === 'ENROLLED') && <button className="btn-ghost btn-sm text-error-600" onClick={() => setTarget(e)}>Cancel</button>}</td>
              </tr>))}</tbody>
          </table></div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={10} onPage={setPage} />}
      </div>
      <ConfirmDialog open={!!target} danger title="Cancel enrollment" message={`Cancel your enrollment in “${target?.courseTitle}”?`} confirmLabel="Cancel enrollment" loading={cancel.isPending} onClose={() => setTarget(null)} onConfirm={() => target && cancel.mutate(target.id)} />
    </>
  )
}
