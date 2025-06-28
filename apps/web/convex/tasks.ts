import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { getPage } from "convex-helpers/server/pagination"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"
import schema from "./schema"

export const getTasksForCurrentUser = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .paginate(args.paginationOpts)
  },
})

export const getTasksPage = query({
  args: {
    pageSize: v.number(),
    order: v.union(v.literal("asc"), v.literal("desc")),
    index: v.union(v.literal("by_user"), v.literal("by_created"), v.literal("by_updated"), v.literal("by_archived")),
    endIndexKey: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return getPage(ctx, { table: "tasks", schema, ...args })
  },
})

export const getMostRecentTasks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 5)
  },
})

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const now = Date.now()
    const taskId = await ctx.db.insert("tasks", {
      userId,
      title: args.title,
      description: args.description,
      updatedAt: now,
      isArchived: false,
      edges: [],
      nodes: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    })
    return taskId
  },
})

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const task = await ctx.db.get(args.taskId)
    if (!task) throw new Error("Task not found")
    if (task.userId !== userId) throw new Error("Unauthorized")
    return task
  },
})

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    edges: v.optional(v.array(v.object({ id: v.string(), source: v.string(), target: v.string() }))),
    nodes: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          position: v.object({ x: v.number(), y: v.number() }),
        }),
      ),
    ),
    viewport: v.optional(v.object({ x: v.number(), y: v.number(), zoom: v.number() })),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const task = await ctx.db.get(args.taskId)
    if (!task) throw new Error("Task not found")
    if (task.userId !== userId) throw new Error("Unauthorized")
    const patch: any = { updatedAt: Date.now() }
    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.edges !== undefined) patch.edges = args.edges
    if (args.nodes !== undefined) patch.nodes = args.nodes
    if (args.viewport !== undefined) patch.viewport = args.viewport
    if (args.isArchived !== undefined) patch.isArchived = args.isArchived
    await ctx.db.patch(args.taskId, patch)
    return true
  },
})

// Mutation to delete a task
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const task = await ctx.db.get(args.taskId)
    if (!task) throw new Error("Task not found")
    if (task.userId !== userId) throw new Error("Unauthorized")
    await ctx.db.delete(args.taskId)
    return true
  },
})
