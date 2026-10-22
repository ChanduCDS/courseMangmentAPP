import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title}
            className={`relative bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="text-secondary-400 hover:text-secondary-700"><X size={18} /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, loading, onConfirm, onClose }:
  { open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-secondary-600 text-sm">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} isLoading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
