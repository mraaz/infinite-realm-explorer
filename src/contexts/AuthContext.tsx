import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import PageLoading from '@/components/ui/page-loading'
import { useUserDataStatus, useUserSettings, useInvalidateAuthQueries } from '@/hooks/useAuthQueries'

interface User {
  sub: string
  email?: string
  name?: string
  exp: number
}

interface AuthState {
  user: User | null
  authToken: string | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  isLoggedIn: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshAuthStatus: () => Promise<void>
  // Data from React Query hooks
  hasPulseCheckData: boolean
  hasFutureSelfData: boolean
  completedFutureQuestionnaire: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    authToken: null,
    isLoading: true,
  })

  const invalidateQueries = useInvalidateAuthQueries()

  // Use React Query hooks for data fetching
  const { data: userDataStatus } = useUserDataStatus(state.authToken)
  const { data: userSettings } = useUserSettings(state.authToken)

  // Validate and decode JWT token
  const validateAndDecodeToken = useCallback((token: string): User | null => {
    try {
      const decodedUser = jwtDecode<User>(token)
      if (decodedUser.exp * 1000 <= Date.now()) {
        return null
      }
      return decodedUser
    } catch (error) {
      console.error('Token validation failed:', error)
      return null
    }
  }, [])

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('infinitelife_jwt')
      if (storedToken) {
        const decodedUser = validateAndDecodeToken(storedToken)
        if (decodedUser) {
          setState({
            user: decodedUser,
            authToken: storedToken,
            isLoading: false,
          })
        } else {
          localStorage.removeItem('infinitelife_jwt')
          setState({
            user: null,
            authToken: null,
            isLoading: false,
          })
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }
    initializeAuth()
  }, [validateAndDecodeToken])

  const login = useCallback(async (newToken: string) => {
    try {
      const decodedUser = validateAndDecodeToken(newToken)
      if (!decodedUser) {
        throw new Error('Token is expired or invalid')
      }

      localStorage.setItem('infinitelife_jwt', newToken)
      setState({
        user: decodedUser,
        authToken: newToken,
        isLoading: false,
      })
    } catch (error) {
      console.error('Login failed:', error)
      localStorage.removeItem('infinitelife_jwt')
      setState({
        user: null,
        authToken: null,
        isLoading: false,
      })
      throw error
    }
  }, [validateAndDecodeToken])

  const logout = useCallback(() => {
    localStorage.removeItem('infinitelife_jwt')
    setState({
      user: null,
      authToken: null,
      isLoading: false,
    })
    invalidateQueries()
    window.location.href = '/'
  }, [invalidateQueries])

  const refreshAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('infinitelife_jwt')
    if (token) {
      const decodedUser = validateAndDecodeToken(token)
      if (decodedUser) {
        setState({
          user: decodedUser,
          authToken: token,
          isLoading: false,
        })
      } else {
        localStorage.removeItem('infinitelife_jwt')
        setState({
          user: null,
          authToken: null,
          isLoading: false,
        })
      }
    }
  }, [validateAndDecodeToken])

  const contextValue: AuthContextType = {
    ...state,
    isLoggedIn: !!state.user,
    login,
    logout,
    refreshAuthStatus,
    // Data from React Query
    hasPulseCheckData: userDataStatus?.hasPulseCheckData ?? false,
    hasFutureSelfData: userDataStatus?.hasFutureSelfData ?? false,
    completedFutureQuestionnaire: userSettings?.completedFutureQuestionnaire ?? false,
  }

  if (state.isLoading) {
    return <PageLoading />
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}