
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
          console.log('Detected popup window, processing OAuth callback...');
          
          // Wait a moment for Supabase to process the auth state from URL
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get the session after Supabase processes the callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session in popup:', error);
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_ERROR', 
                error: error.message 
              }, 'https://app.infinitegame.live');
            }
          } else if (data.session) {
            console.log('OAuth session successfully established in popup:', data.session.user.email);
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_SUCCESS',
                user: data.session.user,
                session: data.session
              }, 'https://app.infinitegame.live');
            }
          } else {
            console.log('No session found in popup, checking auth state...');
            
            // Listen for auth state changes in case session is still being processed
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              console.log('Auth state change in popup:', event, session);
              if (session && window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_SUCCESS',
                  user: session.user,
                  session: session
                }, 'https://app.infinitegame.live');
                subscription.unsubscribe();
                window.close();
              } else if (event === 'SIGNED_OUT' && window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_ERROR', 
                  error: 'Authentication failed' 
                }, 'https://app.infinitegame.live');
                subscription.unsubscribe();
                window.close();
              }
            });
            
            // Timeout fallback
            setTimeout(() => {
              subscription.unsubscribe();
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_ERROR', 
                  error: 'Authentication timeout' 
                }, 'https://app.infinitegame.live');
              }
              window.close();
            }, 10000);
            
            return; // Don't close immediately, wait for auth state change
          }
          
          // Close popup after a short delay to ensure message is sent
          setTimeout(() => {
            window.close();
          }, 500);
          
          return;
        }
        
        // For non-popup flow (direct navigation), handle normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          window.location.href = 'https://app.infinitegame.live/auth';
        } else if (data.session) {
          console.log('OAuth session successfully established:', data.session.user.email);
          window.location.href = 'https://app.infinitegame.live/';
        } else {
          console.log('No session found, redirecting to auth');
          window.location.href = 'https://app.infinitegame.live/auth';
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_ERROR', 
            error: error.message || 'Unknown error occurred' 
          }, 'https://app.infinitegame.live');
          
          setTimeout(() => {
            window.close();
          }, 500);
        } else {
          window.location.href = 'https://app.infinitegame.live/auth';
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
