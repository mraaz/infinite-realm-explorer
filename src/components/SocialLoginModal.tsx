
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
}

const SocialLoginModal = ({ open, onOpenChange }: SocialLoginModalProps) => {
  const handleLoginClick = () => {
    // Close the modal before redirecting
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/3ed0df40-9d9f-4016-bdba-991ba7a3468c.png" 
                alt="Infinite Life Logo" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-semibold">Sign In</span>
            </div>
            <p className="text-sm font-normal">
              Choose your preferred sign-in method to continue
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <SocialLoginButtons onLoginClick={handleLoginClick} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLoginModal;
