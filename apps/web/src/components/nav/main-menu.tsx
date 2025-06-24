"use client"

import { Link, useLocation } from "@tanstack/react-router"
import { Bot, Home, Plus, SquareTerminal } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

export function NavMain() {
  const { pathname } = useLocation()
  return (
    <SidebarGroup>
      <SidebarMenuItem className="mb-4">
        <SidebarMenuButton tooltip="Create" className="cursor-pointer bg-primary">
          <Plus />
          Create
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Dashboard" asChild isActive={pathname === "/app"}>
            <Link to="/app">
              <Home />
              Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Agents" asChild isActive={pathname === "/app/agents"}>
            <Link to="/app/agents">
              <Bot />
              Agents
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Tasks" asChild isActive={pathname === "/app/tasks"}>
            <Link to="/app/tasks">
              <SquareTerminal />
              Tasks
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
