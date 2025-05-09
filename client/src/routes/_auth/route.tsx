import { ModeToggle } from '@/components/mode-toggle'
import { useAuthStore } from '@/stores/useAuthStore'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (isAuthenticated) {
      // Redirect to the last visited page or dashboard
      throw redirect({
        to: '/',
      })

    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative flex flex-col min-h-screen ">
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>
      {/* Auth Layout */}
      <main className="h-fit p-4 max-w-3xl m-auto bg-background text-foreground">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col md:flex-row justify-between items-center px-6 py-4 text-xs ">
        <div>
          &copy; {new Date().getFullYear()} CentralAuth
        </div>
        <div className="flex gap-4 mt-2 md:mt-0 ">
          <Link to="/help" className="hover:underline">Help</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </div>
  )
}