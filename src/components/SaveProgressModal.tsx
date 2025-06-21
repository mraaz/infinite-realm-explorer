
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chrome, Facebook } from "lucide-react";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { logDebug } from '@/utils/logger';

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress: () => void;
  onContinueWithoutSaving: () => void;
  currentAnswers?: Record<string, any>;
  currentStep?: number;
}

export const SaveProgressModal: React.FC<SaveProgressModalProps> = ({
  isOpen,
  onClose,
  onSaveProgress,
  onContinueWithoutSaving,
  currentAnswers = {},
  currentStep = 1,
}) => {
  const { signInWithProvider } = useSecureAuth();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    // Store progress before redirecting to auth
    localStorage.setItem('pendingAnswers', JSON.stringify(currentAnswers));
    localStorage.setItem('pendingStep', currentStep.toString());
    
    logDebug("Storing progress before social login:", { currentAnswers, currentStep, provider });
    
    const { error } = await signInWithProvider(provider);
    if (!error) {
      onSaveProgress();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
              alt="Infinite Game Logo" 
              className="h-12 w-12 md:h-16 md:w-16"
            />
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Save Your Progress?
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm md:text-base">
            You're making great progress! Would you like to save your results so far? 
            This way you can come back anytime and pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleSocialLogin('google')}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors py-3 text-sm md:text-base"
            >
              <Chrome className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Continue with Google
            </Button>
            <Button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors py-3 text-sm md:text-base"
            >
              <Facebook className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Continue with Facebook
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={onContinueWithoutSaving}
            className="w-full text-gray-600 hover:text-gray-800 text-sm md:text-base"
          >
            Continue without saving
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
