import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useResetPassword } from '../../hooks/useAuth'
import { parseApiError } from '../../utils'

const schema = z.object({ password: z.string().min(8, 'At least 8 characters'), confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type F = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const nav = useNavigate()
  const m = useResetPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })
  return (
    <AuthShell title="Reset password" footer={<Link to="/login" className="text-primary-600">Back to sign in</Link>}>
      {!token ? <p className="text-sm text-error-600">This reset link is missing its token.</p> : (
        <form onSubmit={handleSubmit((v) => m.mutate({ token, ...v }, { onSuccess: () => { toast.success('Password updated'); nav('/login') }, onError: (e) => toast.error(parseApiError(e).message) }))} className="space-y-4" noValidate>
          <Input label="New password" type="password" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" fullWidth isLoading={m.isPending}>Reset password</Button>
        </form>
      )}
    </AuthShell>
  )
}
