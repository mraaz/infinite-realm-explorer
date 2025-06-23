/* ================================================================================
File: /components/SocialLoginButtons.tsx
================================================================================
- This component now contains the redesigned buttons.
- All <img> tags are replaced with inline SVGs for reliability and color control.
- A conditional "Continue as Guest" option has been added.
*/
import React from 'react';
import { Button } from "@/components/ui/button";
// Assuming useSocialAuth is in your project
// import { useSocialAuth } from '@/hooks/useSocialAuth'; 

interface SocialLoginButtonsProps {
  onLoginClick?: () => void;
  showGuestOption?: boolean;
}

const SocialLoginButtons = ({ onLoginClick, showGuestOption = false }: SocialLoginButtonsProps) => {
  // const { handleLoginClick } = useSocialAuth(); // This would be your real hook
  
  // Placeholder function for demonstration
  const handleLoginClick = (provider: string) => {
    console.log('Login with', provider);
  };


  const handleProviderClick = (provider: 'google' | 'facebook' | 'discord') => {
    onLoginClick?.();
    handleLoginClick(provider);
  };

  return (
    <div className="space-y-4">
      {/* --- Google Button --- */}
      <Button
        onClick={() => handleProviderClick('google')}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-6 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ease-in-out border-2 border-gray-700 hover:border-purple-500 transform hover:-translate-y-1"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.96273 14.4205 5.26091 13.0123 4.64182 11.1H1.61816V13.4386C3.09818 16.2273 5.82727 18 9 18Z" fill="#34A853"/>
          <path d="M4.64182 11.1C4.43455 10.4959 4.32273 9.85455 4.32273 9.18182C4.32273 8.50909 4.43455 7.86773 4.62727 7.26364V4.925H1.61816C0.947727 6.225 0.556364 7.66364 0.556364 9.18182C0.556364 10.7 0.947727 12.1386 1.61816 13.4386L4.64182 11.1Z" fill="#FBBC05"/>
          <path d="M9 3.94091C10.3227 3.94091 11.5173 4.42045 12.4782 5.32818L15.0218 2.78455C13.4673 1.28409 11.43 0.363636 9 0.363636C5.82727 0.363636 3.09818 2.13636 1.61816 4.925L4.62727 7.26364C5.26091 5.35227 6.96273 3.94091 9 3.94091Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <Button
        disabled={true}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-6 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ease-in-out border-2 border-gray-700 hover:border-purple-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325V22.675C0 23.407 0.593 24 1.325 24H12.82V14.706H9.692V11.084H12.82V8.413C12.82 5.313 14.713 3.625 17.479 3.625C18.802 3.625 19.922 3.727 20.272 3.772V7.22H18.357C16.852 7.22 16.564 7.927 16.564 8.723V11.084H20.188L19.642 14.706H16.564V24H22.675C23.407 24 24 23.407 24 22.675V1.325C24 0.593 23.407 0 22.675 0Z"/>
        </svg>
        Continue with Facebook
      </Button>

      <Button
        onClick={() => handleProviderClick('discord')}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-6 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ease-in-out border-2 border-gray-700 hover:border-purple-500 transform hover:-translate-y-1"
      >
        <svg width="25" height="19" viewBox="0 0 25 19" fill="#5865F2" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
          <path d="M21.0254 0.53125C19.4354 0.08125 17.8029 0 16.1491 0C14.8029 0 13.4841 0.225 12.2491 0.61875C11.0141 0.225 9.69536 0 8.34911 0C6.69536 0 5.06286 0.08125 3.47286 0.53125C0.442859 3.44375 -0.428389 6.2125 0.150361 8.9375C1.62536 10.15 3.16911 10.95 4.78036 11.5312C5.32161 10.875 5.79036 10.1688 6.18911 9.41875C5.55661 9.1125 4.96536 8.7625 4.41661 8.36875C4.55036 8.28125 4.68411 8.19375 4.81161 8.10625C8.25036 10.1562 11.9691 10.7438 15.6879 10.1562C16.1191 10.425 16.5316 10.6562 16.9254 10.8625C18.4379 10.1375 19.8166 9.175 20.9879 8.0125C21.6504 6.01875 21.3691 3.93125 21.0254 0.53125ZM8.34411 7.85C7.39411 7.85 6.61286 7.0375 6.61286 6.05C6.61286 5.0625 7.38786 4.25 8.34411 4.25C9.30036 4.25 10.0816 5.0625 10.0754 6.05C10.0754 7.0375 9.30036 7.85 8.34411 7.85ZM16.1504 7.85C15.2004 7.85 14.4191 7.0375 14.4191 6.05C14.4191 5.0625 15.1941 4.25 16.1504 4.25C17.1066 4.25 17.8879 5.0625 17.8816 6.05C17.8816 7.0375 17.1066 7.85 16.1504 7.85Z"/>
        </svg>
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