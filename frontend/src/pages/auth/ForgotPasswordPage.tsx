import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useForgotPassword } from '../../hooks/useAuth'
import { parseApiError } from '../../utils'

const schema = z.object({ email: z.string().email('Enter a valid email') })

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const m = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({ resolver: zodResolver(schema) })
  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a reset link" footer={<Link to="/login" className="text-primary-600">Back to sign in</Link>}>
      {sent ? (
        <p className="text-sm text-success-700 bg-success-50 rounded-lg p-4">If that email exists, a reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit((v) => m.mutate(v, { onSuccess: () => setSent(true), onError: (e) => toast.error(parseApiError(e).message) }))} className="space-y-4" noValidate>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" fullWidth isLoading={m.isPending}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  )
}
