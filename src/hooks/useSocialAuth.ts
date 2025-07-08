
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_GATEWAY_URL } from '@/config/api';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = (provider: 'google' | 'facebook' | 'discord') => {
    console.log(`[OAuth] Starting ${provider} popup login flow`);
    setIsLoading(true);
    
    // --- Configuration ---
    const GOOGLE_CLIENT_ID = '641437646622-n482j0ta8p8f3qbp83pd3gambq2ck4kv.apps.googleusercontent.com';
    const DISCORD_CLIENT_ID = '1385860077050658926';
    const FACEBOOK_CLIENT_ID = 'YOUR_FACEBOOK_APP_ID_HERE';

    let loginUrl;

    if (provider === 'google') {
      loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20profile&response_type=code&redirect_uri=${API_GATEWAY_URL}/auth/google/callback&client_id=${GOOGLE_CLIENT_ID}`;
    } else if (provider === 'discord') {
      loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(`${API_GATEWAY_URL}/auth/discord/callback`)}&scope=identify%20email`;
    } else if (provider === 'facebook') {
      loginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${API_GATEWAY_URL}/auth/facebook/callback`)}&scope=email`;
    }

    if (loginUrl) {
      console.log(`[OAuth] Opening popup for URL: ${loginUrl}`);
      
      // Save the user's current page path so we can return them here after login
      localStorage.setItem('preLoginPath', window.location.pathname);
      console.log(`[OAuth] Saved preLoginPath: ${window.location.pathname}`);
      
      // Open popup window for OAuth flow
      const popup = window.open(
        loginUrl,
        'oauth-popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        console.error('[OAuth] Popup blocked, falling back to redirect');
        window.location.href = loginUrl;
        return;
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;

        console.log('[OAuth] Received message from popup:', event.data);

        if (event.data.type === 'OAUTH_SUCCESS') {
          console.log('[OAuth] Login successful via popup');
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          // Clean up URL parameters and stay on the same page
          const currentUrl = new URL(window.location.href);
          const wasGuest = currentUrl.searchParams.has('guest');
          
          if (wasGuest) {
            console.log('[OAuth] Cleaning up guest parameter from URL');
            currentUrl.searchParams.delete('guest');
            
            // Use replaceState to update URL without navigation
            window.history.replaceState({}, '', currentUrl.toString());
            
            console.log('[OAuth] URL cleaned, staying on current page');
          }
          
        } else if (event.data.type === 'OAUTH_ERROR') {
          console.error('[OAuth] Error from popup:', event.data.error);
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
          popup.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Handle popup being closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('[OAuth] Popup closed by user');
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          console.log('[OAuth] Popup timeout, closing');
          popup.close();
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
        }
      }, 300000);
    }
  };

  return {
    handleLoginClick,
    isLoading
  };
};
