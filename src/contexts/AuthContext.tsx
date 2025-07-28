// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { getUserDataStatus, getUserSettings } from "@/services/apiService";
import PageLoading from "@/components/ui/page-loading";

// --- Interfaces ---
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
  login: (token: string) => void;
  logout: () => void;
}

interface UserData {
  hasPulseCheckData: boolean;
  hasFutureSelfData: boolean;
  completedFutureQuestionnaire: boolean;
}

// --- TanStack Query Client ---
// Create a client instance. This can be configured with default options.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 15, // 15 minutes
      retry: 2, // Retry failed requests up to 2 times
    },
  },
});

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | null>(null);

// --- Auth Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Effect to initialize auth state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      try {
        const decodedUser = jwtDecode<User>(storedToken);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setAuthToken(storedToken);
        } else {
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        console.error("Failed to decode token on init:", error);
        localStorage.removeItem("infinitelife_jwt");
      }
    }
    setIsInitializing(false);
  }, []);

  // Login function
  const login = useCallback((token: string) => {
    try {
      const decodedUser = jwtDecode<User>(token);
      localStorage.setItem("infinitelife_jwt", token);
      setAuthToken(token);
      setUser(decodedUser);
    } catch (error) {
      console.error("Login failed: Invalid token", error);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("infinitelife_jwt");
    setAuthToken(null);
    setUser(null);
    // Clear all user-specific data from the query cache on logout
    queryClient.clear();
    window.location.href = "/";
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      authToken,
      user,
      isLoggedIn: !!user,
      login,
      logout,
    }),
    [authToken, user, login, logout]
  );

  if (isInitializing) {
    return <PageLoading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

// --- Custom Hooks ---

/**
 * Hook to access authentication data (user, token, login/logout methods).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Hook to fetch user-specific application data.
 * This replaces the complex data fetching logic that was previously in the context.
 */
export const useUserData = () => {
  const { authToken } = useAuth();

  return useQuery<UserData>({
    // The query key is an array that uniquely identifies this data.
    // Including the authToken ensures that if the user changes, the data is refetched.
    queryKey: ["userData", authToken],

    // The query function is the async function that fetches the data.
    queryFn: async () => {
      if (!authToken) {
        throw new Error("No auth token provided");
      }
      // Use Promise.all for concurrent fetching, just like before.
      const [statusRes, settingsRes] = await Promise.all([
        getUserDataStatus(authToken),
        getUserSettings(authToken),
      ]);

      return {
        hasPulseCheckData: statusRes.hasPulseCheckData,
        hasFutureSelfData: statusRes.hasFutureSelfData,
        completedFutureQuestionnaire: settingsRes.completedFutureQuestionnaire,
      };
    },
    // The query will only run if the authToken exists.
    enabled: !!authToken,
  });
};
