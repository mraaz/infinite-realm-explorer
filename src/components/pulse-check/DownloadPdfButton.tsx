
import React, { useState, useRef, useEffect } from 'react';
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
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { handleDownloadReport } = usePdfReport(
    pdfContentRef,
    { current: null },
    { current: null },
    { current: null },
    undefined
  );

  const generatePdf = async () => {
    console.log('[DownloadPdfButton] PDF generation started', { data });
    
    if (!pdfContentRef.current) {
      console.error('[DownloadPdfButton] PDF content ref not found');
      toast({
        title: "Error",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('[DownloadPdfButton] Starting PDF generation...');
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
        description: error.message || "Failed to generate PDF. Please try again.",
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

      {/* PDF Content - properly sized and styled for capture */}
      <div 
        ref={pdfContentRef} 
        className="fixed top-[-9999px] left-[-9999px] w-[800px] bg-white p-8"
        style={{ 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pulse Check Results
          </h1>
          <p className="text-lg text-gray-600">
            Life Path Analysis from infinitegame.life
          </p>
        </div>
        
        <div className="flex justify-center">
          <div style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
            <RadarChart data={data} insights={data.insights} />
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p>Visit infinitegame.life for more insights</p>
        </div>
      </div>
    </>
  );
};

export default DownloadPdfButton;
