import Header from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
  <Header title='Dashboard' description='Welcome to the dashboard!'/>
  </>
}
