import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins"
import { polarClient } from "@polar-sh/better-auth"
import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  plugins: [organizationClient(), polarClient(), convexClient(), crossDomainClient()],
})
