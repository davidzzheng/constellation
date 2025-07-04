import { createFileRoute, isMatch, Link, Outlet, useMatches } from "@tanstack/react-router"
import { ReactFlowProvider } from "@xyflow/react"
import { Home } from "lucide-react"
import { AppSidebar } from "~/components/nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  // beforeLoad: async ({ context }) => {
  //   const REDIRECT_URL = "/"
  //   if (!context.userId) {
  //     throw redirect({
  //       to: REDIRECT_URL,
  //     })
  //   }
  // },
})

function RouteComponent() {
  const matches = useMatches()

  const breadcrumbItems = matches
    .filter((match) => isMatch(match, "loaderData.crumb"))
    .map(({ pathname, loaderData }) => {
      return {
        href: pathname,
        label: loaderData?.crumb,
      }
    })

  const canvasView = matches.some((match) => isMatch(match, "loaderData.canvasView"))

  const Base = () => (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div
            className={cn(
              "m-4 flex items-center gap-2 px-3 py-2",
              canvasView && "z-[1] rounded-lg bg-background shadow-lg",
            )}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/app">
                      <Home className="size-5 opacity-75" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map(({ href, label }, index, arr) => (
                  <span key={href} className="flex items-center gap-x-2">
                    {index < arr.length && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem key={href} className={cn("slide-in-from-left-25 fade-in animate-in duration-250")}>
                      {index === arr.length - 1 ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={href}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
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

  return canvasView ? (
    <ReactFlowProvider>
      <Base />
    </ReactFlowProvider>
  ) : (
    <Base />
  )
}
