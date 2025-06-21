
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

  const isAuthenticated = user?.id && isVerified;
  const hasResults = results && Object.keys(answers).length > 0;

  // For unauthorized users, check if we have data in memory
  if (!isAuthenticated && !hasResults) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="h-12 w-12 text-orange-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Results Found
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Complete the questionnaire first to see your personalized results.
            </p>
            <Button onClick={() => navigate('/questionnaire')} className="flex items-center gap-2">
              Start Questionnaire
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Loading state (only for authenticated users)
  if (isAuthenticated && isLoading) {
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

  // Error state (only for authenticated users)
  if (isAuthenticated && (isError || !results)) {
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
        
        {/* AI-Generated Life Dashboard - show for all users with results */}
        {results && (
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
        )}

        {/* Smart Takeaways Hub - show for all users with results */}
        {results && (
          <div className="pdf-page">
            <SmartTakeawaysHub takeaways={results.smart_takeaways} />
            <PdfFooter />
          </div>
        )}

        {/* Original Charts Section - show for all users */}
        <div className="pdf-page">
          <ChartsSection
            currentProgress={progress}
            futureProgress={futureProgress}
            answers={answers}
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={handleRetakeCurrent}
            onStartFutureQuestionnaire={handleSetFutureTargets}
            isPublicView={!isAuthenticated}
          />
          <PdfFooter />
        </div>

        <div className="pdf-page">
          <InsightSynthesis insights={insightSyntheses as Insight[]} />
          <PdfFooter />
        </div>

        {/* Habit Architect Section - only for authenticated users */}
        {isAuthenticated && (
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
        )}

        {/* Habits Timeline - only for authenticated users with completed habits */}
        {isAuthenticated && completedHabits.length > 0 && (
          <div className="pdf-page">
            <HabitsTimeline habits={completedHabits} forPdf={true} />
            <PdfFooter />
          </div>
        )}

        {/* Sign in prompt for unauthorized users */}
        {!isAuthenticated && (
          <section className="mb-16 flex justify-center">
            <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-2xl">
              <CardContent className="p-8 text-center">
                <LogIn className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Want to do more with your results?
                </h3>
                <p className="text-gray-600 mb-6">
                  Sign in to save your progress, build habits, share your results on social media, and track your journey over time.
                </p>
                <Button onClick={() => navigate('/auth')} className="flex items-center gap-2 mx-auto">
                  <LogIn className="h-4 w-4" />
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Results Actions - different behavior for auth vs non-auth users */}
        <ResultsActions 
          isArchitectComplete={!!futureSelfArchitect && futureSelfArchitect.length > 0}
          onDownload={handlePrintReport}
          isAuthenticated={isAuthenticated}
        />
      </main>
      <div className="no-print">
        <ResultsFooter />
      </div>
    </div>
  );
};

export default Results;
