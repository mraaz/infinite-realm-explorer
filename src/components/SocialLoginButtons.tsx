
import React from 'react';
import { Facebook, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSocialAuth } from '@/hooks/useSocialAuth';

interface SocialLoginButtonsProps {
  onLoginClick?: () => void;
}

const SocialLoginButtons = ({ onLoginClick }: SocialLoginButtonsProps) => {
  const { handleLoginClick } = useSocialAuth();

  const handleProviderClick = (provider: 'google' | 'facebook' | 'discord') => {
    // Call the optional callback (e.g., to close modal)
    onLoginClick?.();
    // Handle the actual login
    handleLoginClick(provider);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleProviderClick('google')}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        variant="outline"
        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <Button
        disabled={true}
        className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors opacity-50 cursor-not-allowed"
        variant="outline"
        style={{ backgroundColor: '#1877f2', borderColor: '#1877f2' }}
      >
        <Facebook className="w-5 h-5" />
        Continue with Facebook (Coming Soon)
      </Button>

      <Button
        onClick={() => handleProviderClick('discord')}
        className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        variant="outline"
        style={{ backgroundColor: '#5865f2', borderColor: '#5865f2' }}
      >
        <MessageCircle className="w-5 h-5" />
        Continue with Discord
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
