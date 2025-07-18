import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserDataStatus } from "@/services/apiService"; // Import the new service

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
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [hasPulseCheckData, setHasPulseCheckData] = useState(false);
  const [hasFutureSelfData, setHasFutureSelfData] = useState(false);

  useEffect(() => {
    const checkTokenAndFetchStatus = async (token: string) => {
      try {
        const decodedUser = jwtDecode<User>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setAuthToken(token);
          const status = await getUserDataStatus(token);
          setHasPulseCheckData(status.hasPulseCheckData);
          setHasFutureSelfData(status.hasFutureSelfData);
        } else {
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        localStorage.removeItem("infinitelife_jwt");
      }
    };

    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      checkTokenAndFetchStatus(storedToken);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("infinitelife_jwt", newToken);
    // Reloading to re-trigger the useEffect is a simple way to ensure status is fetched
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null);
    window.location.href = "/";
  };

  const value = {
    user,
    authToken,
    isLoggedIn: !!user,
    hasPulseCheckData,
    hasFutureSelfData,
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
