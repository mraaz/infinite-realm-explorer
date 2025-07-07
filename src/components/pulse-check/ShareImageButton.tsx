
import React, { useState, useRef } from 'react';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import ShareableResultImage from './ShareableResultImage';
import { useAuth } from '@/contexts/AuthContext';
import { isGuestMode } from '@/utils/guestUtils';

interface ShareImageButtonProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareImageButton = ({ data }: ShareImageButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isGuest = isGuestMode();

  const generateImage = async () => {
    console.log('[ShareImageButton] Image generation started', { user: !!user, isGuest, data });
    
    if (!imageRef.current) {
      console.error('[ShareImageButton] Image ref not found');
      toast({
        title: "Error",
        description: "Unable to generate image. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('[ShareImageButton] Generating canvas...');
      
      // Generate canvas with enhanced options
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: '#1a1b3a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        width: 600,
        height: 800
      });

      console.log('[ShareImageButton] Canvas generated successfully');

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to create image blob');
          }
        }, 'image/png', 1.0);
      });

      console.log('[ShareImageButton] Blob created, size:', blob.size);

      // Try native sharing first (mobile)
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        try {
          const file = new File([blob], 'pulse-check-results.png', { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            console.log('[ShareImageButton] Attempting native image share...');
            await navigator.share({
              title: 'My Life Path Pulse Check Results',
              text: 'Check out my Life Path Pulse Check results!',
              files: [file]
            });
            
            console.log('[ShareImageButton] Native image share successful');
            toast({
              title: "Image Shared!",
              description: "Your pulse check results image has been shared successfully.",
            });
            return;
          }
        } catch (shareError) {
          console.log('[ShareImageButton] Native image share failed:', shareError);
          // Fall through to download
        }
      }

      // Fallback to download
      console.log('[ShareImageButton] Falling back to download...');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pulse-check-results.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('[ShareImageButton] Image download triggered');
      
      toast({
        title: "Image Downloaded!",
        description: "Your pulse check results image has been saved to your device.",
      });

    } catch (error) {
      console.error('[ShareImageButton] Image generation failed:', error);
      
      let errorMessage = 'Failed to generate image. Please try again.';
      
      if (error.message.includes('canvas') || error.message.includes('CORS')) {
        errorMessage = 'Image generation blocked by browser security. Please try downloading instead.';
      }
      
      toast({
        title: "Image Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={generateImage}
        disabled={isGenerating}
        variant="outline"
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
            Generating...
          </>
        ) : (
          <>
            <Image size={18} className="mr-2" />
            Share as Image
          </>
        )}
      </Button>

      {/* Hidden component for image generation */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <ShareableResultImage ref={imageRef} data={data} />
      </div>
    </>
  );
};

export default ShareImageButton;
