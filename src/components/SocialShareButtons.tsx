
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logDebug } from '@/utils/logger';

interface SocialShareButtonsProps {
  publicSlug: string;
  title?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  publicSlug,
  title = "Check out my Life View assessment results!"
}) => {
  const { toast } = useToast();
  const shareUrl = `https://infinitegame.life/results/${publicSlug}`;
  const shareText = encodeURIComponent(title);
  const shareUrlEncoded = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      logDebug("Copied link to clipboard:", shareUrl);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (error) {
      logDebug("Failed to copy link:", error);
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleSMSShare = () => {
    const smsUrl = `sms:?body=${shareText} ${shareUrl}`;
    logDebug("Opening SMS share:", smsUrl);
    window.open(smsUrl, '_self');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${shareText} ${shareUrlEncoded}`;
    logDebug("Opening WhatsApp share:", whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`;
    logDebug("Opening Facebook share:", facebookUrl);
    window.open(facebookUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`;
    logDebug("Opening Twitter share:", twitterUrl);
    window.open(twitterUrl, '_blank');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have direct URL sharing, so we copy the link and suggest manual sharing
    handleCopyLink();
    toast({
      title: "Link copied for Instagram!",
      description: "Paste this link in your Instagram bio or story.",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <Button
        onClick={handleFacebookShare}
        variant="outline"
        className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2]"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button
        onClick={handleTwitterShare}
        variant="outline"
        className="w-full bg-black text-white hover:bg-gray-800 border-black"
      >
        <Share2 className="mr-2 h-4 w-4" />
        X (Twitter)
      </Button>
      
      <Button
        onClick={handleWhatsAppShare}
        variant="outline"
        className="w-full bg-[#25D366] text-white hover:bg-[#20BA5A] border-[#25D366]"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        onClick={handleSMSShare}
        variant="outline"
        className="w-full bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
      >
        <Send className="mr-2 h-4 w-4" />
        SMS
      </Button>
      
      <Button
        onClick={handleInstagramShare}
        variant="outline"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-transparent"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Instagram
      </Button>
      
      <Button
        onClick={handleCopyLink}
        variant="outline"
        className="w-full"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </Button>
    </div>
  );
};
