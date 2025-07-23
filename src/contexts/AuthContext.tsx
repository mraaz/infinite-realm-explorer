
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";

// This interface defines the shape of the user data stored in the JWT
interface User {
  sub: string;
  email?: string;
  name?: string;
  exp: number;
  [key: string]: any;
}

// Token validation cache structure
interface TokenCache {
  token: string;
  user: User;
  isValid: boolean;
  timestamp: number;
}

// Updated interface to include isLoading
interface AuthContextType {
  user: User | null;
  authToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Token validation cache
  const tokenCacheRef = useRef<TokenCache | null>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cached token validation function
  const validateToken = useCallback((token: string): User | null => {
    const now = Date.now();
    
    // Check cache first (cache valid for 1 minute)
    if (tokenCacheRef.current && 
        tokenCacheRef.current.token === token && 
        now - tokenCacheRef.current.timestamp < 60000) {
      return tokenCacheRef.current.isValid ? tokenCacheRef.current.user : null;
    }

    try {
      const decodedUser = jwtDecode<User>(token);
      const isValid = decodedUser.exp * 1000 > now;
      
      // Update cache
      tokenCacheRef.current = {
        token,
        user: decodedUser,
        isValid,
        timestamp: now
      };
      
      return isValid ? decodedUser : null;
    } catch (error) {
      // Update cache with invalid result
      tokenCacheRef.current = {
        token,
        user: {} as User,
        isValid: false,
        timestamp: now
      };
      return null;
    }
  }, []);

  // Setup token expiration monitoring
  const setupExpirationTimer = useCallback((user: User) => {
    // Clear existing timer
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
    }

    const expirationTime = user.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Only set timer if token hasn't already expired
    if (timeUntilExpiration > 0) {
      expirationTimerRef.current = setTimeout(() => {
        console.log("Token expired, logging out...");
        logout();
      }, timeUntilExpiration);
    }
  }, []);

  // Memoized login function
  const login = useCallback((newToken: string) => {
    localStorage.setItem("infinitelife_jwt", newToken);
    const validatedUser = validateToken(newToken);
    
    if (validatedUser) {
      setUser(validatedUser);
      setAuthToken(newToken);
      setupExpirationTimer(validatedUser);
    } else {
      localStorage.removeItem("infinitelife_jwt");
      setUser(null);
      setAuthToken(null);
    }
  }, [validateToken, setupExpirationTimer]);

  // Memoized logout function
  const logout = useCallback(() => {
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null);
    
    // Clear cache and timers
    tokenCacheRef.current = null;
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
    
    // Redirect to homepage
    window.location.href = "/";
  }, []);

  // Initial authentication check
  useEffect(() => {
    const checkStoredToken = () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem("infinitelife_jwt");
      
      if (storedToken) {
        const validatedUser = validateToken(storedToken);
        if (validatedUser) {
          setUser(validatedUser);
          setAuthToken(storedToken);
          setupExpirationTimer(validatedUser);
        } else {
          localStorage.removeItem("infinitelife_jwt");
        }
      }
      
      setIsLoading(false);
    };

    checkStoredToken();
  }, [validateToken, setupExpirationTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
      }
    };
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    authToken,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
  }), [user, authToken, isLoading, login, logout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context easily in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
