/*
================================================================================
File: /components/ResultsActions.tsx
================================================================================
- This component contains the "Share" and "Print / Save as PDF" buttons.
- The buttons have been completely restyled to match the dark theme.
*/
import { useState } from "react";
import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ShareDialog from "./ShareDialog";

interface ResultsActionsProps {
  isArchitectComplete: boolean;
  onDownload: () => void;
}

const ResultsActions = ({
  isArchitectComplete,
  onDownload,
}: ResultsActionsProps) => {
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
          title: "My Life View Results",
          text: "Check out my Life View assessment results!",
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
      <section className="no-print flex flex-col sm:flex-row justify-center items-center gap-4 my-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleShareClick}
          className="w-full sm:w-auto justify-center font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Share2 size={18} className="mr-2" />
          Share My Life View
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleDownloadClick}
          className="w-full sm:w-auto justify-center font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Download size={18} className="mr-2" />
          Print / Save as PDF
        </Button>
      </section>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
    </>
  );
};

export default ResultsActions;
