import { titleCase } from '../../utils'

const map: Record<string, string> = {
  PUBLISHED: 'badge-success', ENROLLED: 'badge-primary', IN_PROGRESS: 'badge-primary', COMPLETED: 'badge-success',
  PENDING: 'badge-warning', DRAFT: 'badge-secondary', INACTIVE: 'badge-warning', ARCHIVED: 'badge-secondary',
  CANCELLED: 'badge-error', ACTIVE: 'badge-success',
}
export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  return <span className={map[status] || 'badge-secondary'}>{titleCase(status)}</span>
}
