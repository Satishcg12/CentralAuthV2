import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Settings
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar?: string
    roles?: string[]
    is_active?: boolean
  }
  onLogout?: () => void
  customMenuItems?: React.ReactNode
}

export function NavUser({ user, onLogout, customMenuItems }: NavUserProps) {
  const { isMobile } = useSidebar()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  // const isAdmin = user.roles?.includes('admin');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium capitalize">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium capitalize">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 py-1">
                    {user.roles.map(role => (
                      <Badge
                        key={role}
                        variant={role === 'admin' ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {customMenuItems ? (
              customMenuItems
            ) : (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Profile
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
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
