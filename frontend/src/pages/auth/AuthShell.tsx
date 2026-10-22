import { motion } from 'motion/react'

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-primary-50 to-white">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full max-w-md card card-body">
        <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
        {subtitle && <p className="text-sm text-secondary-500 mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-sm text-center text-secondary-600">{footer}</div>}
      </motion.div>
    </div>
  )
}
