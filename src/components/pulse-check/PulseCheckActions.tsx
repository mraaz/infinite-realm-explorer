
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareDialog from './ShareDialog';
import { useAuth } from '@/contexts/AuthContext';
import { isGuestMode } from '@/utils/guestUtils';

interface PulseCheckActionsProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const PulseCheckActions = ({ data }: PulseCheckActionsProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { user } = useAuth();
  const isGuest = isGuestMode();

  const isAuthenticated = user && !isGuest;
  const buttonText = isAuthenticated ? 'Invite A Friend' : 'Share Results';

  return (
    <>
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setShareDialogOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Share2 size={20} className="mr-2" />
          {buttonText}
        </Button>
      </div>

      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen}
        data={data}
      />
    </>
  );
};

export default PulseCheckActions;
