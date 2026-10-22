import { Link } from 'react-router-dom'
import { Clock, Users, BookOpen } from 'lucide-react'
import type { Course } from '../../types'
import { formatCurrency, titleCase } from '../../utils'

export default function CourseCard({ course, to }: { course: Course; to: string }) {
  return (
    <Link to={to} className="card group flex flex-col h-full">
      <div className="h-36 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
        {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : <BookOpen className="text-primary-400" size={40} />}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          {course.categoryName && <span className="badge-primary">{course.categoryName}</span>}
          <span className="badge-secondary">{titleCase(course.difficultyLevel)}</span>
        </div>
        <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700">{course.title}</h3>
        <p className="text-sm text-secondary-500 mt-1 line-clamp-2 flex-1">{course.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-secondary-600">
          <span className="flex items-center gap-1"><Clock size={14} />{course.duration} {titleCase(course.durationUnit)}</span>
          <span className="flex items-center gap-1"><Users size={14} />{course.enrollmentCount}</span>
          <span className="font-semibold text-primary-700">{course.fee ? formatCurrency(course.fee, course.currency) : 'Free'}</span>
        </div>
      </div>
    </Link>
  )
}
