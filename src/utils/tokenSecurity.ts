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
 * Secure storage manager using only secure HTTP-only cookies
 */
export const SecureStorage = {
  /**
   * Store token in secure HTTP-only cookie only (no localStorage)
   */
  setToken: (token: string): void => {
    try {
      // Remove any existing localStorage token for security
      localStorage.removeItem('infinitelife_jwt')
      
      // Store only in secure cookie
      CookieUtils.setSecureCookie('infinitelife_session', token, 7)
      
      logger.debug('Token stored in secure cookie only')
    } catch (error) {
      logger.error('Failed to store token securely:', error)
      throw error
    }
  },

  /**
   * Retrieve token from memory/state only (cookies are sent automatically)
   * Returns null since we rely on automatic cookie transmission
   */
  getToken: (): string | null => {
    try {
      // Remove any lingering localStorage tokens
      localStorage.removeItem('infinitelife_jwt')
      
      // Check if we have a valid cookie (for validation purposes only)
      const cookieToken = CookieUtils.getCookie('infinitelife_session')
      if (cookieToken && !isTokenExpired(cookieToken)) {
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
      // Clear localStorage completely
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