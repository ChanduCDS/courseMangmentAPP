import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { page: number; totalPages: number; totalElements: number; size: number; onPage: (p: number) => void; onSize?: (s: number) => void }
export default function Pagination({ page, totalPages, totalElements, size, onPage, onSize }: Props) {
  if (!totalElements) return null
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-secondary-200 text-sm text-secondary-600">
      <span>Showing {from}–{to} of {totalElements}</span>
      <div className="flex items-center gap-2">
        {onSize && (
          <select aria-label="Page size" className="input !w-auto !py-1.5" value={size} onChange={(e) => onSize(Number(e.target.value))}>
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        )}
        <button className="btn-ghost btn-sm" disabled={page <= 0} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
        <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
        <button className="btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}
