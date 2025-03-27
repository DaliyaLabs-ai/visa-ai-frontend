"use client"

import { type ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { VapiProvider } from "@/contexts/vapi-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <VapiProvider>
          {children}
        </VapiProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 