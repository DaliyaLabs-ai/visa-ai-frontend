"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "@/lib/auth"
import type { User } from "@/types/auth"
import { useAuth } from "@/hooks/use-auth"

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, name: string, userType: "student" | "consultancy") => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (updates: Partial<User>) => User | undefined
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signup, login, updateUser, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage directly during initialization
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('accessToken')
    
    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser)
      updateUser(userData)
    }
    
    setIsLoading(false)
  }, [])

  const logout = () => {
    auth.clearAuth() // Using the auth utility's clearAuth method
    updateUser(null) // Update the auth context state
  }

  const value = {
    isAuthenticated,
    isLoading,
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

