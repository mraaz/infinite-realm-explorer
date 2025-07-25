// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
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

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  hasPulseCheckData: boolean;
  hasFutureSelfData: boolean;
  completedFutureQuestionnaire: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  // --- NEW: Expose the refresh function ---
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPulseCheckData, setHasPulseCheckData] = useState(false);
  const [hasFutureSelfData, setHasFutureSelfData] = useState(false);
  const [completedFutureQuestionnaire, setCompletedFutureQuestionnaire] =
    useState(false);

  // --- NEW: Extracted the fetching logic into a reusable function ---
  const fetchAndSetAuthStatus = useCallback(async (token: string) => {
    try {
      const decodedUser = jwtDecode<User>(token);
      if (decodedUser.exp * 1000 > Date.now()) {
        setUser(decodedUser);
        setAuthToken(token);

        const [statusRes, settingsRes] = await Promise.all([
          getUserDataStatus(token),
          getUserSettings(token),
        ]);

        setHasPulseCheckData(statusRes.hasPulseCheckData);
        setHasFutureSelfData(statusRes.hasFutureSelfData);
        setCompletedFutureQuestionnaire(
          settingsRes.completedFutureQuestionnaire
        );
      } else {
        // Token expired, log out
        localStorage.removeItem("infinitelife_jwt");
        setUser(null);
        setAuthToken(null);
      }
    } catch (error) {
      console.error("Auth context initialization/refresh failed:", error);
      localStorage.removeItem("infinitelife_jwt");
      setUser(null);
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("infinitelife_jwt");
      if (storedToken) {
        await fetchAndSetAuthStatus(storedToken);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchAndSetAuthStatus]);

  // Delayed user data fetching with retry logic
  const fetchUserDataWithDelay = useCallback(async (token: string, retryCount = 0) => {
    const maxRetries = 3;
    const delay = 500 + (retryCount * 500); // Increasing delay: 500ms, 1s, 1.5s
    
    try {
      console.log(`[Auth] Fetching user data (attempt ${retryCount + 1})`);
      
      // Wait before making API calls to avoid CORS timing issues
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const [statusRes, settingsRes] = await Promise.all([
        getUserDataStatus(token),
        getUserSettings(token),
      ]);
      
      setHasPulseCheckData(statusRes.hasPulseCheckData);
      setHasFutureSelfData(statusRes.hasFutureSelfData);
      setCompletedFutureQuestionnaire(settingsRes.completedFutureQuestionnaire);
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
  }, []);

  const login = async (newToken: string) => {
    try {
      console.log("[Auth] Starting login with token");
      
      // First, validate and store the token
      const decodedUser = jwtDecode<User>(newToken);
      if (decodedUser.exp * 1000 <= Date.now()) {
        throw new Error("Token is expired");
      }
      
      // Store token and set user immediately (core authentication only)
      localStorage.setItem("infinitelife_jwt", newToken);
      setUser(decodedUser);
      setAuthToken(newToken);
      console.log("[Auth] Core authentication successful");
      
      // Defer user data fetching to avoid CORS timing issues
      fetchUserDataWithDelay(newToken);
      
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      localStorage.removeItem("infinitelife_jwt");
      setUser(null);
      setAuthToken(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null);
    window.location.href = "/";
  };

  // --- NEW: The function that will be called from other components ---
  const refreshAuthStatus = async () => {
    const token = localStorage.getItem("infinitelife_jwt");
    if (token) {
      await fetchAndSetAuthStatus(token);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const value = {
    user,
    authToken,
    isLoggedIn: !!user,
    isLoading,
    hasPulseCheckData,
    hasFutureSelfData,
    completedFutureQuestionnaire,
    login,
    logout,
    refreshAuthStatus, // Expose the new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
