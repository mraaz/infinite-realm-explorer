
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, MessageSquare, Send, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SurveyHistoryItem } from '@/hooks/useSurveyHistory';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: SurveyHistoryItem | null;
  imageDataUrl?: string;
}

const ShareModal = ({ open, onOpenChange, survey, imageDataUrl }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!survey) return null;

  const shareUrl = `https://infinitegame.life/results/${survey.id}`;
  const shareText = "Check out my Life Path results!";

  const handleDownloadImage = () => {
    if (imageDataUrl) {
      const link = document.createElement('a');
      link.download = `life-path-${survey.created_at.split('T')[0]}.png`;
      link.href = imageDataUrl;
      link.click();
      toast({
        title: "Image downloaded!",
        description: "Your Life Path snapshot has been saved.",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(smsUrl, '_self');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Life Path Snapshot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {imageDataUrl && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Download Image</h4>
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG Image
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Share Link</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="justify-start"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              
              <Button
                onClick={handleWhatsAppShare}
                variant="outline"
                className="justify-start bg-[#25D366] text-white hover:bg-[#20BA5A] border-[#25D366]"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              
              <Button
                onClick={handleSMSShare}
                variant="outline"
                className="justify-start bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
              >
                <Send className="mr-2 h-4 w-4" />
                SMS
              </Button>
              
              <Button
                onClick={handleFacebookShare}
                variant="outline"
                className="justify-start bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Facebook
              </Button>
              
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="justify-start bg-black text-white hover:bg-gray-800 border-black"
              >
                <Share2 className="mr-2 h-4 w-4" />
                X (Twitter)
              </Button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Instagram:</strong> Download the image above and share it manually in your story or post.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
