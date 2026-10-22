import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, FileText, GraduationCap, Plus, Users, CheckCircle2 } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { useAdminDashboard } from '../../hooks/useData'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils'

const COLORS = ['#007BA7', '#42b3d7', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b']

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useAdminDashboard()
  if (isLoading) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
  if (isError || !data) return <ErrorState onRetry={refetch} />
  const stats = [
    { label: 'Total courses', value: data.totalCourses, icon: <BookOpen size={20} /> },
    { label: 'Published', value: data.publishedCourses, icon: <CheckCircle2 size={20} /> },
    { label: 'Draft / inactive', value: `${data.draftCourses} / ${data.inactiveCourses}`, icon: <FileText size={20} /> },
    { label: 'Active enrollments', value: data.activeEnrollments, icon: <ClipboardList size={20} /> },
    { label: 'Students', value: data.totalStudents, icon: <GraduationCap size={20} /> },
    { label: 'Instructors', value: data.totalInstructors, icon: <Users size={20} /> },
    { label: 'Archived', value: data.archivedCourses, icon: <BookOpen size={20} /> },
  ]
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Overview of your platform" actions={<>
        <Link to="/dashboard/admin/courses/new" className="btn-primary btn-sm"><Plus size={16} />New course</Link>
        <Link to="/dashboard/admin/categories" className="btn-secondary btn-sm">Manage categories</Link>
      </>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((s, i) => <StatCard key={s.label} index={i} {...s} />)}</div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card card-body lg:col-span-2">
          <h2 className="font-semibold mb-4">Enrollment trend</h2>
          {data.enrollmentTrend?.length ? (
            <div className="h-64"><ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.enrollmentTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
                <Area type="monotone" dataKey="count" name="Enrollments" stroke="#007BA7" fill="#e0f2f9" /></AreaChart>
            </ResponsiveContainer></div>
          ) : <EmptyState title="No enrollment data yet" />}
        </div>
        <div className="card card-body">
          <h2 className="font-semibold mb-4">Courses by category</h2>
          {data.categoryDistribution?.length ? (
            <div className="h-64"><ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={data.categoryDistribution} dataKey="courseCount" nameKey="categoryName" innerRadius={45} outerRadius={80}>
                {data.categoryDistribution.map((c, i) => <Cell key={c.categoryId} fill={c.categoryColor || COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer></div>
          ) : <EmptyState title="No categories yet" />}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <div className="card-header font-semibold">Popular courses</div>
          {data.popularCourses?.length ? <ul className="divide-y">{data.popularCourses.map((c) => (
            <li key={c.courseId} className="px-6 py-3 flex justify-between text-sm"><span><span className="font-medium">{c.courseTitle}</span><span className="block text-xs text-secondary-500">{c.courseCode}</span></span><span className="text-secondary-600">{c.enrollmentCount} enrolled</span></li>))}</ul>
            : <EmptyState title="No data yet" />}
        </div>
        <div className="card">
          <div className="card-header font-semibold">Recent enrollments</div>
          {data.recentEnrollments?.length ? <ul className="divide-y">{data.recentEnrollments.map((e) => (
            <li key={e.enrollmentId} className="px-6 py-3 text-sm flex justify-between gap-2"><span><span className="font-medium">{e.studentName}</span><span className="block text-xs text-secondary-500">{e.courseTitle} · {formatDate(e.enrolledAt)}</span></span><StatusBadge status={e.status} /></li>))}</ul>
            : <EmptyState title="No enrollments yet" />}
        </div>
        <div className="card">
          <div className="card-header font-semibold">Recent course updates</div>
          {data.recentCourseUpdates?.length ? <ul className="divide-y">{data.recentCourseUpdates.map((c) => (
            <li key={c.courseId} className="px-6 py-3 text-sm flex justify-between gap-2"><span><Link to={`/dashboard/admin/courses/${c.courseId}`} className="font-medium hover:text-primary-700">{c.courseTitle}</Link><span className="block text-xs text-secondary-500">{formatDate(c.updatedAt)}{c.updatedBy ? ` · ${c.updatedBy}` : ''}</span></span><StatusBadge status={c.status} /></li>))}</ul>
            : <EmptyState title="No updates yet" />}
        </div>
      </div>
    </>
  )
}
