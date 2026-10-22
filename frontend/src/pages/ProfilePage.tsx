import { useAuthStore } from '../store/hooks'
import PageHeader from '../components/ui/PageHeader'
import { titleCase } from '../utils'

export default function ProfilePage() {
  const { user } = useAuthStore()
  if (!user) return null
  const rows = [['Name', user.fullName], ['Email', user.email], ['Role', user.roles.map(titleCase).join(', ')], ['Email verified', ((user as any).isEmailVerified ?? (user as any).emailVerified) ? 'Yes' : 'No']]
  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details" />
      <div className="card card-body max-w-xl">
        <div className="flex items-center gap-4 mb-6"><span className="h-14 w-14 rounded-full bg-primary-600 text-white text-xl font-semibold flex items-center justify-center">{user.firstName?.[0]}{user.lastName?.[0]}</span><div><p className="font-semibold">{user.fullName}</p><p className="text-sm text-secondary-500">{user.email}</p></div></div>
        <dl className="divide-y">{rows.map(([k, v]) => <div key={k} className="py-3 flex justify-between text-sm"><dt className="text-secondary-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
        <p className="text-xs text-secondary-400 mt-4">Profile editing and password change need backend endpoints that are still placeholders.</p>
      </div>
    </>
  )
}
