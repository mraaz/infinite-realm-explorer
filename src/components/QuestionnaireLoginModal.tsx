/*
================================================================================
File: /components/QuestionnaireLoginModal.tsx
================================================================================
- This is the corrected version of the modal.
- It now correctly uses the base DialogTitle and DialogDescription components
  to ensure text colors are readable on the dark theme.
- All hardcoded text color classes (like text-gray-900) have been removed.
*/
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SocialLoginButtons from "@/components/SocialLoginButtons";

interface QuestionnaireLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: () => void;
}

const QuestionnaireLoginModal = ({
  open,
  onOpenChange,
  onContinueAsGuest,
}: QuestionnaireLoginModalProps) => {
  const handleLoginClick = () => {
    // Close the modal before redirecting
    onOpenChange(false);
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <svg
              className="h-8 w-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              ></path>
            </svg>
            <DialogTitle>Save Your Progress!</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              This questionnaire takes about 5 minutes. Sign in to save your
              answers and continue anytime. If you proceed as a guest, you'll
              need to complete it all in one go.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="pt-4 space-y-4">
          <SocialLoginButtons onLoginClick={handleLoginClick} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e1e24] px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleContinueAsGuest}
            variant="outline"
            className="w-full bg-transparent hover:bg-gray-800 text-gray-300 font-medium py-6 px-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionnaireLoginModal;
