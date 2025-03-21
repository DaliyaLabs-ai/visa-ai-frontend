"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth, type User, type UserType } from "@/hooks/use-auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, name: string, userType: UserType) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (updates: Partial<User>) => User | undefined
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

