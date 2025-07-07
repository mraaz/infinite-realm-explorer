import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { savePulseCheckData } from '@/utils/pulseCheckStorage';

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

  const handleAuthRedirect = () => {
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

    // Close modal and redirect to auth page
    onOpenChange(false);
    window.location.href = '/auth';
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

          <Button
            onClick={handleAuthRedirect}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105"
          >
            <UserPlus size={18} className="mr-2" />
            Sign Up to Share Results
          </Button>

          <p className="text-center text-xs text-gray-500">
            Sign up to unlock magic links and start sharing your results with friends
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PulseCheckLoginModal;