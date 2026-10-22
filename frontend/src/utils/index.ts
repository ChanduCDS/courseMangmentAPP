import { AxiosError } from 'axios'
import { format } from 'date-fns'

export function parseApiError(e: unknown): { message: string; fields: Record<string, string> } {
  const err = e as AxiosError<any>
  const body = err?.response?.data
  const message = body?.error?.message || body?.message || err?.message || 'Something went wrong'
  const fields: Record<string, string> = {}
  const d = body?.error?.details
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    Object.entries(d).forEach(([k, v]) => (fields[k] = String(v)))
  }
  return { message, fields }
}

export const formatDate = (d?: string | null, f = 'MMM d, yyyy') => {
  if (!d) return '—'
  try {
    return format(new Date(d), f)
  } catch {
    return '—'
  }
}

export const formatCurrency = (n?: number | null, currency = 'USD') =>
  n == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

export const titleCase = (s?: string) =>
  (s || '').toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export const roleHome = (roles?: string[]) =>
  roles?.includes('ADMIN') ? '/dashboard/admin' : roles?.includes('INSTRUCTOR') ? '/dashboard/instructor' : '/dashboard/student'

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
