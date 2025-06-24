import agent from "@convex-dev/agent/convex.config"
import betterAuth from "@convex-dev/better-auth/convex.config"
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config"
import presence from "@convex-dev/presence/convex.config"
import workflow from "@convex-dev/workflow/convex.config"
import { defineApp } from "convex/server"

const app = defineApp()

app.use(agent)
app.use(betterAuth)
app.use(persistentTextStreaming)
app.use(presence)
app.use(workflow)

export default app
