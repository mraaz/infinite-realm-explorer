
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        
        // Handle the auth callback by letting Supabase process the URL fragments
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          
          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'OAUTH_ERROR', 
              error: error.message || 'Authentication failed' 
            }, window.location.origin);
          }
        } else if (data.session) {
          console.log('OAuth session successfully established:', data.session.user.email);
          
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'OAUTH_SUCCESS', 
              session: data.session 
            }, window.location.origin);
          }
        } else {
          console.log('No session found, checking if tokens are in URL...');
          
          // If no session but we have URL fragments, wait a moment for Supabase to process them
          if (window.location.hash.includes('access_token')) {
            console.log('Access token found in URL, waiting for Supabase to process...');
            
            // Wait a moment for Supabase to process the tokens
            setTimeout(async () => {
              const { data: retryData, error: retryError } = await supabase.auth.getSession();
              
              if (retryError) {
                console.error('Retry error:', retryError);
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'OAUTH_ERROR', 
                    error: retryError.message 
                  }, window.location.origin);
                }
              } else if (retryData.session) {
                console.log('Session found on retry:', retryData.session.user.email);
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'OAUTH_SUCCESS', 
                    session: retryData.session 
                  }, window.location.origin);
                }
              } else {
                console.log('Still no session after retry');
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'OAUTH_ERROR', 
                    error: 'No session could be established' 
                  }, window.location.origin);
                }
              }
              
              // Close popup after retry
              setTimeout(() => {
                window.close();
              }, 500);
            }, 1000);
            
            return; // Don't close immediately, wait for the retry
          } else {
            // No tokens in URL and no session
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_ERROR', 
                error: 'No authentication data found' 
              }, window.location.origin);
            }
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_ERROR', 
            error: error.message || 'Unknown error occurred' 
          }, window.location.origin);
        }
      } finally {
        // Close the popup window after a short delay (unless we're waiting for retry)
        if (!window.location.hash.includes('access_token')) {
          setTimeout(() => {
            window.close();
          }, 1000);
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
