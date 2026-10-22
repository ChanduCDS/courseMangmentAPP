import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from './AuthShell'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useRegister } from '../../hooks/useAuth'
import { parseApiError, roleHome } from '../../utils'

const schema = z.object({
  firstName: z.string().min(1, 'Required'), lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'), phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'), confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' })
type F = z.infer<typeof schema>

export default function RegisterPage() {
  const nav = useNavigate()
  const reg = useRegister()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })
  const onSubmit = ({ confirm: _c, ...v }: F) =>
    reg.mutate(v, {
      onSuccess: (r: any) => { toast.success('Account created'); nav(roleHome(r.data.user.roles)) },
      onError: (e) => {
        const { message, fields } = parseApiError(e)
        Object.entries(fields).forEach(([k, m]) => setError(k as keyof F, { message: m }))
        toast.error(message)
      },
    })
  return (
    <AuthShell title="Create your account" subtitle="Start learning today" footer={<>Already registered? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone (optional)" type="tel" error={errors.phone?.message} {...register('phone')} />
        <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" fullWidth isLoading={reg.isPending}>Create account</Button>
      </form>
    </AuthShell>
  )
}
