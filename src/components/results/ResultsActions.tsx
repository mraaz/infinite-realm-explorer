
import { useState } from 'react';
import { Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ShareDialog from './ShareDialog';

interface ResultsActionsProps {
  isArchitectComplete: boolean;
  onDownload: () => void;
}

const ResultsActions = ({ isArchitectComplete, onDownload }: ResultsActionsProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDownloadClick = () => {
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
          <Share2 size={18} className="mr-2" />
          Share My Life View
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleDownloadClick} 
          className="w-full sm:w-auto justify-center font-semibold"
        >
          <Download size={18} className="mr-2" />
          Print / Save as PDF
        </Button>
      </section>
      
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
      />
    </>
  );
};

export default ResultsActions;
