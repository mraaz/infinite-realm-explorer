
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { branding } from '@/config/branding';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    console.log('[AuthCallback] Component mounted');
    console.log('[AuthCallback] Current URL:', window.location.href);
    console.log('[AuthCallback] Search params:', location.search);
    
    // Check if we're running in a popup window
    const isPopup = window.opener && window.opener !== window;
    console.log('[AuthCallback] Running in popup:', isPopup);
    
    // Get the token from the URL query parameter
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('[AuthCallback] Token received:', !!token);
    console.log('[AuthCallback] Error received:', error);

    if (isPopup) {
      // We're in a popup - communicate with parent window
      if (token) {
        console.log('[AuthCallback] Sending success message to parent');
        
        // Login with the token first
        login(token);
        
        // Send success message to parent window
        window.opener.postMessage({
          type: 'OAUTH_SUCCESS',
          token: token
        }, window.location.origin);
        
        // Dispatch custom event for parent to listen to
        const authCompleteEvent = new CustomEvent('auth-complete', { detail: { token } });
        window.opener.dispatchEvent(authCompleteEvent);
        
        // Close popup
        window.close();
      } else if (error) {
        console.error('[AuthCallback] Sending error message to parent:', error);
        window.opener.postMessage({
          type: 'OAUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        console.error('[AuthCallback] No token or error found, sending error to parent');
        window.opener.postMessage({
          type: 'OAUTH_ERROR',
          error: 'no_token'
        }, window.location.origin);
        window.close();
      }
    } else {
      // Not in popup - use normal redirect flow
      const preLoginPath = localStorage.getItem('preLoginPath') || '/';
      console.log('[AuthCallback] PreLoginPath:', preLoginPath);

      if (token) {
        console.log('[AuthCallback] Processing login with token');
        login(token);
        localStorage.removeItem('preLoginPath');
        console.log('[AuthCallback] Redirecting to:', preLoginPath);
        navigate(preLoginPath, { replace: true });
      } else if (error) {
        console.error('[AuthCallback] OAuth error:', error);
        navigate('/?error=' + encodeURIComponent(error), { replace: true });
      } else {
        console.error('[AuthCallback] No token or error found in callback');
        navigate('/?error=no_token', { replace: true });
      }
    }
  }, [location, navigate, login]);

  // Display a simple loading message while the redirect logic runs.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img 
            src={branding.logo.url} 
            alt={branding.logo.alt} 
            className="h-8 w-8"
          />
          <span className="text-2xl font-semibold text-gray-900">{branding.name}</span>
        </div>
        <p className="text-gray-600">Please wait while we complete your login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
