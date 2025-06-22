
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SocialLoginButtons from '@/components/SocialLoginButtons';

interface QuestionnaireLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const QuestionnaireLoginModal = ({ open, onOpenChange, onContinueAsGuest }: QuestionnaireLoginModalProps) => {
  const handleLoginClick = () => {
    // Close the modal before redirecting
    onOpenChange(false);
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onOpenChange(false);
  };

  const handleModalClose = (isOpen: boolean) => {
    // Only close the modal, don't trigger guest mode
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/3ed0df40-9d9f-4016-bdba-991ba7a3468c.png" 
                alt="Infinite Life Logo" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-semibold text-gray-900">Save Your Progress!</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              This questionnaire takes about 5 minutes. Sign in to save your answers and continue anytime. 
              If you proceed as a guest, you'll need to complete it all in one go.
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4 space-y-4">
          <SocialLoginButtons onLoginClick={handleLoginClick} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            onClick={handleContinueAsGuest}
            variant="outline"
            className="w-full"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionnaireLoginModal;
