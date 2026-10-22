import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Archive, Download, Eye, Pencil, Plus, RotateCcw, Search, Send, Trash2 } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useActiveCategories, useCourses } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/Modal'
import { downloadCsv, formatCurrency, parseApiError, titleCase } from '../../utils'
import type { Course } from '../../types'

type Pending = { course: Course; action: 'publish' | 'archive' | 'restore' | 'delete' } | null

export default function AdminCourses() {
  const [f, setF] = useState({ search: '', status: '', categoryId: '', difficulty: '', page: 0, size: 10, sort: 'createdAt,DESC' })
  const [pending, setPending] = useState<Pending>(null)
  const qc = useQueryClient()
  const [sortBy, sortDir] = f.sort.split(',')
  const { data, isLoading, isError, refetch } = useCourses({
    search: f.search || undefined, status: f.status || undefined, categoryId: f.categoryId || undefined,
    difficulty: f.difficulty || undefined, page: f.page, size: f.size, sortBy, sortDir,
  })
  const { data: cats } = useActiveCategories()
  const set = (p: Partial<typeof f>) => setF((s) => ({ ...s, page: 0, ...p }))

  const run = useMutation({
    mutationFn: ({ course, action }: NonNullable<Pending>) =>
      action === 'publish' ? apiClient.publishCourse(course.id) : action === 'archive' ? apiClient.archiveCourse(course.id)
        : action === 'restore' ? apiClient.restoreCourse(course.id) : apiClient.deleteCourse(course.id),
    onSuccess: (r) => { toast.success(r.message || 'Done'); setPending(null); qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['dash-admin'] }) },
    onError: (e) => { toast.error(parseApiError(e).message); setPending(null) },
  })
  const clear = () => setF({ search: '', status: '', categoryId: '', difficulty: '', page: 0, size: f.size, sort: 'createdAt,DESC' })
  const hasFilters = f.search || f.status || f.categoryId || f.difficulty

  return (
    <>
      <PageHeader title="Courses" subtitle="Create, publish and manage courses" actions={<>
        <button className="btn-secondary btn-sm" disabled={!data?.content.length} onClick={() => downloadCsv('courses.csv', (data?.content || []).map((c) => ({ code: c.courseCode, title: c.title, category: c.categoryName, status: c.status, fee: c.fee, enrolled: c.enrollmentCount })))}><Download size={16} />Export CSV</button>
        <Link to="/dashboard/admin/courses/new" className="btn-primary btn-sm"><Plus size={16} />New course</Link>
      </>} />
      <div className="card">
        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 border-b">
          <div className="relative lg:col-span-2"><Search size={16} className="absolute left-3 top-3 text-secondary-400" /><input className="input pl-9" placeholder="Search title or code" aria-label="Search" value={f.search} onChange={(e) => set({ search: e.target.value })} /></div>
          <select className="input" aria-label="Status" value={f.status} onChange={(e) => set({ status: e.target.value })}><option value="">All statuses</option>{['DRAFT', 'PUBLISHED', 'INACTIVE', 'ARCHIVED'].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
          <select className="input" aria-label="Category" value={f.categoryId} onChange={(e) => set({ categoryId: e.target.value })}><option value="">All categories</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="input" aria-label="Difficulty" value={f.difficulty} onChange={(e) => set({ difficulty: e.target.value })}><option value="">All levels</option>{['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
          <select className="input" aria-label="Sort" value={f.sort} onChange={(e) => set({ sort: e.target.value })}>
            <option value="createdAt,DESC">Newest</option><option value="createdAt,ASC">Oldest</option><option value="title,ASC">Title A–Z</option><option value="fee,DESC">Fee high–low</option>
          </select>
          {hasFilters && <button className="btn-ghost btn-sm justify-self-start" onClick={clear}>Clear filters</button>}
        </div>
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState message="Could not load courses" onRetry={refetch} /> : !data?.content.length ? (
          <EmptyState title="No courses found" description={hasFilters ? 'Try different filters.' : 'Create your first course to get started.'} action={hasFilters ? <button className="btn-outline btn-sm" onClick={clear}>Clear filters</button> : <Link to="/dashboard/admin/courses/new" className="btn-primary btn-sm">New course</Link>} />
        ) : (
          <div className="table-container"><table className="table">
            <thead><tr><th>Course</th><th>Category</th><th>Status</th><th>Fee</th><th>Enrolled</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{data.content.map((c) => (
              <tr key={c.id}>
                <td><p className="font-medium">{c.title}</p><p className="text-xs text-secondary-500">{c.courseCode}</p></td>
                <td>{c.categoryName || '—'}</td><td><StatusBadge status={c.status} /></td>
                <td>{c.fee ? formatCurrency(c.fee, c.currency) : 'Free'}</td>
                <td>{c.enrollmentCount}{c.enrollmentCapacity ? ` / ${c.enrollmentCapacity}` : ''}</td>
                <td><div className="flex justify-end gap-1">
                  <Link to={`/dashboard/admin/courses/${c.id}`} className="btn-ghost btn-sm" aria-label="View" title="View / edit"><Eye size={16} /></Link>
                  {(c.status === 'DRAFT' || c.status === 'INACTIVE') && <button className="btn-ghost btn-sm" title="Publish" aria-label="Publish" onClick={() => setPending({ course: c, action: 'publish' })}><Send size={16} /></button>}
                  {c.status !== 'ARCHIVED' && <button className="btn-ghost btn-sm" title="Archive" aria-label="Archive" onClick={() => setPending({ course: c, action: 'archive' })}><Archive size={16} /></button>}
                  {c.status === 'ARCHIVED' && <button className="btn-ghost btn-sm" title="Restore" aria-label="Restore" onClick={() => setPending({ course: c, action: 'restore' })}><RotateCcw size={16} /></button>}
                  <Link to={`/dashboard/admin/courses/${c.id}`} className="btn-ghost btn-sm" aria-label="Edit"><Pencil size={16} /></Link>
                  <button className="btn-ghost btn-sm text-error-600" title="Delete" aria-label="Delete" onClick={() => setPending({ course: c, action: 'delete' })}><Trash2 size={16} /></button>
                </div></td>
              </tr>))}</tbody>
          </table></div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={f.size} onPage={(p) => setF((s) => ({ ...s, page: p }))} onSize={(n) => set({ size: n })} />}
      </div>
      <ConfirmDialog open={!!pending} danger={pending?.action === 'delete' || pending?.action === 'archive'} loading={run.isPending}
        title={`${titleCase(pending?.action)} course`} message={`Are you sure you want to ${pending?.action} “${pending?.course.title}”?`}
        confirmLabel={titleCase(pending?.action)} onClose={() => setPending(null)} onConfirm={() => pending && run.mutate(pending)} />
    </>
  )
}
