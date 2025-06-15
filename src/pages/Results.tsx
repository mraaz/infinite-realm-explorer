
import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { Insight } from '@/components/results/InsightSynthesis';
import ResultsHeader from '@/components/results/ResultsHeader';
import ChartsSection from '@/components/results/ChartsSection';
import InsightSynthesis from '@/components/results/InsightSynthesis';
import FutureSelfArchitectSection from '@/components/results/FutureSelfArchitectSection';
import HabitsTimeline from '@/components/results/HabitsTimeline';
import ResultsActions from '@/components/results/ResultsActions';
import ResultsFooter from '@/components/results/ResultsFooter';
import insightSyntheses from '@/data/insights.json';
import PdfFooter from '@/components/results/PdfFooter';
import { useResultsData } from '@/hooks/useResultsData';
import { useResultsActions } from '@/hooks/useResultsActions';
import { usePdfReport } from '@/hooks/usePdfReport';

const Results = () => {
  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);
  const chartsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const architectRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const {
    answers,
    progress,
    futureProgress,
    futureQuestionnaire,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  } = useResultsData();

  const {
    handleRetakeCurrent,
    handleSetFutureTargets,
    handleStartArchitectQuestionnaire,
    handleMarkHabitAsDone,
  } = useResultsActions(futureQuestionnaire, progress);

  const { handleDownloadReport } = usePdfReport(
    chartsRef,
    insightsRef,
    architectRef,
    timelineRef,
    futureSelfArchitect
  );

  const handlePillarClick = (pillar: string) => {
    setActivePillar(current => (current === pillar ? undefined : pillar));
  };

  const completedHabits = futureSelfArchitect?.filter(h => h.isCompleted) || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ResultsHeader />
        
        <div ref={chartsRef} className="pdf-page">
          <ChartsSection
            currentProgress={progress}
            futureProgress={futureProgress}
            answers={answers}
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={handleRetakeCurrent}
            onStartFutureQuestionnaire={handleSetFutureTargets}
          />
          <PdfFooter />
        </div>

        <div ref={insightsRef} className="pdf-page">
          <InsightSynthesis insights={insightSyntheses as Insight[]} />
          <PdfFooter />
        </div>

        <div ref={architectRef} className="pdf-page">
          <FutureSelfArchitectSection
            architect={futureSelfArchitect}
            onStart={handleStartArchitectQuestionnaire}
            isQuestionnaireComplete={isFutureQuestionnaireComplete}
            onMarkAsDone={handleMarkHabitAsDone}
          />
          <PdfFooter />
        </div>

        <div ref={timelineRef} className="pdf-page">
          <HabitsTimeline habits={completedHabits} forPdf={true} />
          <PdfFooter />
        </div>

        <ResultsActions 
          isArchitectComplete={!!futureSelfArchitect && futureSelfArchitect.length > 0}
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
