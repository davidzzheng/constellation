import { type AuthFunctions, BetterAuth, convexAdapter, type PublicAuthFunctions } from "@convex-dev/better-auth"
import { convex, crossDomain } from "@convex-dev/better-auth/plugins"
import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth"
import { Polar } from "@polar-sh/sdk"
import { betterAuth } from "better-auth"
import { organization } from "better-auth/plugins"
import { api, components, internal } from "./_generated/api"
import type { DataModel, Id } from "./_generated/dataModel"
import { type GenericCtx, query } from "./_generated/server"
import { sendResetPassword } from "./email"

const authFunctions: AuthFunctions = internal.auth
const publicAuthFunctions: PublicAuthFunctions = api.auth

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
})

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
})

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: process.env.BASE_URL,
    database: convexAdapter(ctx, betterAuthComponent),
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    // emailVerification: {
    //   sendVerificationEmail: async ({ user, url }) => {
    //     await sendEmailVerification({
    //       to: user.email,
    //       url,
    //     })
    //   },
    // },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword({
          to: user.email,
          url,
        })
      },
    },
    // socialProviders: {
    //   github: {
    //     clientId: process.env.GITHUB_CLIENT_ID as string,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //   },
    //   google: {
    //     clientId: process.env.GOOGLE_CLIENT_ID as string,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    //   },
    // },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      organization(),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: "5c8d2140-20c9-4638-90e2-9f90cd6a4c15",
                slug: "Constellation-Subscription",
              },
            ],
            successUrl: process.env.POLAR_SUCCESS_URL,
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET as string,
          }),
        ],
      }),
      convex({
        deleteExpiredSessionsOnLogin: true,
      }),
      crossDomain({
        siteUrl: process.env.BASE_URL as string,
      }),
    ],
    security: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
  })

export const { createUser, deleteUser, updateUser, createSession, isAuthenticated } =
  betterAuthComponent.createAuthFunctions<DataModel>({
    onCreateUser: async (ctx, user) => {
      const userId = await ctx.db.insert("users", {
        email: user.email,
      })

      return userId
    },

    onUpdateUser: async (ctx, user) => {
      const userId = user.userId as Id<"users">
      await ctx.db.patch(userId, {
        email: user.email,
      })
    },
  })

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userMetadata = await betterAuthComponent.getAuthUser(ctx)
    if (!userMetadata) {
      return null
    }
    const user = await ctx.db.get(userMetadata.userId as Id<"users">)
    return {
      ...user,
      ...userMetadata,
    }
  },
})

export const getSession = query({
  handler: async (ctx) => {
    const auth = createAuth(ctx)
    const headers = await betterAuthComponent.getHeaders(ctx)
    const session = await auth.api.getSession({
      headers,
    })
    if (!session) {
      return null
    }
    return session
  },
})
