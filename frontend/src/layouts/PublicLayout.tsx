import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/hooks'
import { roleHome } from '../utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-secondary-900">
            <span className="h-9 w-9 rounded-lg bg-primary-600 text-white flex items-center justify-center"><GraduationCap size={20} /></span>
            LearnHub
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'text-primary-700 bg-primary-50' : 'text-secondary-600 hover:text-secondary-900'}`}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Link to={roleHome(user?.roles)} className="btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t bg-white">
              <div className="p-4 flex flex-col gap-1">
                {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-secondary-50">{l.label}</Link>)}
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline mt-2">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-secondary-900 text-secondary-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold text-white mb-2"><GraduationCap size={18} /> LearnHub</div>
            <p>A course management platform for administrators, instructors and students.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Navigate</h4>
            <ul className="space-y-1">{links.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Account</h4>
            <ul className="space-y-1">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white">Forgot password</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-800 py-4 text-center text-xs">© {new Date().getFullYear()} LearnHub. All rights reserved.</div>
      </footer>
    </div>
  )
}
