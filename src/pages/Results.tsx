import { useState } from 'react';
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

const Results = () => {
  const { answers, actions } = useQuestionnaireStore();
  const { getProgress, startRetake } = actions;
  
  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);

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

  // Test data for the future self chart as requested.
  const futureProgress: PillarProgress = {
    basics: 80,
    career: 95,
    financials: 85,
    health: 90,
    connections: 80,
  };

  const navigate = useNavigate();
  const location = useLocation();
  const futureSelfArchitect = location.state?.futureSelfArchitect;

  const handlePillarClick = (pillar: string) => {
    setActivePillar(current => (current === pillar ? undefined : pillar));
  };
  
  const handleRetakeCurrent = () => {
    startRetake();
    navigate('/questionnaire', { state: { retake: true } });
  };

  const handleStartFutureQuestionnaire = () => {
    navigate('/future-questionnaire', { state: { progress } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ResultsHeader />
        <ChartsSection
          currentProgress={progress}
          futureProgress={futureProgress}
          answers={answers}
          onPillarClick={handlePillarClick}
          activePillar={activePillar}
          onRetakeCurrent={handleRetakeCurrent}
          onStartFutureQuestionnaire={handleStartFutureQuestionnaire}
        />
        <InsightSynthesis insights={insightSyntheses} />
        <FutureSelfArchitectSection
          architect={futureSelfArchitect}
          onStart={handleStartFutureQuestionnaire}
        />
        <ResultsActions />
      </main>
      <ResultsFooter />
    </div>
  );
};

export default Results;
