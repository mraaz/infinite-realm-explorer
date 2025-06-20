
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

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
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
