
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePopupAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithPopup = async (provider: 'google' | 'facebook' | 'discord') => {
    setLoading(true);
    
    try {
      // Create popup window
      const popup = window.open('', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Set up message listener for popup communication
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'OAUTH_SUCCESS') {
          console.log('OAuth success received from popup');
          toast({
            title: "Login Successful",
            description: "You have been successfully logged in.",
          });
          window.removeEventListener('message', messageListener);
          setLoading(false);
        } else if (event.data.type === 'OAUTH_ERROR') {
          console.error('OAuth error received from popup:', event.data.error);
          toast({
            title: "Login Failed",
            description: event.data.error || "An error occurred during login.",
            variant: "destructive",
          });
          window.removeEventListener('message', messageListener);
          setLoading(false);
        }
      };

      window.addEventListener('message', messageListener);

      // Set up popup close listener
      const popupCloseChecker = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCloseChecker);
          window.removeEventListener('message', messageListener);
          setLoading(false);
        }
      }, 1000);

      // Get the redirect URL for the callback page
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Initiate OAuth flow in the popup
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Important: Don't redirect the main window
        }
      });

      if (error) {
        popup.close();
        clearInterval(popupCloseChecker);
        window.removeEventListener('message', messageListener);
        throw error;
      }

      // Get the auth URL and redirect the popup
      const { data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      return { error: null };
    } catch (error) {
      console.error('Popup OAuth error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive",
      });
      setLoading(false);
      return { error };
    }
  };

  return {
    signInWithPopup,
    loading,
  };
};
