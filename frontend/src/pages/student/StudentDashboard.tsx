import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Loader } from 'lucide-react'
import { useStudentDashboard } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import CourseCard from '../../components/ui/CourseCard'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

export default function StudentDashboard() {
  const { data, isLoading, isError, refetch } = useStudentDashboard()
  if (isLoading) return <div className="grid sm:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
  if (isError || !data) return <ErrorState onRetry={refetch} />
  return (
    <>
      <PageHeader title="My learning" subtitle="Your courses and progress" actions={<Link to="/dashboard/student/courses" className="btn-primary btn-sm">Browse courses</Link>} />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Enrolled" value={data.enrolledCourses} icon={<BookOpen size={20} />} />
        <StatCard index={1} label="In progress" value={data.inProgressCourses} icon={<Loader size={20} />} />
        <StatCard index={2} label="Completed" value={data.completedCourses} icon={<CheckCircle2 size={20} />} />
      </div>
      <div className="card mt-6"><div className="card-header font-semibold">My enrollments</div>
        {data.enrollments?.length ? <ul className="divide-y">{data.enrollments.map((e) => (
          <li key={e.id} className="px-6 py-3 flex items-center justify-between gap-3 text-sm">
            <span><Link to={`/dashboard/student/courses/${e.courseId}`} className="font-medium hover:text-primary-700">{e.courseTitle}</Link><span className="block text-xs text-secondary-500">Enrolled {formatDate(e.enrolledAt)} · {e.progressPercentage ?? 0}% complete</span></span><StatusBadge status={e.status} />
          </li>))}</ul>
          : <EmptyState title="You haven't enrolled yet" description="Find a course and start learning." action={<Link to="/dashboard/student/courses" className="btn-primary btn-sm">Browse courses</Link>} />}
      </div>
      {!!data.recommendedCourses?.length && (
        <section className="mt-8"><h2 className="font-semibold text-lg mb-4">Recommended for you</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{data.recommendedCourses.map((c) => <CourseCard key={c.id} course={c} to={`/dashboard/student/courses/${c.id}`} />)}</div></section>
      )}
    </>
  )
}
