"use client"

import { createContext, useContext, type ReactNode } from "react"
import { auth } from "@/lib/auth"
import type { User } from "@/types/auth"
import { useAuth } from "@/hooks/use-auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, name: string, userType: "student" | "consultancy") => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (updates: Partial<User>) => User | undefined
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, signup, login, updateUser, isAuthenticated } = useAuth()

  const logout = () => {
    auth.clearAuth() // Using the auth utility's clearAuth method
    updateUser(null) // Update the auth context state
  }

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

