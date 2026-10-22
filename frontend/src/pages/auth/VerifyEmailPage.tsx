import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AuthShell from './AuthShell'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { apiClient } from '../../services/apiClient'
import { parseApiError } from '../../utils'

export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token')
  const q = useQuery({
    queryKey: ['verify-email', token], enabled: !!token, retry: false,
    queryFn: () => apiClient.getClient().get('/auth/verify-email', { params: { token } }).then((r) => r.data),
  })
  return (
    <AuthShell title="Email verification" footer={<Link to="/login" className="text-primary-600">Go to sign in</Link>}>
      {!token ? <p className="text-error-600 text-sm">Missing verification token.</p>
        : q.isLoading ? <div className="flex justify-center"><LoadingSpinner /></div>
        : q.isError ? <p className="text-error-600 text-sm">{parseApiError(q.error).message}</p>
        : <p className="text-success-700 text-sm">Your email has been verified.</p>}
    </AuthShell>
  )
}
