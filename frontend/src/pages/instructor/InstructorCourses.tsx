import { useState } from 'react'
import { useAuthStore } from '../../store/hooks'
import { useCourses } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

export default function InstructorCourses() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, refetch } = useCourses({ instructorId: user?.id, page, size: 10 })
  return (
    <>
      <PageHeader title="My courses" subtitle="Courses assigned to you" />
      <div className="card">
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : !data?.content.length ? <EmptyState title="No courses assigned" description="An administrator can assign you to courses." /> : (
          <div className="table-container"><table className="table">
            <thead><tr><th>Course</th><th>Category</th><th>Status</th><th>Enrolled</th><th>Updated</th></tr></thead>
            <tbody>{data.content.map((c) => <tr key={c.id}><td><p className="font-medium">{c.title}</p><p className="text-xs text-secondary-500">{c.courseCode}</p></td><td>{c.categoryName || '—'}</td><td><StatusBadge status={c.status} /></td><td>{c.enrollmentCount}{c.enrollmentCapacity ? ` / ${c.enrollmentCapacity}` : ''}</td><td>{formatDate(c.updatedAt)}</td></tr>)}</tbody>
          </table></div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={10} onPage={setPage} />}
      </div>
    </>
  )
}
