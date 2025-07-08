
import { RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
      const margin = 15; // 15mm margin
      const contentWidth = pdfWidth - (margin * 2);
      const pageContentHeight = pdfPageHeight - (margin * 2);

      // Function to temporarily show PDF-only elements
      const showPdfElements = () => {
        const pdfOnlyElements = document.querySelectorAll('.pdf-only');
        pdfOnlyElements.forEach(element => {
          (element as HTMLElement).style.setProperty('display', 'block', 'important');
        });
      };

      // Function to hide PDF-only elements again
      const hidePdfElements = () => {
        const pdfOnlyElements = document.querySelectorAll('.pdf-only');
        pdfOnlyElements.forEach(element => {
          (element as HTMLElement).style.setProperty('display', 'none', 'important');
        });
      };

      const appendContentAsImage = async (element: HTMLElement, isFirstPage = false) => {
        // Show PDF elements before capturing
        showPdfElements();
        
        // Use improved html2canvas options to avoid document.write issues
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          logging: false,
          imageTimeout: 0,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // Ensure no document.write calls in cloned document
            const scripts = clonedDoc.getElementsByTagName('script');
            for (let i = scripts.length - 1; i >= 0; i--) {
              scripts[i].parentNode?.removeChild(scripts[i]);
            }
          }
        });
        
        // Hide PDF elements after capturing
        hidePdfElements();
        
        const imgData = canvas.toDataURL('image/png', 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        if (!isFirstPage) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
        heightLeft -= pageContentHeight;

        while (heightLeft > 0) {
          position -= pageContentHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, imgHeight);
          heightLeft -= pageContentHeight;
        }
      };
      
      // Page 1: Charts
      const chartsElement = chartsRef.current;
      if (chartsElement) {
        await appendContentAsImage(chartsElement, true);
      }

      // Page 2: Insights
      const insightsElement = insightsRef.current;
      if (insightsElement) {
        await appendContentAsImage(insightsElement);
      }

      // Page 3: Future Self Architect (if data exists)
      if (futureSelfArchitect && futureSelfArchitect.length > 0) {
        const architectElement = architectRef.current;
        if (architectElement) {
          await appendContentAsImage(architectElement);
        }
      }

      // Page 4: Habits Timeline (if completed habits exist)
      const completedHabits = futureSelfArchitect?.filter(h => h.isCompleted) || [];
      if (completedHabits.length > 0) {
        const timelineElement = timelineRef.current;
        if (timelineElement) {
          await appendContentAsImage(timelineElement);
        }
      }
      
      pdf.save('pulse-check-results.pdf');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  };

  return { handleDownloadReport };
};
