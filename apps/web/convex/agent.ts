import { openai } from "@ai-sdk/openai"
import { Agent } from "@convex-dev/agent"
import { v } from "convex/values"
import { components } from "./_generated/api"
import { action, mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

const supportAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o-mini"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: "You are a helpful assistant.",
})

// Use the agent from within a normal action:
export const createThreadAndPrompt = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      return null
    }
    const { threadId, thread } = await supportAgent.createThread(ctx, {
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

// Public query to fetch all agents for the current user
export const getAgentsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return []
    // Assuming agents are stored in the 'agents' table with a userId field
    return await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  },
})

// Mutation to create a new agent
export const createAgent = mutation({
  args: {
    videoId: v.id("videos"),
    type: v.union(v.literal("title"), v.literal("description"), v.literal("thumbnail"), v.literal("tweets")),
    draft: v.string(),
    thumbnailUrl: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    connections: v.optional(v.array(v.string())),
    canvasPosition: v.object({ x: v.number(), y: v.number() }),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const now = Date.now()
    const agentId = await ctx.db.insert("agents", {
      videoId: args.videoId,
      userId,
      type: args.type,
      draft: args.draft,
      thumbnailUrl: args.thumbnailUrl,
      thumbnailStorageId: args.thumbnailStorageId,
      connections: args.connections ?? [],
      chatHistory: [],
      canvasPosition: args.canvasPosition,
      status: "idle",
      createdAt: now,
    })
    return agentId
  },
})

// Mutation to update an agent
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
