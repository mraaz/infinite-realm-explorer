/*
================================================================================
File: /components/SocialLoginModal.tsx
================================================================================
- This is the main dialog component.
- It now accepts a 'variant' prop to switch between 'signIn' and 'saveProgress'.
- The styling has been updated to match the dark theme.
*/
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SocialLoginButtons from '@/components/SocialLoginButtons';

interface SocialLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'signIn' | 'saveProgress'; // New prop to control modal content
}

const SocialLoginModal = ({ open, onOpenChange, variant = 'signIn' }: SocialLoginModalProps) => {
  
  const handleLoginClick = () => {
    // Close the modal before redirecting
    onOpenChange(false);
  };

  const titles = {
    signIn: {
      title: 'Infinite Life',
      subtitle: 'Sign in to your account'
    },
    saveProgress: {
      title: 'Save Your Progress!',
      subtitle: "This questionnaire takes about 5 minutes. Sign in to save your answers and continue anytime. If you proceed as a guest, you'll need to complete it all in one go."
    }
  }

  const currentContent = titles[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1e1e24] border-none shadow-2xl ring-1 ring-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            {variant === 'signIn' && (
              <div className="flex items-center justify-center space-x-2 mb-2">
                {/* Inline SVG for the logo */}
                <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                <span className="text-2xl font-semibold text-white">{currentContent.title}</span>
              </div>
            )}
            {variant === 'saveProgress' && (
                 <span className="text-2xl font-semibold text-white">{currentContent.title}</span>
            )}
            <p className="text-sm text-gray-400 font-normal whitespace-pre-line pt-2">
              {currentContent.subtitle}
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <SocialLoginButtons 
            onLoginClick={handleLoginClick} 
            showGuestOption={variant === 'saveProgress'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLoginModal;