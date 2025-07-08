
import React, { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePdfReport } from '@/hooks/usePdfReport';
import RadarChart from './RadarChart';

interface DownloadPdfButtonProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
    insights?: any;
  };
}

const DownloadPdfButton = ({ data }: DownloadPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { handleDownloadReport } = usePdfReport(
    chartsRef,
    { current: null }, // insightsRef - not needed for pulse check
    { current: null }, // architectRef - not needed for pulse check
    { current: null }, // timelineRef - not needed for pulse check
    undefined // futureSelfArchitect - not needed for pulse check
  );

  const generatePdf = async () => {
    console.log('[DownloadPdfButton] PDF generation started', { data });
    
    if (!chartsRef.current) {
      console.error('[DownloadPdfButton] Chart ref not found');
      toast({
        title: "Error",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('[DownloadPdfButton] Generating PDF...');
      await handleDownloadReport();
      
      console.log('[DownloadPdfButton] PDF generated successfully');
      
      toast({
        title: "PDF Downloaded!",
        description: "Your pulse check results have been saved as a PDF.",
      });

    } catch (error) {
      console.error('[DownloadPdfButton] PDF generation failed:', error);
      
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={generatePdf}
        disabled={isGenerating}
        variant="outline"
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
            Generating PDF...
          </>
        ) : (
          <>
            <Download size={18} className="mr-2" />
            Download as PDF
          </>
        )}
      </Button>

      {/* Hidden component for PDF generation */}
      <div className="fixed top-0 left-0 w-1 h-1 overflow-hidden pointer-events-none opacity-0 scale-[0.001]">
        <div ref={chartsRef} className="w-[800px] h-[600px] bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pulse Check Results
            </h1>
          </div>
          <RadarChart data={data} insights={data.insights} />
        </div>
      </div>
    </>
  );
};

export default DownloadPdfButton;
