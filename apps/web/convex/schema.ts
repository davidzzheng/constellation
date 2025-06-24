import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  users: defineTable({
    email: v.string(),
  }).index("email", ["email"]),

  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"])
    .index("by_user_archived", ["userId", "isArchived"]),

  agents: defineTable({
    videoId: v.id("videos"),
    userId: v.string(),
    taskId: v.optional(v.id("tasks")),
    type: v.union(v.literal("title"), v.literal("description"), v.literal("thumbnail"), v.literal("tweets")),
    draft: v.string(),
    thumbnailUrl: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    connections: v.array(v.string()),
    chatHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("ai")),
        message: v.string(),
        timestamp: v.number(),
      }),
    ),
    canvasPosition: v.object({
      x: v.number(),
      y: v.number(),
    }),
    status: v.union(v.literal("idle"), v.literal("generating"), v.literal("ready"), v.literal("error")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_type", ["type"]),

  profiles: defineTable({
    userId: v.string(),
    channelName: v.string(),
    contentType: v.string(),
    niche: v.string(),
    links: v.array(v.string()),
    tone: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  canvases: defineTable({
    userId: v.string(),
    organizationId: v.string(),
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
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_task", ["taskId"]),
})

export default schema
