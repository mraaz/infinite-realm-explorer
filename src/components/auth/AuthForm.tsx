
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Chrome, Facebook } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const AuthForm = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithProvider } = useSecureAuth();

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'discord') => {
    setLoading(true);
    setError('');

    const { error } = await signInWithProvider(provider);

    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
              alt="Infinite Game Logo" 
              className="h-16 w-16 md:h-20 md:w-20"
            />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Infinite Game
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Continue with your social account to save your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3 md:space-y-4">
            <Button
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors py-3 md:py-4 text-sm md:text-base"
            >
              <Chrome className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Continue with Google
            </Button>
            <Button
              onClick={() => handleSocialAuth('facebook')}
              disabled={loading}
              className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors py-3 md:py-4 text-sm md:text-base"
            >
              <Facebook className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Continue with Facebook
            </Button>
            <Button
              onClick={() => handleSocialAuth('discord')}
              disabled={loading}
              className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors py-3 md:py-4 text-sm md:text-base"
            >
              <svg className="mr-2 h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </Button>
          </div>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
