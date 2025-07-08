
import { RefObject } from 'react';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { FutureSelfArchitect } from '@/types/results';

export const usePdfReport = (
  chartsRef: RefObject<HTMLDivElement>,
  insightsRef: RefObject<HTMLDivElement>,
  architectRef: RefObject<HTMLDivElement>,
  timelineRef: RefObject<HTMLDivElement>,
  futureSelfArchitect?: FutureSelfArchitect[]
) => {
  const handleDownloadReport = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - (margin * 2);
      const pageContentHeight = pdfPageHeight - (margin * 2);

      // Enhanced options for better SVG and cross-browser compatibility
      const captureOptions = {
        quality: 0.95,
        bgcolor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '800px',
          height: 'auto'
        },
        filter: (node: Node) => {
          // Filter out script tags that might cause issues
          if (node.nodeName === 'SCRIPT') return false;
          return true;
        }
      };

      const appendContentAsImage = async (element: HTMLElement, isFirstPage = false) => {
        console.log('[PDF] Capturing element:', element.className);
        
        let dataUrl: string;
        
        try {
          // Try dom-to-image first (best for SVG)
          dataUrl = await domtoimage.toPng(element, captureOptions);
          console.log('[PDF] Successfully captured with dom-to-image');
        } catch (error) {
          console.warn('[PDF] dom-to-image failed, trying fallback:', error);
          
          // Fallback: try with different options
          try {
            dataUrl = await domtoimage.toPng(element, {
              ...captureOptions,
              style: {
                ...captureOptions.style,
                fontFamily: 'Arial, sans-serif'
              }
            });
            console.log('[PDF] Fallback capture successful');
          } catch (fallbackError) {
            console.error('[PDF] All capture methods failed:', fallbackError);
            throw new Error('Failed to capture element for PDF generation');
          }
        }
        
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('Invalid image data generated');
        }

        const imgProps = pdf.getImageProperties(dataUrl);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        if (!isFirstPage) {
          pdf.addPage();
        }

        pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, imgHeight);
        heightLeft -= pageContentHeight;

        while (heightLeft > 0) {
          position -= pageContentHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', margin, position + margin, contentWidth, imgHeight);
          heightLeft -= pageContentHeight;
        }
      };
      
      // Page 1: Charts
      const chartsElement = chartsRef.current;
      if (chartsElement) {
        console.log('[PDF] Processing charts section');
        await appendContentAsImage(chartsElement, true);
      }

      // Page 2: Insights
      const insightsElement = insightsRef.current;
      if (insightsElement) {
        console.log('[PDF] Processing insights section');
        await appendContentAsImage(insightsElement);
      }

      // Page 3: Future Self Architect (if data exists)
      if (futureSelfArchitect && futureSelfArchitect.length > 0) {
        const architectElement = architectRef.current;
        if (architectElement) {
          console.log('[PDF] Processing architect section');
          await appendContentAsImage(architectElement);
        }
      }

      // Page 4: Habits Timeline (if completed habits exist)
      const completedHabits = futureSelfArchitect?.filter(h => h.isCompleted) || [];
      if (completedHabits.length > 0) {
        const timelineElement = timelineRef.current;
        if (timelineElement) {
          console.log('[PDF] Processing timeline section');
          await appendContentAsImage(timelineElement);
        }
      }
      
      // Add metadata to PDF
      pdf.setProperties({
        title: 'Pulse Check Results',
        subject: 'Life Path Analysis',
        author: 'Infinite Game',
        creator: 'infinitegame.life'
      });
      
      pdf.save('pulse-check-results.pdf');
      console.log('[PDF] PDF generated and saved successfully');
      
    } catch (error) {
      console.error('[PDF] Generation failed with details:', error);
      
      // Enhanced error reporting
      if (error.message?.includes('capture')) {
        throw new Error('Failed to capture content for PDF. Please try again or contact support.');
      } else if (error.message?.includes('Invalid image')) {
        throw new Error('PDF generation failed due to rendering issues. Please refresh the page and try again.');
      } else {
        throw new Error(`PDF generation failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return { handleDownloadReport };
};
