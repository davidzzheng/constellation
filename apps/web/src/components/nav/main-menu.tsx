"use client"

import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useLocation } from "@tanstack/react-router"
import { Bot, ChevronRight, Home, Plus, SquareTerminal } from "lucide-react"
import { Suspense, useMemo } from "react"
import { api } from "~/api"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

export function NavMain() {
  const { pathname } = useLocation()
  const { data: agents } = useSuspenseQuery(convexQuery(api.agent.getAgentsForCurrentUser, {}))
  const { data: tasks } = useSuspenseQuery(convexQuery(api.tasks.getTasksForCurrentUser, {}))

  const DefaultAgentMenuItem = () => (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Agents" asChild isActive={pathname === "/app/agents"}>
        <Link to="/app/agents">
          <Bot />
          Agents
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  const DefaultTasksMenuItem = () => (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Tasks" asChild isActive={pathname === "/app/tasks"}>
        <Link to="/app/tasks">
          <SquareTerminal />
          Tasks
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <SidebarGroup>
      <SidebarMenuItem className="mb-4">
        <SidebarMenuButton tooltip="Create" className="cursor-pointer bg-secondary dark:bg-primary">
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

        <Suspense fallback={<DefaultAgentMenuItem />}>
          {agents.length > 0 ? (
            <Collapsible asChild defaultOpen={pathname === "/app/agents"} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Agents" isActive={pathname === "/app/agents"} className="w-full">
                    <Bot />
                    Agents
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {agents.map((agent) => (
                      <SidebarMenuSubItem key={agent._id}>
                        <SidebarMenuSubButton asChild>
                          <Link to={`/app/agents/${agent._id}`}>{agent.name}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <DefaultAgentMenuItem />
          )}
        </Suspense>

        <Suspense fallback={<DefaultTasksMenuItem />}>
          {tasks.length > 0 ? (
            <Collapsible asChild defaultOpen={pathname === "/app/tasks"} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Agents" isActive={pathname === "/app/tasks"} className="w-full">
                    <SquareTerminal />
                    Tasks
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {tasks.map((task) => (
                      <SidebarMenuSubItem key={task._id}>
                        <SidebarMenuSubButton asChild>
                          <Link to={`/app/tasks/${task._id}`}>{task.name}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <DefaultTasksMenuItem />
          )}
        </Suspense>
      </SidebarMenu>
    </SidebarGroup>
  )
}
