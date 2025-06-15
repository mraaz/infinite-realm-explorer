
import { Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ResultsActionsProps {
  isArchitectComplete: boolean;
  onDownload: () => void;
}

const ResultsActions = ({ isArchitectComplete, onDownload }: ResultsActionsProps) => {
  const { toast } = useToast();

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

  return (
    <section className="no-print flex flex-col sm:flex-row justify-center items-center gap-4">
      <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center font-semibold">
        <Share2 size={18} className="mr-2" />
        Share My Life View
      </Button>
      <Button variant="outline" size="lg" onClick={handleDownloadClick} className="w-full sm:w-auto justify-center font-semibold">
        <Download size={18} className="mr-2" />
        Download Full Report
      </Button>
    </section>
  );
};

export default ResultsActions;
