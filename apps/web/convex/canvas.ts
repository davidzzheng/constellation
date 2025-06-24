import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

export const saveState = mutation({
  args: {
    taskId: v.id("tasks"),
    nodes: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        position: v.object({
          x: v.number(),
          y: v.number(),
        }),
        data: v.any(),
      }),
    ),
    edges: v.array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
        sourceHandle: v.optional(v.string()),
        targetHandle: v.optional(v.string()),
      }),
    ),
    viewport: v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    // Fetch org/team ID from user metadata (fallback to userId if not present)
    // Use 'as any' to access possible org/team fields for plugin compatibility
    const userMetadata = await betterAuthComponent.getAuthUser(ctx)
    const organizationId =
      (userMetadata as any)?.organization ||
      (userMetadata as any)?.organizationId ||
      (userMetadata as any)?.orgId ||
      (userMetadata as any)?.teamId ||
      userId

    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized")
    }

    const viewport = args.viewport
    const validatedViewport = {
      x: Number.isFinite(viewport.x) ? viewport.x : 0,
      y: Number.isFinite(viewport.y) ? viewport.y : 0,
      zoom: Number.isFinite(viewport.zoom) && viewport.zoom > 0 ? viewport.zoom : 1,
    }

    // Only one .withIndex per query; filter for taskId in JS
    const existing = await ctx.db
      .query("canvases")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect()
    const match = existing.find((c) => c.taskId === args.taskId)

    if (match) {
      await ctx.db.patch(match._id, {
        nodes: args.nodes,
        edges: args.edges,
        viewport: validatedViewport,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("canvases", {
        userId,
        organizationId,
        taskId: args.taskId,
        nodes: args.nodes,
        edges: args.edges,
        viewport: validatedViewport,
        updatedAt: Date.now(),
      })
    }
  },
})

export const getState = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) return null

    // Fetch org/team ID from user metadata (fallback to userId if not present)
    const userMetadata = await betterAuthComponent.getAuthUser(ctx)
    const orgId =
      (userMetadata as any)?.organization ||
      (userMetadata as any)?.organizationId ||
      (userMetadata as any)?.orgId ||
      (userMetadata as any)?.teamId ||
      userId

    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      return null
    }

    // Only one .withIndex per query; filter for taskId in JS
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .collect()
    return canvases.find((c) => c.taskId === args.taskId) || null
  },
})

export const clearState = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) throw new Error("Unauthorized")

    // Fetch org/team ID from user metadata (fallback to userId if not present)
    const userMetadata = await betterAuthComponent.getAuthUser(ctx)
    const orgId =
      (userMetadata as any)?.organization ||
      (userMetadata as any)?.organizationId ||
      (userMetadata as any)?.orgId ||
      (userMetadata as any)?.teamId ||
      userId

    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized")
    }

    // Only one .withIndex per query; filter for taskId in JS
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
      .collect()
    const match = canvases.find((c) => c.taskId === args.taskId)

    if (match) {
      await ctx.db.delete(match._id)
    }
  },
})
