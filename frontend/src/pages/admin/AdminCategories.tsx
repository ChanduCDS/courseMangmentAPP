import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useCategories } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { parseApiError } from '../../utils'
import type { Category } from '../../types'

const schema = z.object({ name: z.string().min(1, 'Name is required').max(100), description: z.string().optional(), color: z.string().optional(), icon: z.string().optional() })
type F = z.infer<typeof schema>

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { name: '', description: '', color: '#007BA7', icon: '' } })
  useEffect(() => { reset({ name: category?.name || '', description: category?.description || '', color: category?.color || '#007BA7', icon: category?.icon || '' }) }, [category, reset])
  const m = useMutation({
    mutationFn: (v: F) => (category ? apiClient.updateCategory(category.id, v) : apiClient.createCategory(v)),
    onSuccess: (r) => { toast.success(r.message || 'Saved'); qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['categories-active'] }); onClose() },
    onError: (e) => { const { message, fields } = parseApiError(e); Object.entries(fields).forEach(([k, v]) => setError(k as keyof F, { message: v })); toast.error(message) },
  })
  return (
    <form onSubmit={handleSubmit((v) => m.mutate(v))} className="space-y-4" noValidate>
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Color" type="color" className="!p-1 h-11" {...register('color')} />
        <Input label="Icon (optional)" placeholder="e.g. code" {...register('icon')} />
      </div>
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" isLoading={m.isPending}>{category ? 'Save' : 'Create'}</Button></div>
    </form>
  )
}

export default function AdminCategories() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [editing, setEditing] = useState<Category | null>(null)
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState<Category | null>(null)
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useCategories({ search: search || undefined, page, size })
  const refresh = () => { qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['categories-active'] }) }
  const toggle = useMutation({ mutationFn: (id: string) => apiClient.toggleCategoryStatus(id), onSuccess: (r) => { toast.success(r.message); refresh() }, onError: (e) => toast.error(parseApiError(e).message) })
  const remove = useMutation({ mutationFn: (id: string) => apiClient.deleteCategory(id), onSuccess: (r) => { toast.success(r.message); setDel(null); refresh() }, onError: (e) => { toast.error(parseApiError(e).message); setDel(null) } })
  const close = () => { setOpen(false); setEditing(null) }

  return (
    <>
      <PageHeader title="Categories" subtitle="Organise courses into categories" actions={<button className="btn-primary btn-sm" onClick={() => { setEditing(null); setOpen(true) }}><Plus size={16} />New category</button>} />
      <div className="card">
        <div className="p-4 border-b"><div className="relative max-w-sm"><Search size={16} className="absolute left-3 top-3 text-secondary-400" /><input className="input pl-9" placeholder="Search categories" aria-label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div></div>
        {isLoading ? <TableSkeleton /> : isError ? <ErrorState onRetry={refetch} /> : !data?.content.length ? <EmptyState title="No categories" description="Create a category to organise your courses." action={<button className="btn-primary btn-sm" onClick={() => setOpen(true)}>New category</button>} /> : (
          <div className="table-container"><table className="table">
            <thead><tr><th>Name</th><th>Description</th><th>Courses</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{data.content.map((c) => (
              <tr key={c.id}>
                <td><span className="inline-block h-3 w-3 rounded-full mr-2 align-middle" style={{ background: c.color || '#007BA7' }} /><span className="font-medium">{c.name}</span></td>
                <td className="max-w-xs truncate text-secondary-500">{c.description || '—'}</td><td>{c.courseCount}</td>
                <td><StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td><div className="flex justify-end gap-1">
                  <button className="btn-ghost btn-sm" aria-label="Edit" onClick={() => { setEditing(c); setOpen(true) }}><Pencil size={16} /></button>
                  <button className="btn-ghost btn-sm" aria-label={c.isActive ? 'Deactivate' : 'Activate'} title={c.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggle.mutate(c.id)}><Power size={16} /></button>
                  <button className="btn-ghost btn-sm text-error-600" aria-label="Delete" onClick={() => setDel(c)}><Trash2 size={16} /></button>
                </div></td>
              </tr>))}</tbody>
          </table></div>
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={size} onPage={setPage} onSize={(n) => { setSize(n); setPage(0) }} />}
      </div>
      <Modal open={open} onClose={close} title={editing ? 'Edit category' : 'New category'}><CategoryForm category={editing} onClose={close} /></Modal>
      <ConfirmDialog open={!!del} danger title="Delete category" message={`Delete “${del?.name}”? Categories used by courses cannot be deleted.`} confirmLabel="Delete" loading={remove.isPending} onClose={() => setDel(null)} onConfirm={() => del && remove.mutate(del.id)} />
    </>
  )
}
