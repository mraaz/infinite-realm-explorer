import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareLinkModal = ({ isOpen, onClose, shareUrl }: ShareLinkModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Copy failed:', error);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard.",
      });
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Magic Link Created! ✨
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 mt-2">
            Share this link with your friends to show them your pulse check results.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* URL Display */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-sm text-gray-300 break-all font-mono">
              {shareUrl}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              onClick={handleOpenLink}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <ExternalLink size={16} className="mr-2" />
              Preview
            </Button>
          </div>
          
          {/* Helper Text */}
          <p className="text-xs text-gray-400 text-center">
            This link will expire in 7 days. Anyone with this link can view your results.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkModal;