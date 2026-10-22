import { useState } from 'react'
import { Search } from 'lucide-react'
import { usePublicCourses } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import CourseCard from '../../components/ui/CourseCard'
import Pagination from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { titleCase } from '../../utils'

export default function StudentCourses() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, refetch } = usePublicCourses({ search: search || undefined, difficulty: difficulty || undefined, page, size: 9 })
  return (
    <>
      <PageHeader title="Browse courses" subtitle="Find your next course" />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-secondary-400" /><input className="input pl-9" placeholder="Search courses" aria-label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></div>
        <select className="input sm:!w-48" aria-label="Difficulty" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(0) }}><option value="">All levels</option>{['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}</select>
      </div>
      {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
        : isError ? <ErrorState onRetry={refetch} />
        : !data?.content.length ? <div className="card"><EmptyState title="No courses found" description="Try a different search." /></div>
        : <><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{data.content.map((c) => <CourseCard key={c.id} course={c} to={`/dashboard/student/courses/${c.id}`} />)}</div>
          <div className="card mt-6"><Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={9} onPage={setPage} /></div></>}
    </>
  )
}
