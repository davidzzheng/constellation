import { httpRouter } from "convex/server"
import { betterAuthComponent, createAuth } from "./auth"
// import { streamChat } from "./chat"

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

// http.route({
//   path: "/chat-stream",
//   method: "POST",
//   handler: streamChat,
// })

export default http
