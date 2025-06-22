
import React from 'react';
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
        className="w-full bg-red-600 hover:bg-red-700 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        variant="outline"
        style={{ backgroundColor: '#f5f5f5', borderColor: '#dc2626' }}
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
          alt="Google logo" 
          className="w-5 h-5"
        />
        Continue with Google
      </Button>

      <Button
        disabled={true}
        className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors opacity-50 cursor-not-allowed"
        variant="outline"
        style={{ backgroundColor: '#1877f2', borderColor: '#1877f2' }}
      >
        <img 
          src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" 
          alt="Facebook logo" 
          className="w-5 h-5"
        />
        Continue with Facebook (Coming Soon)
      </Button>

      <Button
        onClick={() => handleProviderClick('discord')}
        className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
        variant="outline"
        style={{ backgroundColor: '#5865f2', borderColor: '#5865f2' }}
      >
        <img 
          src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d7f4ef6498ac018f2c55_Symbol.svg" 
          alt="Discord logo" 
          className="w-5 h-5"
        />
        Continue with Discord
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
