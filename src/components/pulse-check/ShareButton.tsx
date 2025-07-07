
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
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [error, setError] = useState<string>('');
  const shareableRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn } = useAuth();

  const generateShareableImage = async (): Promise<Blob | null> => {
    if (!shareableRef.current) return null;

    try {
      setIsGenerating(true);
      setError('');
      
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
      setError('Failed to generate image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareImage = async () => {
    setIsSharing(true);
    setError('');
    
    try {
      const imageBlob = await generateShareableImage();
      
      if (!imageBlob) {
        throw new Error('Failed to generate image');
      }

      const shareData = {
        title: 'Life Path Pulse Check',
        text: 'Check out my pulse check results across the four key areas of life! Take your own at infinitegame.life',
        url: 'https://infinitegame.life'
      };

      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare?.({ files: [new File([imageBlob], 'pulse-check.png', { type: 'image/png' })] })) {
        const file = new File([imageBlob], 'pulse-check-results.png', { type: 'image/png' });
        await navigator.share({
          ...shareData,
          files: [file]
        });
      } else {
        // Fallback: Download image and copy text
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pulse-check-results.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Copy share text to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          alert('Image downloaded and share text copied to clipboard!');
        } else {
          alert('Image downloaded! Share it with the text: ' + shareData.text + ' ' + shareData.url);
        }
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      setError('Failed to share image');
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!isLoggedIn) {
      // Redirect to login with current page as callback
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/?login=true&redirect=${currentUrl}`;
      return;
    }

    setIsCreatingLink(true);
    setError('');
    
    try {
      const token = localStorage.getItem('infinitelife_jwt');
      console.log('[ShareButton] JWT token check:', token ? 'Found' : 'Missing');
      
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }

      console.log('[ShareButton] Calling share-pulse-results function with data:', data);

      const { data: responseData, error } = await supabase.functions.invoke('share-pulse-results', {
        body: { resultsData: data },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[ShareButton] Function response:', { responseData, error });

      if (error) {
        console.error('[ShareButton] Supabase function error:', error);
        throw error;
      }

      if (responseData?.error) {
        console.error('[ShareButton] Function returned error:', responseData.error);
        if (responseData.error === 'Daily share limit reached') {
          setError(responseData.message || 'You have reached your daily sharing limit. Try again tomorrow!');
        } else if (responseData.error === 'Authentication required' || responseData.error === 'Invalid authentication token' || responseData.error === 'Token expired') {
          setError('Please sign in again to share your results.');
        } else {
          setError(responseData.message || 'Failed to create share link');
        }
        return;
      }

      if (!responseData?.shareUrl) {
        throw new Error('No share URL received');
      }

      setShareUrl(responseData.shareUrl);
      console.log('[ShareButton] Share URL created:', responseData.shareUrl);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(responseData.shareUrl);
        alert(`Magic link created and copied to clipboard! You have ${responseData.sharesRemaining || 0} shares remaining today.`);
      } else {
        alert(`Magic link created: ${responseData.shareUrl}\n\nYou have ${responseData.sharesRemaining || 0} shares remaining today.`);
      }

    } catch (error) {
      console.error('[ShareButton] Error creating share link:', error);
      setError(error instanceof Error ? error.message : 'Failed to create share link');
    } finally {
      setIsCreatingLink(false);
      setShowShareMenu(false);
    }
  };

  const handleMainButtonClick = () => {
    if (isLoggedIn) {
      setShowShareMenu(!showShareMenu);
    } else {
      handleShareImage();
    }
  };

  return (
    <div className="relative">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Main Share Button */}
      <button
        onClick={handleMainButtonClick}
        disabled={isGenerating || isSharing || isCreatingLink}
        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center gap-2 md:gap-3">
          <Share className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isGenerating || isSharing || isCreatingLink ? 'animate-spin' : 'group-hover:rotate-12'}`} />
          <span className="relative text-sm md:text-base">
            {isGenerating 
              ? 'Creating Image...' 
              : isSharing 
                ? 'Sharing...' 
                : isCreatingLink
                  ? 'Creating Link...'
                  : 'Invite A Friend'
            }
          </span>
        </div>

        {/* Shine effect animation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>
      </button>

      {/* Share Options Menu - Only shown for authenticated users */}
      {showShareMenu && isLoggedIn && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden z-10">
          <button
            onClick={handleShareImage}
            disabled={isGenerating || isSharing}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-sm"
          >
            <Share className="w-4 h-4" />
            Share Image
          </button>
          <button
            onClick={handleCreateShareLink}
            disabled={isCreatingLink}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-sm border-t border-white/10"
          >
            <Share className="w-4 h-4" />
            {isCreatingLink ? 'Creating Magic Link...' : 'Create Magic Link'}
          </button>
        </div>
      )}

      {/* Login Prompt for Guests */}
      {!isLoggedIn && (
        <p className="text-gray-400 text-xs mt-2 text-center">
          <button 
            onClick={() => {
              const currentUrl = encodeURIComponent(window.location.href);
              window.location.href = `/?login=true&redirect=${currentUrl}`;
            }}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Sign in
          </button> to create magic links for easy sharing
        </p>
      )}

      {/* Hidden shareable image component */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <ShareableResultImage ref={shareableRef} data={data} />
      </div>
    </div>
  );
};

export default ShareButton;
