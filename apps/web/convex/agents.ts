import { Agent, createTool } from "@convex-dev/agent"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { getPage } from "convex-helpers/server/pagination"
import { createOllama } from "ollama-ai-provider"
import { z } from "zod"
import { api, components } from "./_generated/api"
import { action, mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"
import schema from "./schema"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const ollama = createOllama()

const superAgent = new Agent(components.agent, {
  chat: openrouter.chat("deepseek/deepseek-r1-0528-qwen3-8b:free"),
  textEmbedding: ollama.embedding("bge-m3"),
  instructions:
    "You are an assistant that can create, manage, and coordinate other agents. " +
    "You can search for agents that can complete a certain task, or create new ones if none fit the task. " +
    "Split up tasks so that the created agents can be iterated upon and reused for future tasks. " +
    "Over time you should take feedback on how to categorize and optimize tasks by merging them. " +
    "Be willing to undo mistakes and get better. When in doubt, create a single agent to handle the task. " +
    "When passing IDs, you MUST pass a real ID verbatim. " +
    "agentId is for the reusable agent, and taskId is for tasks, and threadId is for the thread that is used within a task. " +
    "If you don't have an ID, search for one first.",
  contextOptions: {
    recentMessages: 20,
    searchOtherThreads: true,
    excludeToolMessages: false,
  },
  maxSteps: 10,
})

const taskTriageAgent = new Agent(components.agent, {
  chat: openrouter.chat("deepseek/deepseek-r1-0528-qwen3-8b:free"),
  textEmbedding: ollama.embedding("bge-m3"),
  instructions:
    "You are an assistant that can create, manage, and coordinate other agents. " +
    "You can search for agents that can complete a certain task, or create new ones if none fit the task. " +
    "Split up tasks so that the created agents can be iterated upon and reused for future tasks. " +
    "Over time you should take feedback on how to categorize and optimize tasks by merging them. " +
    "Be willing to undo mistakes and get better. When in doubt, create a single agent to handle the task. " +
    "When passing IDs, you MUST pass a real ID verbatim. " +
    "agentId is for the reusable agent, and taskId is for tasks, and threadId is for the thread that is used within a task. " +
    "If you don't have an ID, search for one first.",
  contextOptions: {
    recentMessages: 20,
    searchOtherThreads: true,
  },
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
    const result = await thread.generateText({ prompt })
    return { threadId, text: result.text }
  },
})

export const continueThread = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    const { thread } = await superAgent.continueThread(ctx, { threadId })
    const result = await thread.generateText({ prompt })
    return result.text
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

export const getMostRecentAgents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 5)
  },
})

export const getAgentsPage = query({
  args: {
    pageSize: v.number(),
    order: v.union(v.literal("asc"), v.literal("desc")),
    index: v.union(
      v.literal("by_user"),
      v.literal("by_task"),
      v.literal("by_status"),
      v.literal("by_updated"),
      v.literal("by_archived"),
    ),
    endIndexKey: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return getPage(ctx, { table: "agents", schema, ...args })
  },
})

export const createAgent = mutation({
  args: {
    name: v.string(),
    prompt: v.string(),
    taskId: v.optional(v.id("tasks")),
    connections: v.optional(v.array(v.string())),
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
      status: "idle",
      isArchived: false,
      updatedAt: now,
    })
    return agentId
  },
})

export const getAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId)
    if (!agent) throw new Error("Agent not found")
    return agent
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

export const queryAgents = mutation({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    console.log(userId, args)
    return await ctx.db
      .query("agents")
      .withSearchIndex("search_name", (q) => q.search("name", args.query).eq("userId", userId))
      .take(10)
  },
})
