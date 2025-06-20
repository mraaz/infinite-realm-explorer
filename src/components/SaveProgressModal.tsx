
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

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress: () => void;
  onContinueWithoutSaving: () => void;
}

export const SaveProgressModal: React.FC<SaveProgressModalProps> = ({
  isOpen,
  onClose,
  onSaveProgress,
  onContinueWithoutSaving,
}) => {
  const { signInWithProvider } = useSecureAuth();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const { error } = await signInWithProvider(provider);
    if (!error) {
      onSaveProgress();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Save Your Progress?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            You're making great progress! Would you like to save your results so far? 
            This way you can come back anytime and pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleSocialLogin('google')}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5]"
            >
              <Facebook className="mr-2 h-4 w-4" />
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
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Continue without saving
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
