import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/app/")({
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
  return <div>Hello "/app/"!</div>
}
