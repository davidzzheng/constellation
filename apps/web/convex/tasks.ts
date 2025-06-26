import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

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
      createdAt: now,
      updatedAt: now,
      isArchived: false,
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
    thumbnail: v.optional(v.string()),
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
    if (args.thumbnail !== undefined) patch.thumbnail = args.thumbnail
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
