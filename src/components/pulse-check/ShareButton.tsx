
import React, { useState } from 'react';
import { Share2, Copy, Check, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isGuestMode } from '@/utils/guestUtils';

interface ShareButtonProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareButton = ({ data }: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isGuest = isGuestMode();

  const handleSignUp = () => {
    // Remove guest parameter and redirect to auth
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('guest');
    window.location.href = '/auth';
  };

  const handleShare = async () => {
    console.log('[ShareButton] Share initiated', { user: !!user, isGuest, data });
    
    if (!user || isGuest) {
      console.log('[ShareButton] User not authenticated or in guest mode');
      toast({
        title: "Sign Up Required",
        description: "Create an account to generate magic links and share with friends",
        variant: "default"
      });
      return;
    }

    setIsSharing(true);

    try {
      // Get JWT token directly from localStorage (AWS JWT)
      const token = localStorage.getItem("infinitelife_jwt");
      console.log('[ShareButton] JWT token from localStorage:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.error('[ShareButton] No JWT token found in localStorage');
        throw new Error('No authentication token found. Please sign in again.');
      }

      console.log('[ShareButton] Calling edge function with token...');
      
      // Call the edge function with the AWS JWT token
      const { data: response, error } = await supabase.functions.invoke('share-pulse-results', {
        body: { resultsData: data },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('[ShareButton] Edge function response:', { response, error });

      if (error) {
        console.error('[ShareButton] Edge function error:', error);
        throw new Error(error.message || 'Failed to create share link');
      }

      if (!response || !response.success) {
        console.error('[ShareButton] Invalid response:', response);
        throw new Error(response?.message || 'Failed to create share link');
      }

      const shareUrl = response.shareUrl;
      console.log('[ShareButton] Share URL created:', shareUrl);

      // Try native sharing first, then fallback to copy
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          console.log('[ShareButton] Attempting native share...');
          await navigator.share({
            title: 'My Life Path Pulse Check Results',
            text: 'Check out my Life Path Pulse Check results!',
            url: shareUrl,
          });
          console.log('[ShareButton] Native share successful');
          
          toast({
            title: "Results Shared!",
            description: "Your pulse check results have been shared successfully.",
          });
          return;
        } catch (shareError) {
          console.log('[ShareButton] Native share failed, falling back to copy:', shareError);
          // Fall through to copy functionality
        }
      }

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        console.log('[ShareButton] URL copied to clipboard');
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        console.error('[ShareButton] Clipboard error:', clipboardError);
        
        // Final fallback - show the URL in a prompt
        prompt('Copy this share link:', shareUrl);
        
        toast({
          title: "Share Link Created",
          description: "Copy the link from the dialog box.",
        });
      }

    } catch (error) {
      console.error('[ShareButton] Sharing failed:', error);
      
      let errorMessage = 'Failed to create share link. Please try again.';
      
      if (error.message.includes('Authentication') || error.message.includes('sign in')) {
        errorMessage = 'Please sign in again to share your results.';
      } else if (error.message.includes('limit')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sharing Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // If user is not authenticated or is a guest, show sign up prompt
  if (!user || isGuest) {
    return (
      <Button
        onClick={handleSignUp}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105"
      >
        <UserPlus size={18} className="mr-2" />
        Sign Up for Magic Links
      </Button>
    );
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105"
    >
      {copied ? (
        <>
          <Check size={18} className="mr-2" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 size={18} className="mr-2" />
          {isSharing ? 'Creating Link...' : 'Create Magic Link'}
        </>
      )}
    </Button>
  );
};

export default ShareButton;
