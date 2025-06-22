
import { useState } from 'react';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = (provider: 'google' | 'facebook' | 'discord') => {
    setIsLoading(true);
    
    // --- Configuration ---
    const GOOGLE_CLIENT_ID = '807079821345-35pbtdeppqrf45i6vb3kusu4iv5p29kl.apps.googleusercontent.com';
    const DISCORD_CLIENT_ID = '1385860077050658926';
    const FACEBOOK_CLIENT_ID = 'YOUR_FACEBOOK_APP_ID_HERE';
    
    // This is your live AWS API Gateway URL.
    const API_GATEWAY_URL = 'https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod';

    let loginUrl;

    if (provider === 'google') {
      loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20profile&response_type=code&redirect_uri=${API_GATEWAY_URL}/auth/google/callback&client_id=${GOOGLE_CLIENT_ID}`;
    } else if (provider === 'discord') {
      loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(`${API_GATEWAY_URL}/auth/discord/callback`)}&scope=identify%20email`;
    } else if (provider === 'facebook') {
      loginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${API_GATEWAY_URL}/auth/facebook/callback`)}&scope=email`;
    }

    if (loginUrl) {
      // Save the user's current page path so we can return them here after login.
      localStorage.setItem('preLoginPath', window.location.pathname);
      // Redirect the user to the AWS authentication endpoint.
      window.location.href = loginUrl;
    }
    
    setIsLoading(false);
  };

  return {
    handleLoginClick,
    isLoading
  };
};
