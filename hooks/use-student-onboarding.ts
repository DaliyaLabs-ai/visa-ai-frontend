"use client"

import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"

export interface StudentProfile {
  academicProfile: {
    college: string
    highSchoolGPA: string
    highSchoolName: string
    graduationYear: string
  }
  satScore: {
    total: number
    math: number
    verbal: number
  }
  englishProficiency: string
  projectsAndSkills: string
  financialSituation: string
}

export function useStudentOnboarding() {
  const { user, updateUser } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitOnboarding = async (profile: StudentProfile) => {
    if (!user || user.userType !== "student") {
      setError("Only students can complete this onboarding")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store profile in localStorage
      localStorage.setItem(`profile-${user.id}`, JSON.stringify(profile))

      // Update user as onboarded
      updateUser({ isOnboarded: true })

      return true
    } catch (err) {
      setError("Failed to save profile. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const getProfile = (): StudentProfile | null => {
    if (!user) return null

    try {
      const storedProfile = localStorage.getItem(`profile-${user.id}`)
      return storedProfile ? JSON.parse(storedProfile) : null
    } catch (err) {
      console.error("Failed to get profile:", err)
      return null
    }
  }

  return {
    submitOnboarding,
    getProfile,
    loading,
    error,
  }
}

