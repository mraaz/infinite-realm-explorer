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

// --- REFACTORED HELPER FUNCTION ---
const formatScoresForChart = (
  pulseState: PulseCheckStatePayload | null,
  questionnaireState: QuestionnaireStatePayload | null
) => {
  const progress = {
    current: { health: 0, career: 0, finances: 0, connections: 0 },
    future: { health: 0, career: 0, finances: 0, connections: 0 },
  };

  // --- 1. Data Normalization ---
  const cleanPulseScores = {
    health: pulseState?.healthScore ?? 0,
    career: pulseState?.careerScore ?? 0,
    finances: pulseState?.financesScore ?? 0,
    connections: pulseState?.connectionsScore ?? 0,
  };

  const cleanFutureScores = {
    health: questionnaireState?.answers?.scores?.Health ?? 0,
    career: questionnaireState?.answers?.scores?.Career ?? 0,
    finances: questionnaireState?.answers?.scores?.Financials ?? 0,
    connections: questionnaireState?.answers?.scores?.Connections ?? 0,
  };

  // --- 2. Main Logic (using only clean data) ---

  progress.current = cleanPulseScores;

  const priorities = questionnaireState?.priorities;
  if (priorities?.maintenance) {
    const allPillars: (keyof typeof progress.future)[] = [
      "health",
      "career",
      "connections",
      "finances",
    ];

    allPillars.forEach((pillar) => {
      const isMaintenance = priorities.maintenance.some(
        (p) =>
          p.toLowerCase() === pillar ||
          (p === "Financials" && pillar === "finances")
      );

      if (isMaintenance) {
        progress.future[pillar] = cleanPulseScores[pillar];
      } else {
        // FIX: Removed the division by 2 to use the actual score
        progress.future[pillar] = Math.min(
          Math.round(cleanFutureScores[pillar]),
          100
        );
      }
    });
  } else {
    // Fallback if priorities object is missing
    progress.future = {
      // FIX: Removed the division by 2 to use the actual score
      health: Math.min(Math.round(cleanFutureScores.health), 100),
      career: Math.min(Math.round(cleanFutureScores.career), 100),
      finances: Math.min(Math.round(cleanFutureScores.finances), 100),
      connections: Math.min(Math.round(cleanFutureScores.connections), 100),
    };
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
    <div className="bg-[#1818b] min-h-screen text-white">
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
