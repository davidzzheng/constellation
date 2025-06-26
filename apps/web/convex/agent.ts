import { Agent } from "@convex-dev/agent"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { createOllama } from "ollama-ai-provider"
import { components } from "./_generated/api"
import { action, mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const ollama = createOllama()

const superAgent = new Agent(components.agent, {
  chat: openrouter.chat("deepseek/deepseek-r1-0528-qwen3-8b:free"),
  textEmbedding: ollama.embedding("bge-m3"),
  instructions:
    "You are an assistant that helps create and manage tasks, which consists of coordinating other agents. " +
    "You can search, create, and merge agents. " +
    "Be willing to undo mistakes and get better. When in doubt, merge agents. " +
    "When passing IDs, you MUST pass a real ID verbatim. " +
    "If you don't have an ID, search for one first.",
  contextOptions: {
    recentMessages: 20,
    searchOtherThreads: true,
    excludeToolMessages: false,
  },
  maxSteps: 10,
})

export const createThreadAndPrompt = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      return null
    }
    const { threadId, thread } = await superAgent.createThread(ctx, {
      userId,
    })
    // Creates a user message with the prompt, and an assistant reply message.
    const result = await thread.generateText({ prompt })
    return { threadId, text: result.text }
  },
})

// Pick up where you left off, with the same or a different agent:
export const continueThread = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    // TODO: Implement continueThread logic with the correct agent instance
    // const { thread } = await anotherAgent.continueThread(ctx, { threadId })
    // This includes previous message history from the thread automatically.
    // const result = await thread.generateText({ prompt })
    // return result.text
    throw new Error("continueThread not implemented")
  },
})

export const getAgentsForCurrentUser = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return []
    // Assuming agents are stored in the 'agents' table with a userId field
    return await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .paginate(args.paginationOpts)
  },
})

export const createAgent = mutation({
  args: {
    name: v.string(),
    taskId: v.optional(v.id("tasks")),
    connections: v.optional(v.array(v.string())),
    canvasPosition: v.object({ x: v.number(), y: v.number() }),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const now = Date.now()
    const agentId = await ctx.db.insert("agents", {
      userId,
      name: args.name,
      taskId: args.taskId,
      connections: args.connections ?? [],
      chatHistory: [],
      canvasPosition: args.canvasPosition,
      status: "idle",
      createdAt: now,
    })
    return agentId
  },
})

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    draft: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    connections: v.optional(v.array(v.string())),
    canvasPosition: v.optional(v.object({ x: v.number(), y: v.number() })),
    status: v.optional(v.union(v.literal("idle"), v.literal("generating"), v.literal("ready"), v.literal("error"))),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const agent = await ctx.db.get(args.agentId)
    if (!agent || agent.userId !== userId) throw new Error("Not found or unauthorized")
    const patch: any = {}
    if (args.draft !== undefined) patch.draft = args.draft
    if (args.thumbnailUrl !== undefined) patch.thumbnailUrl = args.thumbnailUrl
    if (args.thumbnailStorageId !== undefined) patch.thumbnailStorageId = args.thumbnailStorageId
    if (args.connections !== undefined) patch.connections = args.connections
    if (args.canvasPosition !== undefined) patch.canvasPosition = args.canvasPosition
    if (args.status !== undefined) patch.status = args.status
    await ctx.db.patch(args.agentId, patch)
    return true
  },
})

// Mutation to delete an agent
export const deleteAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const agent = await ctx.db.get(args.agentId)
    if (!agent || agent.userId !== userId) throw new Error("Not found or unauthorized")
    await ctx.db.delete(args.agentId)
    return true
  },
})
