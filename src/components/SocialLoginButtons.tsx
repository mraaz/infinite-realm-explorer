
import React from 'react';
import { Button } from "@/components/ui/button";
import { useSocialAuth } from '@/hooks/useSocialAuth';

interface SocialLoginButtonsProps {
  onLoginClick?: () => void;
  showGuestOption?: boolean;
  inModal?: boolean;
}

const SocialLoginButtons = ({ onLoginClick, showGuestOption = false, inModal = false }: SocialLoginButtonsProps) => {
  const { handleLoginClick } = useSocialAuth();

  const handleProviderClick = (provider: 'google' | 'facebook' | 'discord') => {
    onLoginClick?.();
    handleLoginClick(provider);
  };

  // Remove problematic transforms when in modal
  const buttonClasses = inModal 
    ? "w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-6 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors duration-300 border-2 border-gray-700 hover:border-purple-500"
    : "w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-6 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ease-in-out border-2 border-gray-700 hover:border-purple-500 transform hover:-translate-y-1";

  return (
    <div className="space-y-4">
      {/* --- Google Button --- */}
      <Button
        onClick={() => handleProviderClick('google')}
        className={buttonClasses}
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
        className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <img 
          src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" 
          alt="Facebook logo"
          className="w-5 h-5"
        />
        Continue with Facebook
      </Button>

      <Button
        onClick={() => handleProviderClick('discord')}
        className={buttonClasses}
      >
        <img 
          src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg" 
          alt="Discord logo"
          className="w-6 h-6"
        />
        Continue with Discord
      </Button>
      
      {showGuestOption && (
        <>
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e1e24] px-2 text-gray-500">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-medium py-6 px-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
          >
            Continue as Guest
          </Button>
        </>
      )}
    </div>
  );
};

export default SocialLoginButtons;
