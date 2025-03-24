"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { useConsultancyOnboarding, type ConsultancyProfile } from "@/hooks/use-consultancy-onboarding"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConsultancyOnboardingPage() {
  const { user } = useAuthContext()
  const { navigateToDashboard } = useNavigation()
  const { submitOnboarding } = useConsultancyOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (user && user.userType === "consultancy" && !user.isOnboarded) {
      setShouldRender(true)
    } else {
      navigateToDashboard()
    }
  }, [user, navigateToDashboard])

  const initialValues: ConsultancyProfile = {
    name: "",
    phoneNumber: "",
    address: "",
    description: "",
  }

  const validationRules = {
    name: (value: string) => (value ? null : "Consultancy name is required"),
    phoneNumber: (value: string) => (value ? null : "Phone number is required"),
    address: (value: string) => (value ? null : "Address is required"),
    description: (value: string) => (value ? null : "Description is required"),
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
      const success = await submitOnboarding(form.values)
      if (success) {
        navigateToDashboard()
      }
    } catch (err) {
      setError("Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Consultancy Profile</CardTitle>
              <CardDescription>We need some information about your consultancy to help students better</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Consultancy Name</Label>
                    <Input
                      id="name"
                      value={form.values.name}
                      onChange={(e) => form.handleChange("name", e.target.value)}
                      onBlur={() => form.handleBlur("name")}
                      placeholder="Enter your consultancy name"
                    />
                    {form.touched.name && form.errors.name && (
                      <p className="text-sm text-destructive">{form.errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={form.values.phoneNumber}
                      onChange={(e) => form.handleChange("phoneNumber", e.target.value)}
                      onBlur={() => form.handleBlur("phoneNumber")}
                      placeholder="Enter your phone number"
                    />
                    {form.touched.phoneNumber && form.errors.phoneNumber && (
                      <p className="text-sm text-destructive">{form.errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      id="address"
                      value={form.values.address}
                      onChange={(e) => form.handleChange("address", e.target.value)}
                      onBlur={() => form.handleBlur("address")}
                      placeholder="Enter your consultancy address"
                    />
                    {form.touched.address && form.errors.address && (
                      <p className="text-sm text-destructive">{form.errors.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      id="description"
                      value={form.values.description}
                      onChange={(e) => form.handleChange("description", e.target.value)}
                      onBlur={() => form.handleBlur("description")}
                      placeholder="Describe your consultancy and services"
                      rows={4}
                    />
                    {form.touched.description && form.errors.description && (
                      <p className="text-sm text-destructive">{form.errors.description}</p>
                    )}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
} 