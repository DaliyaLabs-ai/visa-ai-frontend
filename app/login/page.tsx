"use client"

import type React from "react"

import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { login } from "@/lib/api-client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { LoginError, StoredUserData } from '@/types/auth'

interface LoginFormValues {
  email: string
  password: string
}

interface LoginResponse {
  success: true
  source: string
  data: {
    accessToken: string
    refreshToken: string
    existingUser: {
      userId: string
      createdAt: string
      isActive: boolean
      id: number
      email: string
      fullName: string
      email_verified: boolean
      email_verified_at: string | null
      blocked: boolean
      provider: string | null
      blocked_reason: string | null
      profile: any | null
      roles: string[]
    }
  }
  timestamp: string
  message: string
  status: number
}

export default function LoginPage() {
  const { login: loginContext } = useAuthContext()
  const { handleAuthRedirect } = useNavigation()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  }

  const validationRules = {
    email: (value: string) => {
      if (!value.trim()) return "Email is required"
      if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid"
      return null
    },
    password: (value: string) => {
      if (!value) return "Password is required"
      return null
    },
  }

  const form = useFormValidation(initialValues, validationRules)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.validateAll()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await login({
        email: form.values.email,
        password: form.values.password,
      })

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      const userData = {
        id: response.data.existingUser.userId,
        email: response.data.existingUser.email,
        name: response.data.existingUser.fullName,
        isActive: response.data.existingUser.isActive,
        isVerified: response.data.existingUser.email_verified,
        roles: response.data.existingUser.roles,
        profile: response.data.existingUser.profile
      }
      localStorage.setItem('user', JSON.stringify(userData))

      // Update auth context
      await loginContext(form.values.email, form.values.password)

      // Handle redirects based on user status
      if (!response.data.existingUser.isActive) {
        router.push(`/verify?email=${response.data.existingUser.email}`)
        return
      }

      // Redirect to onboarding if profile is null or isActive is false
      if (!response.data.existingUser.profile) {
        router.push('/onboarding')
        return
      }

      handleAuthRedirect()
    } catch (err) {
      // Handle both error formats (with and without description)
      if (err && typeof err === 'object') {
        const apiError = err as LoginError
        if (apiError.description) {
          // Handle validation errors
          setError(apiError.description.message?.[0] || apiError.message)
        } else {
          // Handle other errors like inactive account
          setError(apiError.message || "Failed to log in. Please try again.")
        }
      } else {
        setError("Failed to log in. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to your F1 Visa Prep account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.values.email}
                  onChange={(e) => form.handleChange("email", e.target.value)}
                  onBlur={() => form.handleBlur("email")}
                  placeholder="Enter your email"
                />
                {form.touched.email && form.errors.email && (
                  <p className="text-sm text-destructive">{form.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.values.password}
                  onChange={(e) => form.handleChange("password", e.target.value)}
                  onBlur={() => form.handleBlur("password")}
                  placeholder="Enter your password"
                />
                {form.touched.password && form.errors.password && (
                  <p className="text-sm text-destructive">{form.errors.password}</p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

