
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { AuthForm } from './AuthForm';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({ 
  children, 
  requireVerification = true 
}) => {
  const { user, loading, isVerified } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (requireVerification && !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account verification is in progress. Please wait a moment or contact support if this persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
