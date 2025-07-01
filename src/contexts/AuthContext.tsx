
import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// This interface defines the shape of the user data stored in the JWT
interface User {
  sub: string;
  email?: string;
  name?: string;
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('[AuthContext] Initializing - checking for existing token');
    // Check for a token in localStorage when the app first loads
    const token = localStorage.getItem("infinitelife_jwt");
    if (token) {
      console.log('[AuthContext] Found existing token');
      try {
        const decodedUser = jwtDecode<User>(token);
        console.log('[AuthContext] Token decoded successfully:', { sub: decodedUser.sub, email: decodedUser.email });
        // Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          console.log('[AuthContext] Token is valid, setting user');
          setUser(decodedUser);
        } else {
          console.log('[AuthContext] Token is expired, removing');
          // Token is expired, remove it
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        console.error("[AuthContext] Invalid token:", error);
        localStorage.removeItem("infinitelife_jwt");
      }
    } else {
      console.log('[AuthContext] No existing token found');
    }
  }, []);

  const login = (token: string) => {
    console.log('[AuthContext] Login called with token');
    localStorage.setItem("infinitelife_jwt", token);
    try {
      const decodedUser = jwtDecode<User>(token);
      console.log('[AuthContext] Login successful:', { sub: decodedUser.sub, email: decodedUser.email });
      setUser(decodedUser);
    } catch (error) {
      console.error("[AuthContext] Invalid token during login:", error);
      localStorage.removeItem("infinitelife_jwt");
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logout called');
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    // Redirect to homepage
    window.location.href = "/";
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context easily in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
