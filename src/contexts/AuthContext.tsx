
// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserDataStatus } from "@/services/apiService"; // RE-ADDED: Import the service
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
  hasPulseCheckData: boolean; // ADDED: Pulse Check status
  hasFutureSelfData: boolean; // ADDED: Future Self status
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPulseCheckData, setHasPulseCheckData] = useState(false); // ADDED
  const [hasFutureSelfData, setHasFutureSelfData] = useState(false); // ADDED

  const fetchUserStatus = async (token: string, decodedUser: User) => {
    try {
      const status = await getUserDataStatus(token);
      setHasPulseCheckData(status.hasPulseCheckData);
      setHasFutureSelfData(status.hasFutureSelfData);
    } catch (error) {
      console.error("[AuthContext] Failed to fetch user status:", error);
      // Don't fail the entire auth process if status fetch fails
      setHasPulseCheckData(false);
      setHasFutureSelfData(false);
    }
  };

  useEffect(() => {
    const checkTokenAndFetchStatus = async (token: string) => {
      try {
        const decodedUser = jwtDecode<User>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setAuthToken(token);
          // ADDED: Fetch user status
          await fetchUserStatus(token, decodedUser);
        } else {
          console.log("[AuthContext] Token expired, removing from storage");
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        console.error("[AuthContext] Error decoding token:", error);
        localStorage.removeItem("infinitelife_jwt");
      } finally {
        setIsLoading(false);
      }
    };

    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      console.log("[AuthContext] Found stored token, validating...");
      checkTokenAndFetchStatus(storedToken);
    } else {
      console.log("[AuthContext] No stored token found");
      setIsLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    console.log("[AuthContext] Processing login with new token");
    
    try {
      // Decode and validate the token
      const decodedUser = jwtDecode<User>(newToken);
      
      if (decodedUser.exp * 1000 <= Date.now()) {
        console.error("[AuthContext] Token is expired");
        throw new Error("Token is expired");
      }

      // Store the token
      localStorage.setItem("infinitelife_jwt", newToken);
      
      // Update state immediately
      setUser(decodedUser);
      setAuthToken(newToken);
      
      // Fetch user status in background
      await fetchUserStatus(newToken, decodedUser);
      
      console.log("[AuthContext] Login successful");
    } catch (error) {
      console.error("[AuthContext] Login failed:", error);
      // Clean up on error
      localStorage.removeItem("infinitelife_jwt");
      setUser(null);
      setAuthToken(null);
      setHasPulseCheckData(false);
      setHasFutureSelfData(false);
      throw error;
    }
  };

  const logout = () => {
    console.log("[AuthContext] Logging out user");
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null);
    setHasPulseCheckData(false);
    setHasFutureSelfData(false);
    window.location.href = "/";
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const value = {
    user,
    authToken,
    isLoggedIn: !!user,
    hasPulseCheckData, // ADDED
    hasFutureSelfData, // ADDED
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
