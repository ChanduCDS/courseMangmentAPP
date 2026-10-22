import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useNotifications } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

export default function AdminNotifications() {
  const [page, setPage] = useState(0)
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useNotifications(page, 10)
  const inv = () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread-count'] }) }
  const readAll = useMutation({ mutationFn: () => apiClient.markAllAsRead(), onSuccess: inv })
  const readOne = useMutation({ mutationFn: (id: string) => apiClient.markAsRead(id), onSuccess: inv })
  return (
    <>
      <PageHeader title="Notifications" actions={<button className="btn-secondary btn-sm" onClick={() => readAll.mutate()}><CheckCheck size={16} />Mark all read</button>} />
      <div className="card">
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : !data?.content.length ? <EmptyState title="You're all caught up" description="New notifications will show up here." /> : (
          <ul className="divide-y">{data.content.map((n) => (
            <li key={n.id} className={`px-6 py-4 flex items-start justify-between gap-4 ${n.isRead ? '' : 'bg-primary-50/50'}`}>
              <div><p className="font-medium text-sm">{n.title}</p><p className="text-sm text-secondary-600">{n.message}</p><p className="text-xs text-secondary-400 mt-1">{formatDate(n.createdAt, 'MMM d, yyyy h:mm a')}</p></div>
              {!n.isRead && <button className="btn-ghost btn-sm shrink-0" onClick={() => readOne.mutate(n.id)}>Mark read</button>}
            </li>))}</ul>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={10} onPage={setPage} />}
      </div>
    </>
  )
}
