import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useLogin } from '../../hooks/useAuth'
import { parseApiError, roleHome } from '../../utils'

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') })
type F = z.infer<typeof schema>

export default function LoginPage() {
  const nav = useNavigate()
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })
  const onSubmit = (v: F) =>
    login.mutate(v, {
      onSuccess: (r: any) => { toast.success('Welcome back!'); nav(roleHome(r.data.user.roles)) },
      onError: (e) => toast.error(parseApiError(e).message),
    })
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account"
      footer={<>No account? <Link to="/register" className="text-primary-600 font-medium">Create one</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-primary-600">Forgot password?</Link></div>
        <Button type="submit" fullWidth isLoading={login.isPending}>Sign in</Button>
      </form>
    </AuthShell>
  )
}
