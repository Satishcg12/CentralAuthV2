import { LoginForm } from '@/components/auth/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <LoginForm className="mx-auto max-w-sm" />
  </div>
}
