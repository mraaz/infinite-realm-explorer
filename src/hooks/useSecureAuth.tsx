
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with security checks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth event:', event, 'Session:', session?.user?.id);
        
        try {
          if (session?.user) {
            // Verify user exists in our users table
            const { data: userData, error } = await supabase
              .from('users')
              .select('id, email, is_public')
              .eq('id', session.user.id)
              .single();

            if (error && error.code === 'PGRST116') {
              // User doesn't exist in our users table - should be created by trigger
              console.warn('User not found in users table, trigger may have failed');
              toast({
                title: "Account Setup Issue",
                description: "Please contact support if this persists.",
                variant: "destructive",
              });
              setIsVerified(false);
            } else if (error) {
              console.error('Error verifying user:', error);
              setIsVerified(false);
              toast({
                title: "Authentication Error",
                description: "Unable to verify your account.",
                variant: "destructive",
              });
            } else {
              setIsVerified(true);
              
              // Handle post-authentication redirect
              if (event === 'SIGNED_IN') {
                const shouldReturnToQuestionnaire = localStorage.getItem('shouldReturnToQuestionnaire');
                if (shouldReturnToQuestionnaire === 'true') {
                  localStorage.removeItem('shouldReturnToQuestionnaire');
                  // Small delay to ensure the questionnaire page loads properly
                  setTimeout(() => {
                    navigate('/questionnaire');
                  }, 100);
                }
              }
            }
          } else {
            setIsVerified(false);
          }

          setSession(session);
          setUser(session?.user ?? null);
        } catch (error) {
          console.error('Auth state change error:', error);
          setIsVerified(false);
        } finally {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          toast({
            title: "Session Error",
            description: "Unable to restore your session.",
            variant: "destructive",
          });
        }
        
        if (!mounted) return;
        
        if (session) {
          // If we have a session, verify the user exists in our database
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, email, is_public')
              .eq('id', session.user.id)
              .single();

            if (!userError && userData) {
              setIsVerified(true);
              setSession(session);
              setUser(session.user);
            } else {
              setIsVerified(false);
            }
          } catch (error) {
            console.error('Error checking user in database:', error);
            setIsVerified(false);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Check Your Email",
          description: "Please check your email for a confirmation link.",
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'discord') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false, // Ensure full page redirect
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast({
          title: "OAuth Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Note: After successful OAuth initiation, the browser will redirect
      // to the provider's page, so we don't return here in normal flow
      return { error: null };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setIsVerified(false);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  return {
    user,
    session,
    loading,
    isVerified,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
  };
};
