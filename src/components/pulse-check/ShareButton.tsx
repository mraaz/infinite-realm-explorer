
import React, { useState, useRef } from 'react';
import { Share } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareableResultImage from './ShareableResultImage';

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

  const handleShare = async () => {
    setIsSharing(true);
    
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
                : 'Invite A Friend'
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
