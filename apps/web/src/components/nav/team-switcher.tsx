"use client"

import { useMutation } from "convex/react"
import { ChevronsUpDown, Plus } from "lucide-react"
import * as React from "react"
import { api } from "~/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar"

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
  setActiveOrganization,
}: {
  organizations: {
    id: string
    name: string
    logo: React.ElementType
    plan: string
    slug?: string
    metadata?: string
  }[]
  activeOrganization: {
    id: string
    name: string
    logo: React.ElementType
    plan: string
    slug?: string
    metadata?: string
  } | null
  setActiveOrganization: (org: any) => void
}) {
  const { isMobile } = useSidebar()
  const [showForm, setShowForm] = React.useState(false)
  const [formState, setFormState] = React.useState<{
    name: string
    slug: string
    logo?: string
    metadata?: string
  }>({ name: "", slug: "" })
  const [editOrgId, setEditOrgId] = React.useState<string | null>(null)
  const createOrganization = useMutation(api.organization.createOrganization)
  const updateOrganization = useMutation(api.organization.updateOrganization)
  const deleteOrganization = useMutation(api.organization.deleteOrganization)

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editOrgId) {
      await updateOrganization({ id: editOrgId, ...formState })
    } else {
      await createOrganization(formState)
    }
    setShowForm(false)
    setEditOrgId(null)
    setFormState({ name: "", slug: "" })
  }

  const handleEdit = (org: any) => {
    setEditOrgId(org.id)
    setFormState({
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      metadata: org.metadata,
    })
    setShowForm(true)
  }

  const handleDelete = async (orgId: string) => {
    await deleteOrganization({ id: orgId })
    if (activeOrganization && activeOrganization.id === orgId && organizations.length > 1) {
      setActiveOrganization(organizations.find((o) => o.id !== orgId) || organizations[0])
    }
  }

  if (!activeOrganization) {
    return null
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeOrganization.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrganization.name}</span>
                <span className="truncate text-xs">{activeOrganization.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Organizations</DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem key={org.id} onClick={() => setActiveOrganization(org)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <org.logo className="size-3.5 shrink-0" />
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(org)
                  }}
                  className="ml-2 text-blue-500 text-xs"
                >
                  Edit
                </button>
                {org.id !== activeOrganization.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(org.id)
                    }}
                    className="ml-2 text-red-500 text-xs"
                  >
                    Delete
                  </button>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => {
                setShowForm(true)
                setEditOrgId(null)
                setFormState({ name: "", slug: "" })
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add organization</div>
            </DropdownMenuItem>
            {showForm && (
              <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-2 p-2">
                <input
                  className="rounded border p-1"
                  placeholder="Name"
                  value={formState.name}
                  onChange={(e) => setFormState((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className="rounded border p-1"
                  placeholder="Slug"
                  value={formState.slug}
                  onChange={(e) => setFormState((f) => ({ ...f, slug: e.target.value }))}
                  required
                />
                <input
                  className="rounded border p-1"
                  placeholder="Logo (optional)"
                  value={formState.logo || ""}
                  onChange={(e) => setFormState((f) => ({ ...f, logo: e.target.value }))}
                />
                <input
                  className="rounded border p-1"
                  placeholder="Metadata (optional)"
                  value={formState.metadata || ""}
                  onChange={(e) => setFormState((f) => ({ ...f, metadata: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button type="submit" className="rounded bg-blue-500 px-2 py-1 text-white">
                    {editOrgId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    className="rounded bg-gray-300 px-2 py-1"
                    onClick={() => {
                      setShowForm(false)
                      setEditOrgId(null)
                      setFormState({ name: "", slug: "" })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
