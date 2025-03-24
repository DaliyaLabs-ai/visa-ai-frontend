"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthContext } from "@/contexts/auth-context"
import { useCallback } from "react"

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthContext()

  const navigateToLogin = useCallback(() => {
    router.push("/login")
  }, [router])

  const navigateToSignup = useCallback(() => {
    router.push("/signup")
  }, [router])

  const navigateToHome = useCallback(() => {
    router.push("/")
  }, [router])

  const navigateToDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const navigateToOnboarding = useCallback(() => {
    router.push("/onboarding")
  }, [router])

  const navigateToConsultancyOnboarding = useCallback(() => {
    router.push("/consultancy-onboarding")
  }, [router])

  const handleAuthRedirect = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.userType === "student" && !user.isOnboarded) {
      router.push("/onboarding")
      return
    }

    if (user?.userType === "consultancy" && !user.isOnboarded) {
      router.push("/consultancy-onboarding")
      return
    }

    router.push("/dashboard")
  }, [isAuthenticated, router, user])

  return {
    navigateToLogin,
    navigateToSignup,
    navigateToHome,
    navigateToDashboard,
    navigateToOnboarding,
    navigateToConsultancyOnboarding,
    handleAuthRedirect,
    currentPath: pathname,
  }
}

