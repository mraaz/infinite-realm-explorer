
import React, { useState, useRef } from 'react';
import { Share } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareableResultImage from './ShareableResultImage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ShareButtonProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareButton: React.FC<ShareButtonProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareableRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn } = useAuth();

  const generateShareableImage = async (): Promise<Blob | null> => {
    if (!shareableRef.current) return null;

    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(shareableRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false
      });

      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.9);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthPrompt = () => {
    // Store current path to return after login
    localStorage.setItem('preLoginPath', window.location.pathname);
    // Redirect to login page
    window.location.href = '/auth';
  };

  const handleShare = async () => {
    if (!isLoggedIn || !user) {
      handleAuthPrompt();
      return;
    }

    setIsSharing(true);
    
    try {
      // Create shared result in database
      const { data: shareResult, error } = await supabase.functions.invoke('create-shared-result', {
        body: {
          results_data: data,
          user_display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous User',
          user_email: user.email || ''
        }
      });

      if (error) {
        console.error('Error creating shared result:', error);
        alert('Sorry, there was an error creating your shareable link. Please try again.');
        return;
      }

      const shareUrl = `${window.location.origin}/shared/${shareResult.share_token}`;
      const imageBlob = await generateShareableImage();
      
      const shareData = {
        title: 'Life Path Pulse Check Results',
        text: `Check out my pulse check results! Take your own at ${window.location.origin}`,
        url: shareUrl
      };

      // Check if Web Share API is supported and can share files
      if (navigator.share && imageBlob && navigator.canShare?.({ files: [new File([imageBlob], 'pulse-check.png', { type: 'image/png' })] })) {
        const file = new File([imageBlob], 'pulse-check-results.png', { type: 'image/png' });
        await navigator.share({
          ...shareData,
          files: [file]
        });
      } else {
        // Fallback: Copy link to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          alert('Share link copied to clipboard! You can now paste it anywhere to share your results.');
        } else {
          // Final fallback: show the link
          prompt('Copy this link to share your results:', shareUrl);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Sorry, there was an error sharing your results. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating || isSharing}
        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center gap-2 md:gap-3">
          <Share className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isGenerating || isSharing ? 'animate-spin' : 'group-hover:rotate-12'}`} />
          <span className="relative text-sm md:text-base">
            {isGenerating 
              ? 'Creating Image...' 
              : isSharing 
                ? 'Sharing...' 
                : isLoggedIn 
                  ? 'Share Results'
                  : 'Login to Share'
            }
          </span>
        </div>

        {/* Shine effect animation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>
      </button>

      {/* Hidden shareable image component */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <ShareableResultImage ref={shareableRef} data={data} />
      </div>
    </>
  );
};

export default ShareButton;
