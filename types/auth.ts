export interface RegisterData {
  email: string
  password: string
  password2: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginError {
  success: false
  message: string
  timestamp: string
  status: number
  description?: {
    message: string[]
    error: string
    statusCode: number
  }
}

export type UserType = "consultancy" | "student"
export interface User {
  userId: string
  createdAt: string
  isActive: boolean
  id: number
  email: string
  fullName: string
  email_verified: boolean
  email_verified_at: string | null
  blocked: boolean
  provider: string | null
  blocked_reason: string | null
  profile: any | null
  roles: string[]
  userType: UserType;
  isOnboarded: boolean;
}

export interface LoginResponse {
  success: true
  source: string
  data: {
    accessToken: string
    refreshToken: string
    existingUser: User
  }
  timestamp: string
  message: string
  status: number
}

export interface StoredUserData {
  id: string
  email: string
  name: string
  isActive: boolean
  isVerified: boolean
  roles: string[]
  profile: any | null
} 