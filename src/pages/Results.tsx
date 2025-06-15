import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';
import ResultsHeader from '@/components/results/ResultsHeader';
import ChartsSection from '@/components/results/ChartsSection';
import InsightSynthesis from '@/components/results/InsightSynthesis';
import FutureSelfArchitectSection from '@/components/results/FutureSelfArchitectSection';
import ResultsActions from '@/components/results/ResultsActions';
import ResultsFooter from '@/components/results/ResultsFooter';
import insightSyntheses from '@/data/insights.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Results = () => {
  const { answers, actions } = useQuestionnaireStore();
  const { getProgress, startRetake } = actions;
  
  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  // Mock data based on the image for placeholder content
  const mockProgress: PillarProgress = {
    basics: 75,
    career: 80,
    financials: 60,
    health: 90,
    connections: 70,
  };

  const progress: PillarProgress = (() => {
    const answeredQuestionsCount = Object.keys(answers).length;
    if (answeredQuestionsCount === 0) {
      return mockProgress;
    }
    const { pillarPercentages } = getProgress();
    return {
      basics: 75, // Placeholder for basics as its scoring is not defined in getProgress
      career: pillarPercentages.Career ?? 0,
      financials: pillarPercentages.Finances ?? 0,
      health: pillarPercentages.Health ?? 0,
      connections: pillarPercentages.Connections ?? 0,
    };
  })();

  // Default data for the future self chart.
  const defaultFutureProgress: PillarProgress = {
    basics: 80,
    career: 95,
    financials: 85,
    health: 90,
    connections: 80,
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { futureQuestionnaire, futureSelfArchitect: initialArchitect, futureProgress: locationFutureProgress } = location.state || {};
  
  const isFutureQuestionnaireComplete = !!futureQuestionnaire;

  const futureProgress = locationFutureProgress || (isFutureQuestionnaireComplete ? defaultFutureProgress : {
    basics: 0,
    career: 0,
    financials: 0,
    health: 0,
    connections: 0,
  });

  let futureSelfArchitect: { mainFocus: string; identity: string; system: string; proof: string; } | undefined = initialArchitect;

  if (futureQuestionnaire && futureQuestionnaire.priorities && futureQuestionnaire.architect) {
      const { priorities, architect: architectAnswers } = futureQuestionnaire;
      const mainFocus = priorities.mainFocus;

      if (architectAnswers && architectAnswers.identity && mainFocus) {
          // Architect flow data
          futureSelfArchitect = {
              mainFocus: mainFocus,
              identity: architectAnswers.identity,
              system: architectAnswers.system,
              proof: architectAnswers.proof,
          };
      }
  }


  const handlePillarClick = (pillar: string) => {
    setActivePillar(current => (current === pillar ? undefined : pillar));
  };
  
  const handleRetakeCurrent = () => {
    startRetake();
    navigate('/questionnaire', { state: { retake: true } });
  };

  const handleSetFutureTargets = () => {
    navigate('/future-questionnaire', { state: { ...location.state, progress, isArchitect: false } });
  };

  const handleStartArchitectQuestionnaire = () => {
    navigate('/future-questionnaire', { state: { ...location.state, progress, isArchitect: true } });
  };

  const handleDownloadReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();

    const appendCanvasToPdf = async (element: HTMLElement) => {
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
        
        while (heightLeft > 0) {
            position -= pdfPageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfPageHeight;
        }
    };

    const page1Element = page1Ref.current;
    if(page1Element) {
        await appendCanvasToPdf(page1Element);
    }

    if(futureSelfArchitect) {
        const page2Element = page2Ref.current;
        if(page2Element) {
            pdf.addPage();
            await appendCanvasToPdf(page2Element);
        }
    }
    
    pdf.save('life-view-report.pdf');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div ref={page1Ref}>
          <ResultsHeader />
          <ChartsSection
            currentProgress={progress}
            futureProgress={futureProgress}
            answers={answers}
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={handleRetakeCurrent}
            onStartFutureQuestionnaire={handleSetFutureTargets}
          />
          <InsightSynthesis insights={insightSyntheses} />
        </div>
        <div ref={page2Ref}>
          <FutureSelfArchitectSection
            architect={futureSelfArchitect}
            onStart={handleStartArchitectQuestionnaire}
            isQuestionnaireComplete={isFutureQuestionnaireComplete}
          />
        </div>
        <ResultsActions 
          isArchitectComplete={!!futureSelfArchitect}
          onDownload={handleDownloadReport}
        />
      </main>
      <div className="no-print">
        <ResultsFooter />
      </div>
    </div>
  );
};

export default Results;
