
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

export function NavMain({
  items, title = "Platform"
}: {
  items: {
    title: string
    url?: string
    icon: LucideIcon
    isActive?: boolean
    isCollapsible?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[], title?: string
}) {
  return (
    <SidebarGroup>

      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.url ? (
                <Link to={item.url} activeOptions={{ exact: true }}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      isActive={isActive}
                      asChild
                    >
                      <div>

                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  )}
                </Link>
              ) : (
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  asChild
                >
                  <div>

                    <item.icon />
                    <span>{item.title}</span>
                  </div>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  {
                    item.isCollapsible ? (
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    ) : null}

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <Link to={subItem.url}>
                            {({ isActive }) => (

                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <div>

                                  {subItem.icon &&
                                    <subItem.icon />}
                                  <span>{subItem.title}</span>
                                </div>
                              </SidebarMenuSubButton>
                            )}
                          </Link>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
