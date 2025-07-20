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
import Header from "@/components/Header";
import ResultsHeader from "@/components/results/ResultsHeader";
import ChartsSection from "@/components/results/ChartsSection";
import InsightSynthesis from "@/components/results/InsightSynthesis";
import ResultsFooter from "@/components/results/ResultsFooter";
import PdfFooter from "@/components/results/PdfFooter";
import PageLoading from "@/components/ui/page-loading";

// --- Type Imports ---
import { PillarProgress } from "@/components/NewQuadrantChart";
import { Insight } from "@/types/insights";

// Mock data for InsightSynthesis
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

// --- CORRECTED HELPER FUNCTION ---
// FIX: This function is now correctly defined before the Results component.
const formatScoresForChart = (
  pulseState: PulseCheckStatePayload | null,
  questionnaireState: QuestionnaireStatePayload | null
) => {
  // FIX: Changed 'finance' (singular) to 'finances' (plural) to match the chart component's expected props.
  const progress = {
    current: { health: 0, career: 0, finances: 0, connections: 0 },
    future: { health: 0, career: 0, finances: 0, connections: 0 },
  };

  // Populate "Current Self" from Pulse Check data
  if (pulseState) {
    progress.current.health = pulseState.healthScore ?? 0;
    progress.current.career = pulseState.careerScore ?? 0;
    progress.current.finances = pulseState.financesScore ?? 0;
    progress.current.connections = pulseState.connectionsScore ?? 0;
  }

  // Populate "Future Self" with combined logic
  const futureScores = questionnaireState?.answers?.scores;
  const priorities = questionnaireState?.priorities;

  if (futureScores && pulseState && priorities?.maintenance) {
    const allPillars: (keyof typeof progress.future)[] = [
      "health",
      "career",
      "connections",
      "finances",
    ];

    allPillars.forEach((pillar) => {
      // The name used in the priorities array is Capitalized and plural 'Finances'
      const priorityPillarName =
        pillar.charAt(0).toUpperCase() + pillar.slice(1);

      if (priorities.maintenance.includes(priorityPillarName as any)) {
        // MAINTENANCE: Use Pulse Check score
        const pulseKey = `${pillar}Score` as keyof PulseCheckStatePayload;
        progress.future[pillar] = (pulseState[pulseKey] as number) ?? 0;
      } else {
        // MAIN/SECONDARY FOCUS: Use Future Self score
        // The name in the scores object is Capitalized and 'Financials'
        const scorePillarName =
          pillar === "finances" ? "Financials" : priorityPillarName;
        progress.future[pillar] = Math.min(
          Math.round((futureScores[scorePillarName] || 0) / 2),
          100
        );
      }
    });
  } else if (futureScores) {
    // Fallback logic
    progress.future.health = Math.min(
      Math.round((futureScores.Health || 0) / 2),
      100
    );
    progress.future.career = Math.min(
      Math.round((futureScores.Career || 0) / 2),
      100
    );
    progress.future.finances = Math.min(
      Math.round((futureScores.Financials || 0) / 2),
      100
    );
    progress.future.connections = Math.min(
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
          const [questionnaireRes, pulseRes] = await Promise.all([
            getQuestionnaireState(authToken),
            getPulseCheckState(authToken),
          ]);

          setQuestionnaireState(questionnaireRes);
          setPulseCheckState(pulseRes);
        } catch (err) {
          setError("Failed to load your results. Please try again later.");
          toast({
            title: "Error Loading Data",
            description:
              "There was a problem fetching your results. Please refresh the page.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAllData();
  }, [authToken, isLoggedIn, navigate, toast]);

  const chartData = useMemo(() => {
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
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ResultsHeader />
        <main>
          <ChartsSection
            currentProgress={chartData.current as PillarProgress}
            futureProgress={chartData.future as PillarProgress}
            answers={{}}
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={() => handleRetake("current")}
            onStartFutureQuestionnaire={() => handleRetake("future")}
          />
          <InsightSynthesis insights={mockInsights} />
        </main>
        <ResultsFooter />
        <PdfFooter />
      </div>
    </div>
  );
};

export default Results;
