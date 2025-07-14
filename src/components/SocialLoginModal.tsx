import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { branding } from "@/config/branding";

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
      <DialogContent className="sm:max-w-md max-w-sm w-full mx-auto overflow-hidden">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">
            {/* --- MODIFICATION: Updated Title and added new subtitle --- */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl font-semibold text-white">
                Create an account to continue
              </span>
            </div>
            <p className="text-sm font-normal text-gray-400">
              Only logged-in users can proceed further. Creating an account
              saves your progress.
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4 w-full relative">
          <SocialLoginButtons onLoginClick={handleLoginClick} inModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLoginModal;
