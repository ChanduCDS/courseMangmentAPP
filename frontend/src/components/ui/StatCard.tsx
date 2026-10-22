import { motion } from 'motion/react'

export default function StatCard({ label, value, icon, index = 0 }: { label: string; value: React.ReactNode; icon: React.ReactNode; index?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.25 }} className="card card-body flex items-center gap-4">
      <div className="h-11 w-11 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-secondary-500">{label}</p>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
      </div>
    </motion.div>
  )
}
