import { createFileRoute, Link } from "@tanstack/react-router"
import { Handshake, Lock, Puzzle } from "lucide-react"
import { motion } from "motion/react"
import type { ReactElement } from "react"
import { Container } from "~/components/container"
import { StarsBackground } from "~/components/stars-background"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "~/components/ui/card"
import { GradientText } from "~/components/ui/effects/gradient-text"
import { LiquidButton } from "~/components/ui/liquid-button"
import { authClient } from "~/lib/auth-client"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = authClient.useSession()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <StarsBackground className="absolute inset-0 flex items-center justify-center rounded-xl opacity-60" />

      <div className="absolute top-0 right-0 z-10 m-6 flex gap-2">
        {session ? (
          <Button asChild variant="outline">
            <Link to="/app">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
      <Container className="z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-8 text-4xl text-white md:text-6xl"
          >
            <span className="mb-4 block font-bold">Constellation</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="block font-medium"
            >
              <GradientText text="The collaborative agentic canvas for teams" neon />
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="mb-10 text-lg text-slate-200 md:text-2xl"
          >
            Build, compose, and orchestrate AI agents and MCPs visually. Real-time, multiplayer, and organization-ready.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <LiquidButton size="lg" className="mt-2 px-8 py-4 text-lg shadow-lg">
              <Link to="/sign-up">Get Started</Link>
            </LiquidButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.7 }}
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            <FeatureCard
              icon={<Handshake />}
              title="Collaborative Canvas"
              description="Work with your team in real-time. Share, edit, and build agentic workflows together."
            />
            <FeatureCard
              icon={<Puzzle />}
              title="Composable Agents & MCPs"
              description="Drag, drop, and configure agents and MCPs visually. Compose complex automations with ease."
            />
            <FeatureCard
              icon={<Lock />}
              title="Org-Ready & Secure"
              description="Built for modern teams. Organization support, granular permissions, and secure by default."
            />
          </motion.div>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.7 }}
          className="mt-24 text-slate-400 text-sm"
        >
          &copy; {new Date().getFullYear()} Constellation. All rights reserved.
        </motion.footer>
      </Container>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: ReactElement; title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardContent>
        <div className="mb-2 flex justify-center">{icon}</div>
        <CardTitle className="mb-1 text-lg text-white">{title}</CardTitle>
        <CardDescription className="text-base text-slate-300">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
