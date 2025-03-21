"use client"

import type React from "react"

import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserType } from "@/hooks/use-auth"

interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: UserType
}

export default function SignupPage() {
  const { signup } = useAuthContext()
  const { handleAuthRedirect } = useNavigation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialValues: SignupFormValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
  }

  const validationRules = {
    name: (value: string) => (value.trim() ? null : "Name is required"),
    email: (value: string) => {
      if (!value.trim()) return "Email is required"
      if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid"
      return null
    },
    password: (value: string) => {
      if (!value) return "Password is required"
      if (value.length < 6) return "Password must be at least 6 characters"
      return null
    },
    confirmPassword: (value: string) => {
      if (!value) return "Please confirm your password"
      if (value !== form.values.password) return "Passwords do not match"
      return null
    },
    userType: (value: UserType) => (value ? null : "Please select a user type"),
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
      await signup(form.values.email, form.values.password, form.values.name, form.values.userType)

      handleAuthRedirect()
    } catch (err) {
      setError("Failed to sign up. Please try again.")
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
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create an account to get started with F1 Visa Prep</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.values.name}
                  onChange={(e) => form.handleChange("name", e.target.value)}
                  onBlur={() => form.handleBlur("name")}
                  placeholder="Enter your name"
                />
                {form.touched.name && form.errors.name && (
                  <p className="text-sm text-destructive">{form.errors.name}</p>
                )}
              </div>

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
                  placeholder="Create a password"
                />
                {form.touched.password && form.errors.password && (
                  <p className="text-sm text-destructive">{form.errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.values.confirmPassword}
                  onChange={(e) => form.handleChange("confirmPassword", e.target.value)}
                  onBlur={() => form.handleBlur("confirmPassword")}
                  placeholder="Confirm your password"
                />
                {form.touched.confirmPassword && form.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  value={form.values.userType}
                  onValueChange={(value) => form.handleChange("userType", value as UserType)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultancy" id="consultancy" />
                    <Label htmlFor="consultancy" className="cursor-pointer">
                      Consultancy
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

