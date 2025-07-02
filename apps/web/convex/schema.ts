import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  users: defineTable({
    email: v.string(),
  }).index("email", ["email"]),

  presence: defineTable({
    userId: v.id("users"),
    taskId: v.id("tasks"),
    lastUpdated: v.number(),
    cursorPosition: v.object({
      x: v.number(),
      y: v.number(),
    }),
  })
    .index("by_task", ["taskId"])
    .index("by_user_and_task", ["userId", "taskId"])
    .index("by_task_and_lastUpdated", ["taskId", "lastUpdated"]),

  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
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
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"])
    .index("by_archived", ["isArchived"]),

  agents: defineTable({
    userId: v.string(),
    taskId: v.optional(v.id("tasks")),
    name: v.string(),
    connections: v.array(v.string()),
    chatHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("ai")),
        message: v.string(),
        timestamp: v.number(),
      }),
    ),
    metadata: v.optional(v.any()),
    status: v.union(v.literal("idle"), v.literal("generating"), v.literal("ready"), v.literal("error")),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_status", ["status"])
    .index("by_updated", ["updatedAt"])
    .index("by_archived", ["isArchived"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),
})

export default schema
