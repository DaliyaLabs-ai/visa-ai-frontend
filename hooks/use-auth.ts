"use client"

import { useState, useEffect, useCallback } from "react"

export type UserType = "student" | "consultancy"

export interface User {
  id: string
  email: string
  name: string
  userType: UserType
  isOnboarded: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Failed to restore auth state:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string, userType: UserType) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a dummy user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        userType,
        isOnboarded: false, 
      }

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      return newUser
    } catch (err) {
      setError("Failed to sign up. Please try again.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll just check if the user exists in localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.email === email) {
          setUser(parsedUser)
          return parsedUser
        }
      }

      throw new Error("Invalid credentials")
    } catch (err) {
      setError("Invalid email or password")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!user) return

      const updatedUser = { ...user, ...updates }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      return updatedUser
    },
    [user],
  )

  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }
}

