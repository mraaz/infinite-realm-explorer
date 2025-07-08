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

// --- MODIFIED --- Renamed 'token' to 'authToken'
interface AuthContextType {
  user: User | null;
  authToken: string | null; // The raw JWT token string
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // --- NEW --- State to hold the raw token, renamed to 'authToken'
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for a token in localStorage when the app first loads
    const storedToken = localStorage.getItem("infinitelife_jwt");
    if (storedToken) {
      try {
        const decodedUser = jwtDecode<User>(storedToken);
        // Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          setAuthToken(storedToken); // --- NEW --- Set the token in state
        } else {
          // Token is expired, remove it
          localStorage.removeItem("infinitelife_jwt");
        }
      } catch (error) {
        localStorage.removeItem("infinitelife_jwt");
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("infinitelife_jwt", newToken);
    try {
      const decodedUser = jwtDecode<User>(newToken);
      setUser(decodedUser);
      setAuthToken(newToken); // --- NEW --- Set the token on login
    } catch (error) {
      localStorage.removeItem("infinitelife_jwt");
    }
  };

  const logout = () => {
    localStorage.removeItem("infinitelife_jwt");
    setUser(null);
    setAuthToken(null); // --- NEW --- Clear the token on logout
    // Redirect to homepage
    window.location.href = "/";
  };

  // --- MODIFIED --- Add authToken to the provided value
  const value = {
    user,
    authToken,
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
