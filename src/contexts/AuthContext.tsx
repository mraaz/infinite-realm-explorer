// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { jwtDecode } from "jwt-decode";
import { getUserDataStatus, getUserSettings } from "@/services/apiService";
import PageLoading from "@/components/ui/page-loading";

interface User {
  sub: string;
  email?: string;
  name?: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  authToken: string | null;
  isLoading: boolean;
  hasPulseCheckData: boolean;
  hasFutureSelfData: boolean;
  completedFutureQuestionnaire: boolean;
}

interface AuthContextType extends AuthState {
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshAuthStatus: () => Promise<void>;
}

// Cache interfaces
interface TokenCache {
  token: string;
  decodedUser: User;
  expiry: number;
}

interface DataCache {
  data: {
    hasPulseCheckData: boolean;
    hasFutureSelfData: boolean;
    completedFutureQuestionnaire: boolean;
  };
  timestamp: number;
  ttl: number;
}

// Auth reducer for efficient state management
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; token: string | null } }
  | { type: 'SET_USER_DATA'; payload: { hasPulseCheckData: boolean; hasFutureSelfData: boolean; completedFutureQuestionnaire: boolean } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload.user, 
        authToken: action.payload.token 
      };
    case 'SET_USER_DATA':
      return { 
        ...state, 
        hasPulseCheckData: action.payload.hasPulseCheckData,
        hasFutureSelfData: action.payload.hasFutureSelfData,
        completedFutureQuestionnaire: action.payload.completedFutureQuestionnaire
      };
    case 'LOGOUT':
      return {
        user: null,
        authToken: null,
        isLoading: false,
        hasPulseCheckData: false,
        hasFutureSelfData: false,
        completedFutureQuestionnaire: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use reducer for efficient state management
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    authToken: null,
    isLoading: true,
    hasPulseCheckData: false,
    hasFutureSelfData: false,
    completedFutureQuestionnaire: false,
  });

  // Performance monitoring
  const performanceRef = useState(() => ({ authChecks: 0, cacheHits: 0, cacheMisses: 0 }))[0];

  // Cache refs for memoization
  const tokenCacheRef = useState<TokenCache | null>(null)[0];
  const dataCacheRef = useState<DataCache | null>(null)[0];

  // Race condition prevention refs
  const loginInProgressRef = useRef(false);
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const retryControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Memoized token validation with caching
  const validateAndDecodeToken = useCallback((token: string): User | null => {
    performanceRef.authChecks++;
    
    // Check cache first
    if (tokenCacheRef && 
        tokenCacheRef.token === token && 
        Date.now() < tokenCacheRef.expiry - 60000) { // 1 min buffer
      performanceRef.cacheHits++;
      return tokenCacheRef.decodedUser;
    }

    performanceRef.cacheMisses++;
    
    try {
      const decodedUser = jwtDecode<User>(token);
      if (decodedUser.exp * 1000 <= Date.now()) {
        return null;
      }

      // Update cache
      if (tokenCacheRef) {
        tokenCacheRef.token = token;
        tokenCacheRef.decodedUser = decodedUser;
        tokenCacheRef.expiry = decodedUser.exp * 1000;
      }

      return decodedUser;
    } catch (error) {
      console.error("Token validation failed:", error);
      return null;
    }
  }, [tokenCacheRef, performanceRef]);

  // Cache-aware data fetching
  const fetchUserDataCached = useCallback(async (token: string): Promise<void> => {
    const now = Date.now();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Check cache validity
    if (dataCacheRef && 
        now - dataCacheRef.timestamp < dataCacheRef.ttl) {
      performanceRef.cacheHits++;
      dispatch({ type: 'SET_USER_DATA', payload: dataCacheRef.data });
      return;
    }

    performanceRef.cacheMisses++;

    try {
      const [statusRes, settingsRes] = await Promise.all([
        getUserDataStatus(token),
        getUserSettings(token),
      ]);

      const userData = {
        hasPulseCheckData: statusRes.hasPulseCheckData,
        hasFutureSelfData: statusRes.hasFutureSelfData,
        completedFutureQuestionnaire: settingsRes.completedFutureQuestionnaire,
      };

      // Update cache
      if (dataCacheRef) {
        dataCacheRef.data = userData;
        dataCacheRef.timestamp = now;
        dataCacheRef.ttl = CACHE_TTL;
      }

      dispatch({ type: 'SET_USER_DATA', payload: userData });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  }, [dataCacheRef, performanceRef]);

  // Optimized auth status fetching
  const fetchAndSetAuthStatus = useCallback(async (token: string) => {
    try {
      const decodedUser = validateAndDecodeToken(token);
      
      if (decodedUser) {
        dispatch({ type: 'SET_USER', payload: { user: decodedUser, token } });
        await fetchUserDataCached(token);
      } else {
        // Token expired or invalid
        localStorage.removeItem("infinitelife_jwt");
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error("Auth context initialization/refresh failed:", error);
      localStorage.removeItem("infinitelife_jwt");
      dispatch({ type: 'LOGOUT' });
    }
  }, [validateAndDecodeToken, fetchUserDataCached]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("infinitelife_jwt");
      if (storedToken) {
        await fetchAndSetAuthStatus(storedToken);
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    initializeAuth();
  }, [fetchAndSetAuthStatus]);

  // Optimized delayed user data fetching with retry logic and caching
  const fetchUserDataWithDelay = useCallback(async (token: string, retryCount = 0) => {
    const maxRetries = 3;
    const delay = 500 + (retryCount * 500); // Increasing delay: 500ms, 1s, 1.5s
    
    try {
      console.log(`[Auth] Fetching user data (attempt ${retryCount + 1})`);
      
      // Wait before making API calls to avoid CORS timing issues
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Use the cached fetch function
      await fetchUserDataCached(token);
      console.log("[Auth] User data fetched successfully");
    } catch (error) {
      console.warn(`[Auth] Failed to fetch user data (attempt ${retryCount + 1}):`, error);
      
      // Retry if it's a network/CORS error and we haven't exceeded max retries
      if (retryCount < maxRetries) {
        console.log(`[Auth] Retrying user data fetch in ${delay}ms...`);
        setTimeout(() => {
          fetchUserDataWithDelay(token, retryCount + 1);
        }, delay);
      } else {
        console.warn("[Auth] Max retries exceeded for user data fetching");
      }
    }
  }, [fetchUserDataCached]);

  const login = useCallback(async (newToken: string) => {
    try {
      console.log("[Auth] Starting login with token");
      
      // Use cached token validation
      const decodedUser = validateAndDecodeToken(newToken);
      if (!decodedUser) {
        throw new Error("Token is expired or invalid");
      }
      
      // Store token and set user immediately (core authentication only)
      localStorage.setItem("infinitelife_jwt", newToken);
      dispatch({ type: 'SET_USER', payload: { user: decodedUser, token: newToken } });
      console.log("[Auth] Core authentication successful");
      
      // Defer user data fetching to avoid CORS timing issues
      fetchUserDataWithDelay(newToken);
      
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      localStorage.removeItem("infinitelife_jwt");
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, [validateAndDecodeToken, fetchUserDataWithDelay]);

  const logout = useCallback(() => {
    localStorage.removeItem("infinitelife_jwt");
    dispatch({ type: 'LOGOUT' });
    window.location.href = "/";
  }, []);

  // Refresh auth status function
  const refreshAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("infinitelife_jwt");
    if (token) {
      await fetchAndSetAuthStatus(token);
    }
  }, [fetchAndSetAuthStatus]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    isLoggedIn: !!state.user,
    login,
    logout,
    refreshAuthStatus,
  }), [state, login, logout, refreshAuthStatus]);

  // Performance debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logPerformance = () => {
        console.log('[Auth Performance]', {
          authChecks: performanceRef.authChecks,
          cacheHits: performanceRef.cacheHits,
          cacheMisses: performanceRef.cacheMisses,
          cacheHitRate: performanceRef.cacheHits / (performanceRef.cacheHits + performanceRef.cacheMisses) * 100
        });
      };
      const interval = setInterval(logPerformance, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }
  }, [performanceRef]);

  if (state.isLoading) {
    return <PageLoading />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
