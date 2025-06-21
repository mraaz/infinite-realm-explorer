
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        
        // Check if we're in a popup window
        const isPopup = window.opener && window.opener !== window;
        
        if (isPopup) {
          // For popup flow, just send success message and close
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'OAUTH_SUCCESS'
            }, window.location.origin);
          }
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 500);
          
          return;
        }
        
        // For non-popup flow (direct navigation), handle normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          // Redirect to auth page on error
          window.location.href = '/auth';
        } else if (data.session) {
          console.log('OAuth session successfully established:', data.session.user.email);
          // Redirect to main page on success
          window.location.href = '/';
        } else {
          console.log('No session found, redirecting to auth');
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        
        // Check if we're in a popup
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_ERROR', 
            error: error.message || 'Unknown error occurred' 
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 500);
        } else {
          window.location.href = '/auth';
        }
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
            alt="Infinite Game Logo" 
            className="h-16 w-16"
          />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your login.</p>
        <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
