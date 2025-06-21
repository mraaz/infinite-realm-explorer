
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, Eye } from "lucide-react";
import { SocialShareButtons } from './SocialShareButtons';
import { logDebug } from '@/utils/logger';

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
  const [showShareButtons, setShowShareButtons] = useState(false);

  const handleMakePublic = async () => {
    setIsSharing(true);
    logDebug("Making survey public...");
    
    try {
      const result = await onMakePublic();
      if (result.success && result.publicSlug) {
        setPublicSlug(result.publicSlug);
        setShowShareButtons(true);
        logDebug("Survey made public with slug:", result.publicSlug);
      }
    } catch (error) {
      logDebug("Error making survey public:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleViewResults = () => {
    logDebug("Navigating to results page");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Survey Complete! 🎉
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm md:text-base">
            Your 5-Year Snapshot is ready! View your personalized insights and start building your future self.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {!showShareButtons ? (
            <>
              <Button
                onClick={handleViewResults}
                className="w-full py-3 text-sm md:text-base"
              >
                <Eye className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                View Your Results
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Want to share?</span>
                </div>
              </div>
              
              <Button
                onClick={handleMakePublic}
                disabled={isSharing}
                variant="outline"
                className="w-full py-3 text-sm md:text-base"
              >
                <Share2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                {isSharing ? 'Creating Share Link...' : 'Share My Results'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Share Your Results</h3>
                <p className="text-sm text-gray-600">
                  Your results are now public! Share your journey with others:
                </p>
              </div>
              
              <div className="flex justify-center">
                <SocialShareButtons publicSlug={publicSlug!} />
              </div>
              
              <Button
                onClick={handleViewResults}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800 text-sm md:text-base"
              >
                <Eye className="mr-2 h-4 w-4" />
                View My Results
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
