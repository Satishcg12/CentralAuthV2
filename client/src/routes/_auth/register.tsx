import { MultiStageRegistrationForm } from '@/components/auth/registration-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
    <MultiStageRegistrationForm className="mx-auto max-w-sm" />
  </>
}
