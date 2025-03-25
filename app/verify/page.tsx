"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface VerifyFormValues {
  email: string
  otp: string
}

interface VerifyError {
  success: false
  message: string
  timestamp: string
  status: number
  description?: {
    message: string[]
    error: string
    statusCode: number
  }
}

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const initialValues: VerifyFormValues = {
    email: searchParams.get("email") || "",
    otp: "",
  }

  const validationRules = {
    email: (value: string) => {
      if (!value.trim()) return "Email is required"
      if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid"
      return null
    },
    otp: (value: string) => {
      if (!value.trim()) return "OTP is required"
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
    setSuccess(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.values.email,
          otp: form.values.otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw data
      }

      setSuccess("Account verified successfully! You can now login.")
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const apiError = err as VerifyError
      setError(apiError.description?.message?.[0] || apiError.message || "Failed to verify account. Please try again.")
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
            <CardTitle>Verify Your Account</CardTitle>
            <CardDescription>Enter the OTP sent to your email to verify your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.values.email}
                  onChange={(e) => form.handleChange("email", e.target.value)}
                  onBlur={() => form.handleBlur("email")}
                  placeholder="Enter your email"
                  disabled={!!searchParams.get("email")}
                />
                {form.touched.email && form.errors.email && (
                  <p className="text-sm text-destructive">{form.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={form.values.otp}
                  onChange={(e) => form.handleChange("otp", e.target.value)}
                  onBlur={() => form.handleBlur("otp")}
                  placeholder="Enter OTP"
                />
                {form.touched.otp && form.errors.otp && (
                  <p className="text-sm text-destructive">{form.errors.otp}</p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify Account"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
} 