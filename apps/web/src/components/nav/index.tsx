"use client"

import { Link } from "@tanstack/react-router"
import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import { Logo } from "../logo"
import { NavMain } from "./main-menu"
import { NavUser } from "./user-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="list-none" {...props}>
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/app" className="flex items-center gap-x-2">
              <Logo />
              <span className="font-semibold text-xl">Constellation</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
