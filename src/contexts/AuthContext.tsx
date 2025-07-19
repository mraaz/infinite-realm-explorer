// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PageLoading from "@/components/ui/page-loading"; // Import the loading component

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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 1. ADD a loading state, default to true

  useEffect(() => {
    const validateToken = (token: string) => {
      try {
        const decodedUser = jwtDecode<User>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setAuthToken(token);
        } else {
          // Token is expired
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        // Token is invalid
        localStorage.removeItem("infinitelife_jwt");
      } finally {
        // 2. SET loading to false after checking is done
        setIsLoading(false);
      }
    };

    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      validateToken(storedToken);
    } else {
      // No token found, so we are done loading
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("infinitelife_jwt", newToken);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null);
    window.location.href = "/";
  };

  // 3. RENDER a loading screen for the whole app until auth is checked
  if (isLoading) {
    return <PageLoading />;
  }

  const value = {
    user,
    authToken,
    isLoggedIn: !!user,
    login,
    logout,
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
