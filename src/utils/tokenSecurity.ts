import { jwtDecode } from 'jwt-decode'
import { logger } from '@/utils/logger'

interface User {
  sub: string
  email?: string
  name?: string
  exp: number
  iat: number
}

// Token expiry buffer - refresh token when it has less than 5 minutes left
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Check if a token is expiring soon and needs refresh
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<User>(token)
    const expiryTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const timeUntilExpiry = expiryTime - currentTime
    
    return timeUntilExpiry <= TOKEN_REFRESH_BUFFER
  } catch (error) {
    logger.error('Failed to decode token for expiry check:', error)
    return true // Assume expired if we can't decode
  }
}

/**
 * Check if a token is completely expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<User>(token)
    const expiryTime = decoded.exp * 1000
    const currentTime = Date.now()
    
    return currentTime >= expiryTime
  } catch (error) {
    logger.error('Failed to decode token for expiry check:', error)
    return true
  }
}

/**
 * Validate and decode a JWT token
 */
export const validateAndDecodeToken = (token: string): User | null => {
  try {
    const decodedUser = jwtDecode<User>(token)
    if (isTokenExpired(token)) {
      logger.warn('Token is expired')
      return null
    }
    return decodedUser
  } catch (error) {
    logger.error('Token validation failed:', error)
    return null
  }
}

/**
 * Secure cookie utilities
 */
export const CookieUtils = {
  /**
   * Set a secure HTTP-only cookie (requires server-side implementation)
   * For now, we'll use a secure client-side approach
   */
  setSecureCookie: (name: string, value: string, days: number = 7) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    
    // Use secure flags when in production
    const secure = window.location.protocol === 'https:'
    const sameSite = 'strict'
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; ${secure ? 'secure;' : ''} samesite=${sameSite}`
  },

  /**
   * Get a cookie value
   */
  getCookie: (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  },

  /**
   * Remove a cookie
   */
  removeCookie: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}

/**
 * Secure storage manager that handles both localStorage and cookies
 */
export const SecureStorage = {
  /**
   * Store token with both localStorage (for backward compatibility) and secure storage
   */
  setToken: (token: string): void => {
    try {
      // Primary storage - localStorage for immediate compatibility
      localStorage.setItem('infinitelife_jwt', token)
      
      // Secondary storage - secure cookie for enhanced security
      CookieUtils.setSecureCookie('infinitelife_session', token, 7)
      
      logger.debug('Token stored in secure storage')
    } catch (error) {
      logger.error('Failed to store token securely:', error)
      // Fallback to localStorage only
      localStorage.setItem('infinitelife_jwt', token)
    }
  },

  /**
   * Retrieve token from storage (prioritize localStorage for compatibility)
   */
  getToken: (): string | null => {
    try {
      // Check localStorage first for backward compatibility
      const localToken = localStorage.getItem('infinitelife_jwt')
      if (localToken && !isTokenExpired(localToken)) {
        return localToken
      }

      // Fallback to secure cookie
      const cookieToken = CookieUtils.getCookie('infinitelife_session')
      if (cookieToken && !isTokenExpired(cookieToken)) {
        // Sync back to localStorage if cookie token is valid
        localStorage.setItem('infinitelife_jwt', cookieToken)
        return cookieToken
      }

      return null
    } catch (error) {
      logger.error('Failed to retrieve token from storage:', error)
      return null
    }
  },

  /**
   * Remove token from all storage locations
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem('infinitelife_jwt')
      CookieUtils.removeCookie('infinitelife_session')
      logger.debug('Token removed from all storage locations')
    } catch (error) {
      logger.error('Failed to remove token from storage:', error)
    }
  },

  /**
   * Clear all authentication data
   */
  clearAll: (): void => {
    try {
      // Clear localStorage
      localStorage.removeItem('infinitelife_jwt')
      localStorage.removeItem('preLoginPath')
      
      // Clear cookies
      CookieUtils.removeCookie('infinitelife_session')
      
      logger.debug('All authentication data cleared')
    } catch (error) {
      logger.error('Failed to clear authentication data:', error)
    }
  }
}

/**
 * Session monitoring utilities
 */
export const SessionMonitor = {
  /**
   * Detect suspicious activity patterns
   */
  detectAnomalies: (currentToken: string, previousToken?: string): boolean => {
    try {
      if (!previousToken) return false

      const current = jwtDecode<User>(currentToken)
      const previous = jwtDecode<User>(previousToken)

      // Check for user ID mismatch (potential session hijacking)
      if (current.sub !== previous.sub) {
        logger.warn('Session anomaly detected: User ID mismatch')
        return true
      }

      // Check for unrealistic token renewal timing
      const timeDiff = current.iat - previous.iat
      if (timeDiff < 60) { // Less than 1 minute between tokens
        logger.warn('Session anomaly detected: Rapid token renewal')
        return true
      }

      return false
    } catch (error) {
      logger.error('Failed to detect session anomalies:', error)
      return false
    }
  },

  /**
   * Log security events
   */
  logSecurityEvent: (event: string, details?: any): void => {
    logger.info(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    })
  }
}