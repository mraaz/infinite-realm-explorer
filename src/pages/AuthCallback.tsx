
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        
        // Get the session from the URL parameters that Supabase parsed
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
        } else if (session) {
          console.log('OAuth session successfully established. Closing popup.');
          
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_SUCCESS', session }, window.location.origin);
          }
        } else {
          console.log('No session found on callback page.');
          
          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_ERROR', error: 'No session found' }, window.location.origin);
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_ERROR', error: error.message }, window.location.origin);
        }
      } finally {
        // Close the popup window
        setTimeout(() => {
          window.close();
        }, 1000);
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your login.</p>
        <p className="text-sm text-gray-500 mt-2">This window will close automatically.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
