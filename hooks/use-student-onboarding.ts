"use client"

import { useState } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { submitStudentProfile } from '@/lib/api-client'
import type { StudentProfileData } from '@/types/profile'
import { Gender } from '@/types/profile'

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
  gender: Gender
  dob: string
}

export function useStudentOnboarding() {
  const { user, updateUser } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitOnboarding = async (profile: StudentProfile) => {

    // if (!user || user.userType !== "student") {
    //   setError("Only students can complete this onboarding")
    //   return
    // }

    setLoading(true)
    setError(null)


    try {
      // Transform the profile data to match API requirements
      const profileData: StudentProfileData = {
        college: profile.academicProfile.college,
        highSchoolName: profile.academicProfile.highSchoolName,
        highSchoolGraduationYear: new Date(profile.academicProfile.graduationYear).toISOString(),
        highSchoolGpa: parseFloat(profile.academicProfile.highSchoolGPA),
        satTotalScore: profile.satScore.total,
        satMathRank: profile.satScore.math,
        satVerbalScore: profile.satScore.verbal,
        satEnglishProficiencyScores: parseInt(profile.englishProficiency) || 0,
        projectsAndSkills: profile.projectsAndSkills,
        financialSituation: profile.financialSituation,
        gender: profile.gender,
        dob: profile.dob,
      }

      console.log("profileData: ", profileData);

      // Submit to API
      await submitStudentProfile(profileData)

      // Update user as onboarded
      updateUser({ isOnboarded: true })

      return true
    } catch (err) {
      console.log("error here: ", err);
      const error = err as any
      setError(error?.description?.message?.[0] || error?.message || "Failed to save profile. Please try again.")
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

