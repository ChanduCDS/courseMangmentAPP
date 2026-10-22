import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useActiveCategories, useCourse } from '../../hooks/useData'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { ErrorState } from '../../components/ui/EmptyState'
import { parseApiError, titleCase } from '../../utils'

const num = (label: string, min = 0) => z.string().refine((v) => v === '' || (!isNaN(Number(v)) && Number(v) >= min), `${label} must be a number ≥ ${min}`)
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  courseCode: z.string().min(1, 'Course code is required').max(50),
  categoryId: z.string().min(1, 'Choose a category'),
  shortDescription: z.string().max(500).optional(),
  fullDescription: z.string().optional(),
  thumbnailUrl: z.string().max(500).optional(),
  duration: num('Duration'), durationUnit: z.string().min(1), fee: num('Fee'), currency: z.string().length(3, '3-letter code'),
  difficultyLevel: z.string().min(1), enrollmentCapacity: num('Capacity', 1),
  enrollmentStartDate: z.string().optional(), enrollmentEndDate: z.string().optional(), isFeatured: z.boolean(),
}).refine((d) => !d.enrollmentStartDate || !d.enrollmentEndDate || d.enrollmentStartDate <= d.enrollmentEndDate, { path: ['enrollmentEndDate'], message: 'End must be after start' })
type F = z.infer<typeof schema>

const toLocal = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : '')
const toIso = (v?: string) => (v ? new Date(v).toISOString() : undefined)

export default function AdminCourseDetail() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()
  const { data: course, isLoading, isError } = useCourse(id)
  const { data: cats } = useActiveCategories()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', courseCode: '', categoryId: '', duration: '0', durationUnit: 'HOURS', fee: '0', currency: 'USD', difficultyLevel: 'BEGINNER', enrollmentCapacity: '', isFeatured: false },
  })

  useEffect(() => {
    if (course) reset({
      title: course.title, courseCode: course.courseCode, categoryId: course.categoryId, shortDescription: course.shortDescription || '', fullDescription: course.fullDescription || '',
      thumbnailUrl: course.thumbnailUrl || '', duration: String(course.duration ?? 0), durationUnit: course.durationUnit, fee: String(course.fee ?? 0), currency: course.currency,
      difficultyLevel: course.difficultyLevel, enrollmentCapacity: course.enrollmentCapacity ? String(course.enrollmentCapacity) : '',
      enrollmentStartDate: toLocal(course.enrollmentStartDate), enrollmentEndDate: toLocal(course.enrollmentEndDate), isFeatured: !!course.isFeatured,
    })
  }, [course, reset])

  const save = useMutation({
    mutationFn: (v: F) => {
      const body = {
        ...v, duration: Number(v.duration || 0), fee: Number(v.fee || 0),
        enrollmentCapacity: v.enrollmentCapacity ? Number(v.enrollmentCapacity) : undefined,
        enrollmentStartDate: toIso(v.enrollmentStartDate), enrollmentEndDate: toIso(v.enrollmentEndDate),
      }
      return isNew ? apiClient.createCourse(body) : apiClient.updateCourse(id!, body)
    },
    onSuccess: (r) => {
      toast.success(r.message || 'Saved')
      qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['course', id] }); qc.invalidateQueries({ queryKey: ['dash-admin'] })
      nav('/dashboard/admin/courses')
    },
    onError: (e) => {
      const { message, fields } = parseApiError(e)
      Object.entries(fields).forEach(([k, m]) => setError(k as keyof F, { message: m }))
      toast.error(message)
    },
  })

  if (!isNew && isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!isNew && (isError || !course)) return <ErrorState message="Course not found" />

  return (
    <>
      <Link to="/dashboard/admin/courses" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-800 mb-3"><ArrowLeft size={16} />Back to courses</Link>
      <PageHeader title={isNew ? 'New course' : 'Edit course'} subtitle={course ? `${course.courseCode} · ${course.enrollmentCount} enrolled` : 'Fill in the details below'} actions={course && <StatusBadge status={course.status} />} />
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="card card-body space-y-5" noValidate>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Input label="Course code" error={errors.courseCode?.message} {...register('courseCode')} />
          <div>
            <label htmlFor="categoryId" className="label">Category</label>
            <select id="categoryId" className={`input ${errors.categoryId ? 'input-error' : ''}`} {...register('categoryId')}>
              <option value="">Select a category</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1.5 text-sm text-error-600">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label htmlFor="difficultyLevel" className="label">Difficulty</label>
            <select id="difficultyLevel" className="input" {...register('difficultyLevel')}>{['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}</select>
          </div>
          <Input label="Duration" type="number" min={0} error={errors.duration?.message} {...register('duration')} />
          <div>
            <label htmlFor="durationUnit" className="label">Duration unit</label>
            <select id="durationUnit" className="input" {...register('durationUnit')}>{['HOURS', 'DAYS', 'WEEKS', 'MONTHS'].map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}</select>
          </div>
          <Input label="Fee" type="number" step="0.01" min={0} error={errors.fee?.message} {...register('fee')} />
          <Input label="Currency" maxLength={3} error={errors.currency?.message} {...register('currency')} />
          <Input label="Enrollment capacity" type="number" min={1} helperText="Leave blank for unlimited" error={errors.enrollmentCapacity?.message} {...register('enrollmentCapacity')} />
          <Input label="Thumbnail URL" error={errors.thumbnailUrl?.message} {...register('thumbnailUrl')} />
          <Input label="Enrollment opens" type="datetime-local" error={errors.enrollmentStartDate?.message} {...register('enrollmentStartDate')} />
          <Input label="Enrollment closes" type="datetime-local" error={errors.enrollmentEndDate?.message} {...register('enrollmentEndDate')} />
        </div>
        <Textarea label="Short description" error={errors.shortDescription?.message} {...register('shortDescription')} />
        <Textarea label="Full description" className="min-h-[160px]" error={errors.fullDescription?.message} {...register('fullDescription')} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" {...register('isFeatured')} />Feature this course</label>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={() => nav('/dashboard/admin/courses')}>Cancel</Button>
          <Button type="submit" isLoading={save.isPending}>{isNew ? 'Create course' : 'Save changes'}</Button>
        </div>
      </form>
    </>
  )
}
