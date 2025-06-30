import { ConvexQueryClient } from "@convex-dev/react-query"
import { MutationCache, notifyManager, QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routerWithQueryClient } from "@tanstack/react-router-with-query"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { toast } from "sonner"
import { DefaultCatchBoundary } from "./components/default-catch-boundary"
import { NotFound } from "./components/NotFound"
import { routeTree } from "./routeTree.gen"

export function createRouter() {
  if (typeof document !== "undefined") {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string
  if (!CONVEX_URL) {
    console.error("missing envar CONVEX_URL")
  }
  const convexClient = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  })
  const convexQueryClient = new ConvexQueryClient(convexClient)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        experimental_prefetchInRender: true,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      context: { queryClient, convexClient, convexQueryClient },
      Wrap: ({ children }) => <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>,
      scrollRestoration: true,
    }),
    queryClient,
  )

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
