"use client"

import { useConvexPaginatedQuery } from "@convex-dev/react-query"
import { Link, useLocation } from "@tanstack/react-router"
import { Bot, ChevronRight, Home, Plus, SquareTerminal } from "lucide-react"
import { api } from "~/api"
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
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

export function NavMain() {
  const { pathname } = useLocation()

  const { results: agents } = useConvexPaginatedQuery(
    api.agent.getAgentsForCurrentUser,
    { paginationOpts: {} },
    { initialNumItems: 5 },
  )

  const { results: tasks } = useConvexPaginatedQuery(
    api.tasks.getTasksForCurrentUser,
    {
      paginationOpts: {},
    },
    { initialNumItems: 5 },
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

        {tasks.length > 0 ? (
          <Collapsible asChild defaultOpen={pathname === "/app/tasks"} className="group/collapsible">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Agents" isActive={pathname === "/app/tasks"} className="w-full">
                <Link to="/app/tasks">
                  <SquareTerminal />
                  Tasks
                </Link>
              </SidebarMenuButton>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuAction>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {tasks.map((task) => (
                    <SidebarMenuSubItem key={task._id}>
                      <SidebarMenuSubButton asChild isActive={pathname === `/app/tasks/${task._id}`}>
                        <Link to="/app/tasks/$id" params={{ id: task._id }}>
                          {task.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Tasks" asChild isActive={pathname === "/app/tasks"}>
              <Link to="/app/tasks">
                <SquareTerminal />
                Tasks
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

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
                      <SidebarMenuSubButton asChild isActive={pathname === `/app/agents/${agent._id}`}>
                        <Link to="/app/agents/$id" params={{ id: agent._id }}>
                          {agent.name}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Agents" asChild isActive={pathname === "/app/agents"}>
              <Link to="/app/agents">
                <Bot />
                Agents
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
