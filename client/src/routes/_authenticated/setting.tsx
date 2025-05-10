  import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/setting')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/setting"!</div>
}
