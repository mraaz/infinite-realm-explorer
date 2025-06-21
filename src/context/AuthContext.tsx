
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  handleLoginSuccess: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (session: Session) => {
    setUser(session.user);
    closeLoginModal();
    toast({
      title: "Login Successful",
      description: "You have been successfully logged in.",
    });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    handleLoginSuccess,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoginModalOpen && <LoginWindow />}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import LoginWindow component (we'll create this next)
import { LoginWindow } from '@/components/auth/LoginWindow';
