
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, MessageCircle, Twitter } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SurveyCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMakePublic: () => Promise<{ success: boolean; publicSlug: string | null }>;
}

export const SurveyCompletionDialog: React.FC<SurveyCompletionDialogProps> = ({
  isOpen,
  onClose,
  onMakePublic,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMakePublic = async () => {
    setIsSharing(true);
    const result = await onMakePublic();
    if (result.success && result.publicSlug) {
      setPublicSlug(result.publicSlug);
      toast({
        title: "Shareable Link Created!",
        description: "Your results are now ready to share.",
      });
    }
    setIsSharing(false);
  };

  const handleViewResults = () => {
    navigate('/results');
    onClose();
  };

  const handleCopyLink = async () => {
    if (!publicSlug) return;
    
    const shareUrl = `${window.location.origin}/results/${publicSlug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    if (!publicSlug) return;
    
    const shareUrl = `${window.location.origin}/results/${publicSlug}`;
    const shareText = "Check out my Life View assessment results!";
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
              alt="Infinite Game Logo" 
              className="h-12 w-12 md:h-16 md:w-16"
            />
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎉 Survey Complete!
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm md:text-base">
            Your 5-Year Snapshot is ready! View your personalized results and insights.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <Button
            onClick={handleViewResults}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 py-3 text-sm md:text-base"
          >
            View Your Results
          </Button>
          
          {!publicSlug ? (
            <Button
              onClick={handleMakePublic}
              disabled={isSharing}
              variant="outline"
              className="w-full py-3 text-sm md:text-base"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isSharing ? 'Creating Share Link...' : 'Share Your Results'}
            </Button>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Share Options</span>
                </div>
              </div>
              
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full py-3 text-sm md:text-base"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link to Results
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  variant="outline"
                  className="py-3 text-sm"
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleSocialShare('twitter')}
                  variant="outline"
                  className="py-3 text-sm"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare('whatsapp')}
                  variant="outline"
                  className="py-3 text-sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleSocialShare('sms')}
                  variant="outline"
                  className="py-3 text-sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  SMS
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
