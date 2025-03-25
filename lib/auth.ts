import type { StoredUserData } from '@/types/auth'

export const auth = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },

  getUser: (): StoredUserData | null => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  },

  setUser: (userData: StoredUserData) => {
    localStorage.setItem('user', JSON.stringify(userData))
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  isEmailVerified: () => {
    const user = auth.getUser()
    return user?.isVerified ?? false
  }
} 