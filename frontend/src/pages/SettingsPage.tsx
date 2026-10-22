import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiClient } from '../services/apiClient'
import { useAuthStore } from '../store/hooks'
import PageHeader from '../components/ui/PageHeader'

export default function SettingsPage() {
  const { logout } = useAuthStore()
  const nav = useNavigate()
  const signOut = async () => { try { await apiClient.logout() } catch { /* ignore */ } logout(); toast.success('Signed out'); nav('/login') }
  return (
    <>
      <PageHeader title="Settings" />
      <div className="card card-body max-w-xl space-y-4">
        <div className="flex items-center justify-between"><div><p className="font-medium">Sign out</p><p className="text-sm text-secondary-500">End your session on this device.</p></div><button className="btn-outline btn-sm" onClick={signOut}>Sign out</button></div>
      </div>
    </>
  )
}
