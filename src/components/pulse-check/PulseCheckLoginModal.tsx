
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { savePulseCheckData } from '@/utils/pulseCheckStorage';
import SocialLoginButtons from '@/components/SocialLoginButtons';

interface PulseCheckLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulAuth?: () => void;
  pulseCheckData?: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const PulseCheckLoginModal = ({ 
  open, 
  onOpenChange, 
  onSuccessfulAuth,
  pulseCheckData 
}: PulseCheckLoginModalProps) => {

  const handleLoginClick = () => {
    // Save pulse check data before authentication if provided
    if (pulseCheckData) {
      savePulseCheckData(pulseCheckData);
    }

    // Store return information for after auth
    sessionStorage.setItem('pulse_check_auth_return', JSON.stringify({
      data: pulseCheckData,
      returnUrl: window.location.href,
      action: 'share'
    }));

    // Close modal - the SocialLoginButtons will handle the authentication flow
    onOpenChange(false);
  };

  const handleModalClose = (open: boolean) => {
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-sm border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Share Your Pulse Check
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-4">
              Create an account to generate magic links and share your results with friends
            </p>
          </div>

          <SocialLoginButtons 
            onLoginClick={handleLoginClick}
            inModal={true}
          />

          <p className="text-center text-xs text-gray-500">
            Sign up to unlock magic links and start sharing your results with friends
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PulseCheckLoginModal;
