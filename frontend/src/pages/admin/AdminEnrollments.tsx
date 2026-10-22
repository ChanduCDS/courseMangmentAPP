import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useEnrollments } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { downloadCsv, formatDate, parseApiError, titleCase } from '../../utils'

const STATUSES = ['PENDING', 'ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function AdminEnrollments() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useEnrollments({ statuses: status ? [status] : undefined, page, size })
  const change = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.updateEnrollmentStatus(id, status),
    onSuccess: (r) => { toast.success(r.message || 'Updated'); qc.invalidateQueries({ queryKey: ['enrollments'] }); qc.invalidateQueries({ queryKey: ['dash-admin'] }) },
    onError: (e) => toast.error(parseApiError(e).message),
  })
  return (
    <>
      <PageHeader title="Enrollments" subtitle="Review and update student enrollments" actions={
        <button className="btn-secondary btn-sm" disabled={!data?.content.length} onClick={() => downloadCsv('enrollments.csv', (data?.content || []).map((e) => ({ student: e.studentName, email: e.studentEmail, course: e.courseTitle, status: e.status, enrolledAt: e.enrolledAt })))}><Download size={16} />Export CSV</button>} />
      <div className="card">
        <div className="p-4 border-b"><select className="input !w-auto" aria-label="Status filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></div>
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : !data?.content.length ? <EmptyState title="No enrollments" description="Enrollments will appear here once students enroll." /> : (
          <div className="table-container"><table className="table">
            <thead><tr><th>Student</th><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th><th>Change status</th></tr></thead>
            <tbody>{data.content.map((e) => (
              <tr key={e.id}>
                <td><p className="font-medium">{e.studentName}</p><p className="text-xs text-secondary-500">{e.studentEmail}</p></td>
                <td>{e.courseTitle}<p className="text-xs text-secondary-500">{e.courseCode}</p></td>
                <td>{formatDate(e.enrolledAt)}</td><td>{e.progressPercentage ?? 0}%</td><td><StatusBadge status={e.status} /></td>
                <td><select className="input !py-1.5 !w-auto" aria-label={`Status for ${e.studentName}`} value={e.status} onChange={(ev) => change.mutate({ id: e.id, status: ev.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></td>
              </tr>))}</tbody>
          </table></div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={size} onPage={setPage} onSize={(n) => { setSize(n); setPage(0) }} />}
      </div>
    </>
  )
}
