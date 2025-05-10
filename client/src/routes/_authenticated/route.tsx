import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/useAuthStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      sessionStorage.setItem('redirect_after_login', location.pathname)
      throw redirect({
        to: '/login',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='border'>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
