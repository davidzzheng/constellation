import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loader2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Container } from "~/components/container"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { authClient } from "~/lib/auth-client"
import { convertImageToBase64 } from "~/lib/image"

function SignUp() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignUp = async () => {
    await authClient.signUp.email(
      {
        email,
        password,
        name: `${firstName} ${lastName}`,
        image: image ? await convertImageToBase64(image) : "",
      },
      {
        onRequest: () => {
          setLoading(true)
        },
        onSuccess: async () => {
          setLoading(false)
          await navigate({ to: "/app" })
        },
        onError: async (ctx) => {
          setLoading(false)
          console.error(ctx.error)
          console.error("response", ctx.response)
          toast.error(ctx.error.message)
        },
      },
    )
  }

  return (
    <Container className="my-8 md:my-32">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
          <CardDescription className="text-xs md:text-sm">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Max"
                  required
                  onChange={(e) => {
                    setFirstName(e.target.value)
                  }}
                  value={firstName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Robinson"
                  required
                  onChange={(e) => {
                    setLastName(e.target.value)
                  }}
                  value={lastName}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                autoComplete="new-password"
                placeholder="Confirm Password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Profile Image (optional)</Label>
              <div className="flex items-end gap-4">
                {imagePreview && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                    <img src={imagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex w-full items-center gap-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                  {imagePreview && (
                    <X
                      className="cursor-pointer"
                      onClick={() => {
                        setImage(null)
                        setImagePreview(null)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading} onClick={handleSignUp}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Create an account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-neutral-600 text-sm dark:text-neutral-400">
        Already have an account?{" "}
        <Button variant="link" asChild className="px-0.5">
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </p>
    </Container>
  )
}

export const Route = createFileRoute("/(auth)/sign-up")({
  component: SignUp,
})
