import {
  Activity,
  Database,
  FileText,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Settings,
  Users
} from "lucide-react"
import * as React from "react"

import { useLogout } from "@/api/auth/auth.query"
import Logo from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/useAuthStore"
import { APP_NAME, APP_VERSION } from "@/utils/config"
import { getUserFullName } from "@/utils/jwt"
import { Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

const data = {
  // User data will be fetched from context
  navMain: [
    {
      title: "Dashboard",
      icon: Activity,
      isActive: true,
      url: "/dashboard",
    },

    {
      title: "Applications",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "OAuth Clients",
          url: "/clients",
        },
        {
          title: "Client Roles",
          url: "/admin/applications/role",
        },
      ],
    },
    {
      title: "User Management",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Roles",
          url: "/admin/roles",
        },
        {
          title: "Permissions",
          url: "/admin/permissions",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Documentation",
      url: "/admin/docs",
      icon: FileText,
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const {
    mutateAsync: logout

  } = useLogout()
  const navigate = useNavigate()

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout({})
      // Show success message
      toast.success(`Logged out successfully!`);
      // Redirect to login page
      navigate({ to: "/login" });
    } catch (error) {
      // Handle error
      toast.error(`Logout failed!`);
    } finally {

    }
  }

  // Create user data for sidebar
  const userData =
    user
      ? {
        name: getUserFullName(user),
        email: user.email,
        avatar: "/avatars/default.png"
      }
      : {
        name: "Guest User",
        email: "guest@example.com",
        avatar: "/avatars/guest.png"
      }

  // Custom menu items for the NavUser component
  const customMenuItems = (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <Users className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/setting">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <Logo className="h-8 w-auto" />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium"> {APP_NAME}</span>
                  <span className="truncate text-xs">{APP_VERSION}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={userData}
          onLogout={handleLogout}
          customMenuItems={customMenuItems}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
