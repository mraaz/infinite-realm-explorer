
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    // Check for a token in localStorage when the app loads
    const token = localStorage.getItem('infinitelife_jwt');
    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);
        // Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('infinitelife_jwt');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('infinitelife_jwt');
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('infinitelife_jwt', token);
    try {
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    } catch (error) {
      console.error("Invalid token during login:", error);
      localStorage.removeItem('infinitelife_jwt');
    }
  };

  const logout = () => {
    localStorage.removeItem('infinitelife_jwt');
    setUser(null);
    // Redirect to homepage
    window.location.href = '/';
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
