"use client"

import { Link } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { isMacLike } from "~/lib/platform"
import { Logo } from "../logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { NavMain } from "./main-menu"
import { NavUser } from "./user-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <>
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
        <SidebarFooter className="relative p-0">
          <SidebarGroup className="group-data-[state=collapsed]:-translate-y-13 space-y-1 transition-transform duration-200 ease-in">
            <NavUser />
          </SidebarGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-right-3.5 absolute bottom-4.5 transition-transform ease-linear group-data-[state=collapsed]:right-2.5" />
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-xs uppercase">
              {isMacLike ? "⌘" : "Ctrl + "}
              {"B"}
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
      <div className="fixed right-4 bottom-4 z-20 sm:hidden">
        <SidebarTrigger className="size-9 shadow-xl">
          <Menu />
        </SidebarTrigger>
      </div>
    </>
  )
}
