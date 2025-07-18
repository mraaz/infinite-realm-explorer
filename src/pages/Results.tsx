// src/pages/Results.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getQuestionnaireState,
  QuestionnaireStatePayload,
  getPulseCheckState,
  PulseCheckStatePayload,
} from "@/services/apiService";

// --- Component Imports ---
import ResultsHeader from "@/components/results/ResultsHeader";
import ChartsSection from "@/components/results/ChartsSection";
import InsightSynthesis from "@/components/results/InsightSynthesis";
import ResultsFooter from "@/components/results/ResultsFooter";
import PdfFooter from "@/components/results/PdfFooter";
import PageLoading from "@/components/ui/page-loading";

// --- Type Imports ---
import { PillarProgress } from "@/components/NewQuadrantChart";
import { Insight } from "@/types/insights";

// Mock data for InsightSynthesis since its data source is not specified.
const mockInsights: Insight[] = [
  {
    title: "Emphasis on Growth",
    description:
      "Your answers indicate a strong desire for personal and professional development.",
    icon: "TrendingUp",
    color: "purple",
    backContent: {
      title: "Actionable Insight",
      content: "Consider setting SMART goals to channel this motivation.",
    },
  },
  {
    title: "Connection Oriented",
    description:
      "You frequently mention the importance of relationships and community.",
    icon: "Users",
    color: "orange",
    backContent: {
      title: "Actionable Insight",
      content:
        "Schedule regular time for networking or strengthening personal bonds.",
    },
  },
];

// --- Helper to format scores for the charts ---
const formatScoresForChart = (
  pulseState: PulseCheckStatePayload | null,
  questionnaireState: QuestionnaireStatePayload | null
) => {
  // Default structure for the charts
  const progress = {
    current: { Health: 0, Career: 0, Finance: 0, Connections: 0 },
    future: { Health: 0, Career: 0, Finance: 0, Connections: 0 },
  };

  // Populate "Current Self" from Pulse Check data
  if (pulseState) {
    progress.current.Health = pulseState.healthScore ?? 0;
    progress.current.Career = pulseState.careerScore ?? 0;
    progress.current.Finance = pulseState.financesScore ?? 0;
    progress.current.Connections = pulseState.connectionsScore ?? 0;
  }

  // Populate "Future Self" from Questionnaire data
  const futureScores = questionnaireState?.answers?.scores;
  if (futureScores) {
    // Assuming max score per pillar is 200, normalizing to 100 for the chart
    progress.future.Health = Math.min(
      Math.round((futureScores.Health || 0) / 2),
      100
    );
    progress.future.Career = Math.min(
      Math.round((futureScores.Career || 0) / 2),
      100
    );
    progress.future.Finance = Math.min(
      Math.round((futureScores.Finance || 0) / 2),
      100
    );
    progress.future.Connections = Math.min(
      Math.round((futureScores.Connections || 0) / 2),
      100
    );
  }

  return progress;
};

const Results = () => {
  const [questionnaireState, setQuestionnaireState] =
    useState<QuestionnaireStatePayload | null>(null);
  const [pulseCheckState, setPulseCheckState] =
    useState<PulseCheckStatePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string | undefined>();

  const { authToken, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const fetchAllData = async () => {
      if (authToken) {
        try {
          // Fetch both data sources in parallel
          const [questionnaireRes, pulseRes] = await Promise.all([
            getQuestionnaireState(authToken).catch((e) => {
              console.error("Questionnaire fetch failed:", e);
              return null;
            }),
            getPulseCheckState(authToken).catch((e) => {
              console.error("Pulse Check fetch failed:", e);
              return null;
            }),
          ]);

          setQuestionnaireState(questionnaireRes);
          setPulseCheckState(pulseRes);
        } catch (err) {
          setError("Failed to load your results. Please try again later.");
          toast({
            title: "Error",
            description: "Could not fetch your data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAllData();
  }, [authToken, isLoggedIn, navigate, toast]);

  const { currentProgress, futureProgress } = useMemo(() => {
    return formatScoresForChart(pulseCheckState, questionnaireState);
  }, [pulseCheckState, questionnaireState]);

  const handlePillarClick = (pillar: string) => {
    setActivePillar(pillar === activePillar ? undefined : pillar);
  };

  const handleRetake = (type: "current" | "future") => {
    const path = type === "current" ? "/pulse-check" : "/future-questionnaire";
    navigate(path);
  };

  if (isLoading) return <PageLoading />;

  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="bg-[#18181b] min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <ResultsHeader />
        <main>
          <ChartsSection
            currentProgress={currentProgress}
            futureProgress={futureProgress}
            answers={{}} // Pass empty or relevant data if needed by child components
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={() => handleRetake("current")}
            onStartFutureQuestionnaire={() => handleRetake("future")}
          />
          <InsightSynthesis insights={mockInsights} />
          {/* HabitArchitectSection, HabitsTimeline, and ResultsActions have been removed */}
        </main>
        <ResultsFooter />
        <PdfFooter />
      </div>
    </div>
  );
};

export default Results;
