
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShareButton from './ShareButton';
import ShareImageButton from './ShareImageButton';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareDialog = ({ open, onOpenChange, data }: ShareDialogProps) => {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Invite A Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <p className="text-center text-gray-300 text-sm">
            Share your pulse check results and get feedback from friends
          </p>
          
          <div className="space-y-3">
            <ShareButton data={data} />
            <ShareImageButton data={data} />
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Magic links expire after 7 days • Up to 25 shares per day
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
