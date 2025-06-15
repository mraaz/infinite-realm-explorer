
import { RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FutureSelfArchitect } from '@/types/results';

export const usePdfReport = (
  page1Ref: RefObject<HTMLDivElement>,
  page2Ref: RefObject<HTMLDivElement>,
  futureSelfArchitect?: FutureSelfArchitect[]
) => {
  const handleDownloadReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 15mm margin
    const contentWidth = pdfWidth - (margin * 2);
    const pageContentHeight = pdfPageHeight - (margin * 2);

    const appendContentAsImage = async (element: HTMLElement) => {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
      heightLeft -= pageContentHeight;

      while (heightLeft > 0) {
        position -= pageContentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, imgHeight);
        heightLeft -= pageContentHeight;
      }
    };
    
    const page1Element = page1Ref.current;
    if (page1Element) {
      await appendContentAsImage(page1Element);
    }

    if (futureSelfArchitect && futureSelfArchitect.length > 0) {
      const page2Element = page2Ref.current;
      if (page2Element) {
        pdf.addPage();
        await appendContentAsImage(page2Element);
      }
    }
    
    pdf.save('life-view-report.pdf');
  };

  return { handleDownloadReport };
};
