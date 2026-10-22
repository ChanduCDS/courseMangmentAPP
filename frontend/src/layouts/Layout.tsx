import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell, BookOpen, ClipboardList, FolderTree, GraduationCap, LayoutDashboard, LogOut, Menu, PanelLeftClose,
  PanelLeftOpen, ScrollText, Settings, User as UserIcon, Users, X,
} from 'lucide-react'
import { useAuthStore, useUIStore } from '../store/hooks'
import { apiClient } from '../services/apiClient'
import { useNotifications, useUnreadCount } from '../hooks/useData'
import { formatDate } from '../utils'
import toast from 'react-hot-toast'

type Item = { to: string; label: string; icon: React.ReactNode; end?: boolean }

function navFor(roles: string[] = []): Item[] {
  if (roles.includes('ADMIN')) return [
    { to: '/dashboard/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/dashboard/admin/courses', label: 'Courses', icon: <BookOpen size={18} /> },
    { to: '/dashboard/admin/categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { to: '/dashboard/admin/enrollments', label: 'Enrollments', icon: <ClipboardList size={18} /> },
    { to: '/dashboard/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/dashboard/admin/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { to: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: <ScrollText size={18} /> },
  ]
  if (roles.includes('INSTRUCTOR')) return [
    { to: '/dashboard/instructor', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/dashboard/instructor/courses', label: 'My Courses', icon: <BookOpen size={18} /> },
  ]
  return [
    { to: '/dashboard/student', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/dashboard/student/courses', label: 'Browse Courses', icon: <BookOpen size={18} /> },
    { to: '/dashboard/student/enrollments', label: 'My Enrollments', icon: <ClipboardList size={18} /> },
  ]
}

function NavList({ items, collapsed, onNavigate }: { items: Item[]; collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Sidebar">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end} onClick={onNavigate} title={collapsed ? i.label : undefined}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
          {i.icon}{!collapsed && <span>{i.label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

function Bell_() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const { data: count = 0 } = useUnreadCount()
  const { data } = useNotifications(0, 5)
  const readAll = useMutation({
    mutationFn: () => apiClient.markAllAsRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread-count'] }) },
  })
  const readOne = useMutation({
    mutationFn: (id: string) => apiClient.markAsRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread-count'] }) },
  })
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-secondary-100">
        <Bell size={20} />
        {count > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error-500 text-white text-[10px] flex items-center justify-center">{count > 99 ? '99+' : count}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg border shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              <button className="text-xs text-primary-600 hover:underline" onClick={() => readAll.mutate()}>Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!data?.content.length && <p className="p-4 text-sm text-secondary-500">No notifications yet.</p>}
              {data?.content.map((n) => (
                <button key={n.id} onClick={() => !n.isRead && readOne.mutate(n.id)} className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-secondary-50 ${n.isRead ? '' : 'bg-primary-50/50'}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-secondary-500 line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-secondary-400 mt-1">{formatDate(n.createdAt, 'MMM d, h:mm a')}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const [menu, setMenu] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const qc = useQueryClient()
  const items = navFor(user?.roles)

  useEffect(() => { setMobileMenuOpen(false); setMenu(false) }, [loc.pathname])

  const doLogout = async () => {
    try { await apiClient.logout() } catch { /* token may be expired */ }
    logout()
    qc.clear()
    toast.success('Signed out')
    nav('/login')
  }

  const brand = (collapsed: boolean) => (
    <Link to="/" className="h-16 flex items-center gap-2 px-4 border-b font-bold text-secondary-900">
      <span className="h-9 w-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0"><GraduationCap size={20} /></span>
      {!collapsed && <span>LearnHub</span>}
    </Link>
  )

  return (
    <div className="min-h-screen flex bg-secondary-50">
      <motion.aside animate={{ width: sidebarOpen ? 240 : 72 }} transition={{ duration: 0.2 }} className="hidden lg:flex flex-col bg-white border-r shrink-0 sticky top-0 h-screen">
        {brand(!sidebarOpen)}
        <NavList items={items} collapsed={!sidebarOpen} />
      </motion.aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} />
            <motion.aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between pr-3">{brand(false)}<button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
              <NavList items={items} onNavigate={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="lg:hidden p-2 rounded-lg hover:bg-secondary-100" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <button className="hidden lg:block p-2 rounded-lg hover:bg-secondary-100" onClick={toggleSidebar} aria-label="Toggle sidebar">{sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}</button>
          </div>
          <div className="flex items-center gap-2">
            <Bell_ />
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-secondary-100">
                <span className="h-8 w-8 rounded-full bg-primary-600 text-white text-sm font-semibold flex items-center justify-center">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                <span className="hidden sm:block text-sm font-medium">{user?.fullName}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="dropdown-menu">
                    <div className="px-4 py-2 border-b"><p className="text-sm font-medium truncate">{user?.fullName}</p><p className="text-xs text-secondary-500 truncate">{user?.email}</p></div>
                    <Link to="/dashboard/profile" className="dropdown-item"><UserIcon size={16} />Profile</Link>
                    <Link to="/dashboard/settings" className="dropdown-item"><Settings size={16} />Settings</Link>
                    <button onClick={doLogout} className="dropdown-item w-full text-error-600"><LogOut size={16} />Sign out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
