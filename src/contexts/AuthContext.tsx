// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from "react";
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
  hasPulseCheckData: boolean;
  hasFutureSelfData: boolean;
  completedFutureQuestionnaire: boolean;
  login: (token: string) => void;
  logout: () => void;
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

  useEffect(() => {
    const checkTokenAndFetchStatus = async (token: string) => {
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
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        console.error("Auth context initialization failed:", error);
        localStorage.removeItem("infinitelife_jwt");
      } finally {
        setIsLoading(false);
      }
    };

    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      checkTokenAndFetchStatus(storedToken);
    } else {
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

  if (isLoading) {
    return <PageLoading />;
  }

  const value = {
    user,
    authToken,
    isLoggedIn: !!user,
    hasPulseCheckData,
    hasFutureSelfData,
    completedFutureQuestionnaire,
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
