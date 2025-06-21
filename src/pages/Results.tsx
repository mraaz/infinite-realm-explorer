
import { useState } from 'react';
import Header from '@/components/Header';
import { Insight } from '@/types/insights';
import ResultsHeader from '@/components/results/ResultsHeader';
import ChartsSection from '@/components/results/ChartsSection';
import InsightSynthesis from '@/components/results/InsightSynthesis';
import HabitArchitectSection from '@/components/results/HabitArchitectSection';
import HabitsTimeline from '@/components/results/HabitsTimeline';
import ResultsActions from '@/components/results/ResultsActions';
import ResultsFooter from '@/components/results/ResultsFooter';
import LifeDashboardChart from '@/components/results/LifeDashboardChart';
import SmartTakeawaysHub from '@/components/results/SmartTakeawaysHub';
import insightSyntheses from '@/data/insights.json';
import PdfFooter from '@/components/results/PdfFooter';
import { useResultsData } from '@/hooks/useResultsData';
import { useResultsActions } from '@/hooks/useResultsActions';
import { usePrintReport } from '@/hooks/usePrintReport';
import { useGenerateResults } from '@/hooks/useGenerateResults';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Results = () => {
  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { user, isVerified } = useSecureAuth();

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
    handleWeeklyCheckin,
  } = useResultsActions(futureQuestionnaire, progress);

  const { handlePrintReport } = usePrintReport();
  
  const { results, isLoading, isError, refetch } = useGenerateResults();

  const handlePillarClick = (pillar: string) => {
    setActivePillar(current => (current === pillar ? undefined : pillar));
  };

  const completedHabits = futureSelfArchitect?.filter(h => h.isCompleted) || [];

  // Authentication check
  if (!user || !isVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LogIn className="h-12 w-12 text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Sign in to view your results
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Please sign in to access your personalized life dashboard and insights.
            </p>
            <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Generating your personalized insights...
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              We're analyzing your responses to create your unique life dashboard and smart takeaways.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isError || !results) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Unable to generate results
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
              We encountered an issue while generating your personalized insights. Please try again.
            </p>
            <Button onClick={refetch} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ResultsHeader />
        
        {/* AI-Generated Life Dashboard */}
        <div className="pdf-page">
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                Your Life Dashboard
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                AI-generated insights based on your responses showing your creative vs reactive patterns across life pillars.
              </p>
            </div>
            
            <Card className="bg-white/60 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <BarChart3 className="h-5 w-5" />
                  Life Balance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LifeDashboardChart data={results.life_dashboard_chart} />
              </CardContent>
            </Card>
          </section>
          <PdfFooter />
        </div>

        {/* Smart Takeaways Hub */}
        <div className="pdf-page">
          <SmartTakeawaysHub takeaways={results.smart_takeaways} />
          <PdfFooter />
        </div>

        {/* Original Charts Section */}
        <div className="pdf-page">
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

        <div className="pdf-page">
          <InsightSynthesis insights={insightSyntheses as Insight[]} />
          <PdfFooter />
        </div>

        <div className="pdf-page">
          <HabitArchitectSection
            architect={futureSelfArchitect}
            onStart={handleStartArchitectQuestionnaire}
            isQuestionnaireComplete={isFutureQuestionnaireComplete}
            onMarkAsDone={handleMarkHabitAsDone}
            onWeeklyCheckin={handleWeeklyCheckin}
          />
          <PdfFooter />
        </div>

        <div className="pdf-page">
          <HabitsTimeline habits={completedHabits} forPdf={true} />
          <PdfFooter />
        </div>

        <ResultsActions 
          isArchitectComplete={!!futureSelfArchitect && futureSelfArchitect.length > 0}
          onDownload={handlePrintReport}
        />
      </main>
      <div className="no-print">
        <ResultsFooter />
      </div>
    </div>
  );
};

export default Results;
