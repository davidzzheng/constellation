import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router"
import { AppSidebar } from "~/components/nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"

export const Route = createFileRoute("/app")({
  component: RouteComponent,
})

function RouteComponent() {
  const matches = useMatches()

  const breadcrumbItems = matches
    .filter((match) => match.loaderData?.crumb)
    .map(({ pathname, loaderData }) => {
      return {
        href: pathname,
        label: loaderData?.crumb,
      }
    })
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map(({ href, label }, index, arr) => (
                  <>
                    <BreadcrumbItem key={href}>
                      {index === arr.length - 1 ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={href}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index !== arr.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <section className="m-4">
          <Outlet />
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
