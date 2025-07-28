import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react'
import PageLoading from '@/components/ui/page-loading'
import { useUserDataStatus, useUserSettings, useInvalidateAuthQueries } from '@/hooks/useAuthQueries'
import { 
  validateAndDecodeToken, 
  isTokenExpiringSoon, 
  SecureStorage, 
  SessionMonitor 
} from '@/utils/tokenSecurity'
import { refreshAuthToken } from '@/services/apiService'
import { useToast } from '@/hooks/use-toast'

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
  forceTokenRefresh: () => Promise<void>
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
  const { toast } = useToast()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const previousTokenRef = useRef<string>()

  // Use React Query hooks for data fetching
  const { data: userDataStatus } = useUserDataStatus(state.authToken)
  const { data: userSettings } = useUserSettings(state.authToken)

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback((token: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const checkAndRefresh = async () => {
      if (isTokenExpiringSoon(token)) {
        try {
          const newToken = await refreshAuthToken(token)
          
          // Check for suspicious activity
          if (previousTokenRef.current && SessionMonitor.detectAnomalies(newToken, previousTokenRef.current)) {
            SessionMonitor.logSecurityEvent('Suspicious token refresh detected')
            logout()
            return
          }

          SecureStorage.setToken(newToken)
          const decodedUser = validateAndDecodeToken(newToken)
          
          if (decodedUser) {
            setState(prev => ({
              ...prev,
              user: decodedUser,
              authToken: newToken,
            }))
            previousTokenRef.current = newToken
            setupTokenRefresh(newToken) // Setup next refresh
            SessionMonitor.logSecurityEvent('Token refreshed successfully')
          }
        } catch (error) {
          console.error('Automatic token refresh failed:', error)
          SessionMonitor.logSecurityEvent('Token refresh failed', { error: error.message })
          // Don't logout immediately - let user continue with current token
          toast({
            title: "Session Warning",
            description: "Your session will expire soon. Please save your work.",
            variant: "destructive",
          })
        }
      }
    }

    // Check token expiry every minute
    refreshTimeoutRef.current = setTimeout(() => {
      checkAndRefresh()
      // Setup recurring check
      const interval = setInterval(checkAndRefresh, 60000) // Every minute
      return () => clearInterval(interval)
    }, 60000)
  }, [toast])

  // Force token refresh function
  const forceTokenRefresh = useCallback(async () => {
    if (!state.authToken) {
      throw new Error('No token available for refresh')
    }

    try {
      const newToken = await refreshAuthToken(state.authToken)
      SecureStorage.setToken(newToken)
      const decodedUser = validateAndDecodeToken(newToken)
      
      if (decodedUser) {
        setState(prev => ({
          ...prev,
          user: decodedUser,
          authToken: newToken,
        }))
        setupTokenRefresh(newToken)
        SessionMonitor.logSecurityEvent('Manual token refresh successful')
        toast({
          title: "Session Refreshed",
          description: "Your session has been successfully renewed.",
        })
      }
    } catch (error) {
      console.error('Manual token refresh failed:', error)
      SessionMonitor.logSecurityEvent('Manual token refresh failed', { error: error.message })
      throw error
    }
  }, [state.authToken, setupTokenRefresh, toast])

  // Initialize auth state from secure storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = SecureStorage.getToken()
        if (storedToken) {
          const decodedUser = validateAndDecodeToken(storedToken)
          if (decodedUser) {
            setState({
              user: decodedUser,
              authToken: storedToken,
              isLoading: false,
            })
            previousTokenRef.current = storedToken
            setupTokenRefresh(storedToken)
            SessionMonitor.logSecurityEvent('User session restored from storage')
          } else {
            SecureStorage.removeToken()
            setState({
              user: null,
              authToken: null,
              isLoading: false,
            })
            SessionMonitor.logSecurityEvent('Invalid token removed from storage')
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        SecureStorage.clearAll()
        setState({
          user: null,
          authToken: null,
          isLoading: false,
        })
      }
    }
    initializeAuth()
  }, [setupTokenRefresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  const login = useCallback(async (newToken: string) => {
    try {
      const decodedUser = validateAndDecodeToken(newToken)
      if (!decodedUser) {
        throw new Error('Token is expired or invalid')
      }

      // Check for suspicious activity if we have a previous token
      if (previousTokenRef.current && SessionMonitor.detectAnomalies(newToken, previousTokenRef.current)) {
        SessionMonitor.logSecurityEvent('Suspicious login attempt detected')
        throw new Error('Security check failed')
      }

      SecureStorage.setToken(newToken)
      setState({
        user: decodedUser,
        authToken: newToken,
        isLoading: false,
      })
      
      previousTokenRef.current = newToken
      setupTokenRefresh(newToken)
      SessionMonitor.logSecurityEvent('User login successful', { userId: decodedUser.sub })
    } catch (error) {
      console.error('Login failed:', error)
      SecureStorage.clearAll()
      setState({
        user: null,
        authToken: null,
        isLoading: false,
      })
      SessionMonitor.logSecurityEvent('Login failed', { error: error.message })
      throw error
    }
  }, [setupTokenRefresh])

  const logout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
    SecureStorage.clearAll()
    setState({
      user: null,
      authToken: null,
      isLoading: false,
    })
    previousTokenRef.current = undefined
    invalidateQueries()
    SessionMonitor.logSecurityEvent('User logout')
    window.location.href = '/'
  }, [invalidateQueries])

  const refreshAuthStatus = useCallback(async () => {
    try {
      const token = SecureStorage.getToken()
      if (token) {
        const decodedUser = validateAndDecodeToken(token)
        if (decodedUser) {
          setState({
            user: decodedUser,
            authToken: token,
            isLoading: false,
          })
          setupTokenRefresh(token)
          SessionMonitor.logSecurityEvent('Auth status refreshed')
        } else {
          SecureStorage.removeToken()
          setState({
            user: null,
            authToken: null,
            isLoading: false,
          })
        }
      }
    } catch (error) {
      console.error('Auth status refresh failed:', error)
      SecureStorage.clearAll()
      setState({
        user: null,
        authToken: null,
        isLoading: false,
      })
    }
  }, [setupTokenRefresh])

  const contextValue: AuthContextType = {
    ...state,
    isLoggedIn: !!state.user,
    login,
    logout,
    refreshAuthStatus,
    forceTokenRefresh,
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