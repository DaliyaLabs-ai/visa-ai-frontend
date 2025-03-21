"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useNavigation } from "@/hooks/use-navigation"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export function RouteGuard({ children, requireAuth = false, requireOnboarding = false }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuthContext()
  const { navigateToLogin, navigateToOnboarding } = useNavigation()

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigateToLogin()
      return
    }

    if (requireOnboarding && user?.userType === "student" && !user.isOnboarded) {
      navigateToOnboarding()
      return
    }
  }, [isAuthenticated, navigateToLogin, navigateToOnboarding, requireAuth, requireOnboarding, user])

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireOnboarding && user?.userType === "student" && !user.isOnboarded) {
    return null
  }

  return <>{children}</>
}

