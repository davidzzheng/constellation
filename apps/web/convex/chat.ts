import { openai } from "@ai-sdk/openai"
import {
  ChunkAppender,
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming"
import { v } from "convex/values"
import { components, internal } from "./_generated/api"
import { httpAction, mutation, query } from "./_generated/server"
import { streamingComponent } from "./streaming"

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming)

// export const createChat = mutation({
//   args: {
//     prompt: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const streamId = await persistentTextStreaming.createStream(ctx)
//     const chatId = await ctx.db.insert("chats", {
//       title: "...",
//       prompt: args.prompt,
//       stream: streamId,
//     })
//     return chatId
//   },
// })
//
// // Create a query that returns the chat body.
// export const getChatBody = query({
//   args: {
//     streamId: StreamIdValidator,
//   },
//   handler: async (ctx, args) => {
//     return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId)
//   },
// })
//
// export const streamChat = httpAction(async (ctx, request) => {
//   const body = (await request.json()) as {
//     streamId: string
//   }
//
//   // Start streaming and persisting at the same time while
//   // we immediately return a streaming response to the client
//   const response = await streamingComponent.stream(
//     ctx,
//     request,
//     body.streamId as StreamId,
//     async (ctx, request, streamId, append) => {
//       // Lets grab the history up to now so that the AI has some context
//       const history = await ctx.runQuery(internal.messages.getHistory)
//
//       // Lets kickoff a stream request to OpenAI
//       const stream = await openai.chat.completions.create({
//         model: "gpt-4.1-mini",
//         messages: [
//           {
//             role: "system",
//             content: `You are a helpful assistant that can answer questions and help with tasks.
//           Please provide your response in markdown format.
//
//           You are continuing a conversation. The conversation so far is found in the following JSON-formatted value:`,
//           },
//           ...history,
//         ],
//         stream: true,
//       })
//
//       // Append each chunk to the persistent stream as they come in from openai
//       for await (const part of stream) await append(part.choices[0]?.delta?.content || "")
//     },
//   )
//
//   response.headers.set("Access-Control-Allow-Origin", "*")
//   response.headers.set("Vary", "Origin")
//
//   return response
// })
