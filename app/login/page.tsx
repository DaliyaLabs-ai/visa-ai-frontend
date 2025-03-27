"use client"

import type React from "react"

import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { login, forgotPassword, resetPassword } from "@/lib/api-client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { LoginError, StoredUserData } from '@/types/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [hasExistingOtp, setHasExistingOtp] = useState(false);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);

    try {
      await forgotPassword(forgotEmail);
      setIsOtpSent(true);
    } catch (err) {
      setResetError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);

    try {
      await resetPassword(forgotEmail, otp, newPassword);
      setShowForgotPassword(false);
      setIsOtpSent(false);
      setResetError(null);
      // Clear the form
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setResetError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const toggleOtpMode = () => {
    setIsOtpSent(hasExistingOtp);
    setHasExistingOtp(!hasExistingOtp);
    setResetError(null);
  };

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
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </button>
                <p>
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {!isOtpSent 
                ? "Enter your email to receive a password reset code."
                : "Enter the OTP sent to your email and your new password."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={!isOtpSent ? handleForgotPassword : handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleOtpMode}
                  className="text-sm text-primary hover:underline"
                >
                  {hasExistingOtp 
                    ? "Request new OTP instead?" 
                    : "Already have an OTP?"
                  }
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isOtpSent}
                />
              </div>

              {(isOtpSent || hasExistingOtp) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {resetError && (
                <p className="text-sm text-destructive">{resetError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setIsOtpSent(false);
                  setHasExistingOtp(false);
                  setResetError(null);
                  setForgotEmail("");
                  setOtp("");
                  setNewPassword("");
                }}
              >
                Cancel
              </Button>
              {hasExistingOtp ? (
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Resetting..." : "Reset Password"}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isResetting}
                >
                  {isResetting 
                    ? "Processing..." 
                    : !isOtpSent 
                      ? "Send OTP" 
                      : "Reset Password"
                  }
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

