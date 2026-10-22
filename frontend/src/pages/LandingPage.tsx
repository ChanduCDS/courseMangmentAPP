import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, BarChart3, BookOpen, ChevronDown, GraduationCap, ShieldCheck, Users } from 'lucide-react'
import { useCourseStats, usePublicCourses } from '../hooks/useData'
import CourseCard from '../components/ui/CourseCard'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'

const features = [
  { icon: <BookOpen />, title: 'Course catalog', text: 'Browse published courses with clear durations, levels and fees.' },
  { icon: <Users />, title: 'Easy enrollment', text: 'Students enroll in one click, with capacity and date checks enforced by the server.' },
  { icon: <BarChart3 />, title: 'Admin analytics', text: 'Administrators track enrollments, categories and popular courses from live data.' },
  { icon: <ShieldCheck />, title: 'Role-based access', text: 'Separate admin, instructor and student experiences, enforced on the backend.' },
]
const steps = ['Create an account', 'Browse published courses', 'Enroll in a course', 'Track your enrollments']
const faqs = [
  ['Who can create courses?', 'Only administrators can create, publish and archive courses.'],
  ['Are all courses visible publicly?', 'No. Only published courses appear on this page; drafts, inactive and archived courses stay hidden.'],
  ['Can I cancel an enrollment?', 'Yes, students can cancel their enrollment from the My Enrollments page when permitted.'],
]

export default function LandingPage() {
  const loc = useLocation()
  const { data, isLoading, isError } = usePublicCourses({ size: 6 })
  const { data: stats } = useCourseStats()
  const [faq, setFaq] = useState<number | null>(0)

  useEffect(() => {
    const id = loc.hash.replace('#', '') || loc.pathname.replace('/', '')
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
    else window.scrollTo({ top: 0 })
  }, [loc.pathname, loc.hash])

  const categories = Array.from(new Set((data?.content || []).map((c) => c.categoryName).filter(Boolean))) as string[]

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="badge-primary mb-4">Course management made simple</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 leading-tight text-balance">Manage courses. Enroll students. Grow your learning programs.</h1>
            <p className="mt-4 text-lg text-secondary-600 max-w-xl">One platform for administrators, instructors and students to run courses end to end.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary btn-lg">Explore Courses <ArrowRight size={18} /></Link>
              <Link to="/register" className="btn-outline btn-lg">Get Started</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="card card-body">
            <div className="flex items-center gap-3 mb-4"><div className="h-10 w-10 rounded-lg bg-primary-600 text-white flex items-center justify-center"><GraduationCap size={20} /></div><div><p className="font-semibold">Live catalog</p><p className="text-xs text-secondary-500">Straight from the platform</p></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-primary-50 p-4"><p className="text-3xl font-bold text-primary-700">{stats?.publishedCourses ?? '—'}</p><p className="text-sm text-secondary-600">Published courses</p></div>
              <div className="rounded-lg bg-secondary-100 p-4"><p className="text-3xl font-bold text-secondary-800">{categories.length || '—'}</p><p className="text-sm text-secondary-600">Categories shown</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div><h2 className="text-3xl font-bold">Featured courses</h2><p className="text-secondary-500 mt-1">Latest published courses</p></div>
          <Link to="/register" className="text-primary-600 font-medium hidden sm:block">Sign up to enroll →</Link>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
        ) : isError ? (
          <EmptyState title="Couldn't load courses" description="Please check that the backend is running and try again." />
        ) : !data?.content.length ? (
          <EmptyState title="No courses published yet" description="Check back soon." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <CourseCard course={c} to={`/login`} />
              </motion.div>
            ))}
          </div>
        )}
        {categories.length > 0 && (
          <div className="mt-10"><h3 className="font-semibold mb-3">Categories</h3><div className="flex flex-wrap gap-2">{categories.map((c) => <span key={c} className="badge-primary !text-sm !px-3 !py-1">{c}</span>)}</div></div>
        )}
      </section>

      <section id="features" className="bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Everything you need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-6 rounded-xl border">
                <div className="h-11 w-11 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3><p className="text-sm text-secondary-500 mt-1">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <li key={s} className="card card-body text-center"><div className="mx-auto h-10 w-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center mb-3">{i + 1}</div><p className="font-medium">{s}</p></li>
          ))}
        </ol>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="card card-body"><h3 className="font-semibold mb-2">For students</h3><p className="text-sm text-secondary-600">Discover courses, enroll in seconds and keep track of every enrollment in one place.</p></div>
          <div className="card card-body"><h3 className="font-semibold mb-2">For instructors</h3><p className="text-sm text-secondary-600">See your assigned courses and the students enrolled in each one.</p></div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
        <div className="space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={q} className="card">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left font-medium" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>
                {q}<ChevronDown size={18} className={`transition-transform ${faq === i ? 'rotate-180' : ''}`} />
              </button>
              {faq === i && <p className="px-5 pb-4 text-sm text-secondary-600">{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
