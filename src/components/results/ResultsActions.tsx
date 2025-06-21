
import { useState } from 'react';
import { Share2, Download, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import ShareDialog from './ShareDialog';

interface ResultsActionsProps {
  isArchitectComplete: boolean;
  onDownload: () => void;
  isAuthenticated?: boolean;
}

const ResultsActions = ({ isArchitectComplete, onDownload, isAuthenticated = false }: ResultsActionsProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to download your results.",
      });
      navigate('/auth');
      return;
    }

    if (isArchitectComplete) {
      onDownload();
    } else {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Architect.",
      });
    }
  };

  const handleShareClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to share your results.",
      });
      navigate('/auth');
      return;
    }

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'My Life View Results',
          text: 'Check out my Life View assessment results!',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to dialog
        setShareDialogOpen(true);
      }
    } else {
      setShareDialogOpen(true);
    }
  };

  return (
    <>
      <section className="no-print flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleShareClick}
          className="w-full sm:w-auto justify-center font-semibold"
        >
          {isAuthenticated ? (
            <>
              <Share2 size={18} className="mr-2" />
              Share My Life View
            </>
          ) : (
            <>
              <LogIn size={18} className="mr-2" />
              Sign in to Share
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleDownloadClick} 
          className="w-full sm:w-auto justify-center font-semibold"
        >
          {isAuthenticated ? (
            <>
              <Download size={18} className="mr-2" />
              Print / Save as PDF
            </>
          ) : (
            <>
              <LogIn size={18} className="mr-2" />
              Sign in to Download
            </>
          )}
        </Button>
      </section>
      
      {isAuthenticated && (
        <ShareDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen} 
        />
      )}
    </>
  );
};

export default ResultsActions;
