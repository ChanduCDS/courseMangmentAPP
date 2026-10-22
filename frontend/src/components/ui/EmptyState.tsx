import { Inbox, AlertTriangle } from 'lucide-react'

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4">{icon || <Inbox size={22} />}</div>
      <h3 className="font-semibold text-secondary-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-secondary-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message = 'Failed to load data', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle size={22} />}
      title="Something went wrong"
      description={message}
      action={onRetry && <button className="btn-outline btn-sm" onClick={onRetry}>Try again</button>}
    />
  )
}
