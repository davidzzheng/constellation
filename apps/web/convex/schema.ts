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
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"])
    .index("by_user_archived", ["userId", "isArchived"]),

  agents: defineTable({
    userId: v.string(),
    taskId: v.optional(v.id("tasks")),
    name: v.string(),
    connections: v.array(v.string()),
    canvasPosition: v.object({
      x: v.number(),
      y: v.number(),
    }),
    chatHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("ai")),
        message: v.string(),
        timestamp: v.number(),
      }),
    ),
    metadata: v.optional(v.any()),
    status: v.union(v.literal("idle"), v.literal("generating"), v.literal("ready"), v.literal("error")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"]),

  canvases: defineTable({
    userId: v.string(),
    organizationId: v.optional(v.string()),
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
