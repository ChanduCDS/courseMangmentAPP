import { Link } from 'react-router-dom'
import { BookOpen, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useInstructorDashboard } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

export default function InstructorDashboard() {
  const { data, isLoading, isError, refetch } = useInstructorDashboard()
  if (isLoading) return <div className="grid sm:grid-cols-2 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
  if (isError || !data) return <ErrorState onRetry={refetch} />
  return (
    <>
      <PageHeader title="Instructor dashboard" subtitle="Your assigned courses at a glance" actions={<Link to="/dashboard/instructor/courses" className="btn-primary btn-sm">View my courses</Link>} />
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Assigned courses" value={data.totalAssignedCourses} icon={<BookOpen size={20} />} />
        <StatCard index={1} label="Enrolled students" value={data.totalEnrolledStudents} icon={<Users size={20} />} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card card-body"><h2 className="font-semibold mb-4">Enrollment by course</h2>
          {data.courseStats?.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.courseStats}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="courseCode" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="enrolledStudents" name="Students" fill="#007BA7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState title="No courses assigned yet" />}
        </div>
        <div className="card"><div className="card-header font-semibold">Recent enrollments</div>
          {data.recentEnrollments?.length ? <ul className="divide-y">{data.recentEnrollments.map((e) => <li key={e.enrollmentId} className="px-6 py-3 text-sm flex justify-between gap-2"><span><span className="font-medium">{e.studentName}</span><span className="block text-xs text-secondary-500">{e.courseTitle} · {formatDate(e.enrolledAt)}</span></span><StatusBadge status={e.status} /></li>)}</ul> : <EmptyState title="No enrollments yet" />}
        </div>
      </div>
    </>
  )
}
