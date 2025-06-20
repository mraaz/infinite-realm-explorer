
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Welcome to Infinite Game</CardTitle>
          <CardDescription>Continue with your social account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              onClick={() => handleSocialAuth('facebook')}
              disabled={loading}
              className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5]"
            >
              <Facebook className="mr-2 h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
