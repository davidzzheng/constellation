import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { betterAuthComponent } from "./auth"

export const updatePresence = mutation({
  args: {
    taskId: v.id("tasks"),
    cursorPosition: v.object({
      x: v.number(),
      y: v.number(),
    }),
    isHeartbeat: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const now = Date.now()
    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_user_and_task", (q) => q.eq("userId", userId as Id<"users">).eq("taskId", args.taskId))
      .first()

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        lastUpdated: now,
        cursorPosition: args.isHeartbeat ? existingPresence.cursorPosition : args.cursorPosition,
      })
    } else {
      await ctx.db.insert("presence", {
        userId: userId as Id<"users">,
        taskId: args.taskId,
        lastUpdated: now,
        cursorPosition: args.cursorPosition,
      })
    }
  },
})

export const getActiveUsers = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const thirtySecondsAgo = Date.now() - 30000
    const activePresence = await ctx.db
      .query("presence")
      .withIndex("by_task_and_lastUpdated", (q) => q.eq("taskId", args.taskId).gte("lastUpdated", thirtySecondsAgo))
      .collect()

    const userIds = [...new Set(activePresence.map((p) => p.userId))]
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const user = await ctx.db.get(userId)
        const presence = activePresence.find((p) => p.userId === userId)
        if (user && presence) {
          return {
            _id: user._id,
            name: user.email,
            profileImageUrl: user.email,
            cursorPosition: presence.cursorPosition,
          }
        }
        return null
      }),
    )

    return users.filter((user): user is NonNullable<typeof user> => user !== null)
  },
})

export const removePresence = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const presence = await ctx.db
      .query("presence")
      .withIndex("by_user_and_task", (q) => q.eq("userId", userId as Id<"users">).eq("taskId", args.taskId))
      .first()

    if (presence) {
      await ctx.db.delete(presence._id)
    }
  },
})
