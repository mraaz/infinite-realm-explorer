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
import PageLoading from "@/components/ui/page-loading";
import { X } from "lucide-react"; // For the modal close icon

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

// --- Helper function for chart data ---
const formatScoresForChart = (
  pulseState: PulseCheckStatePayload | null,
  questionnaireState: QuestionnaireStatePayload | null
) => {
  const progress = {
    current: { health: 0, career: 0, finances: 0, connections: 0 },
    future: { health: 0, career: 0, finances: 0, connections: 0 },
  };

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
        progress.future[pillar] = Math.min(
          Math.round(cleanFutureScores[pillar]),
          100
        );
      }
    });
  } else {
    progress.future = {
      health: Math.min(Math.round(cleanFutureScores.health), 100),
      career: Math.min(Math.round(cleanFutureScores.career), 100),
      finances: Math.min(Math.round(cleanFutureScores.finances), 100),
      connections: Math.min(Math.round(cleanFutureScores.connections), 100),
    };
  }

  return progress;
};

// --- MERGED: SelfDiscoverySurvey Component with your text and my responsive classes ---
const SelfDiscoverySurvey = ({
  onStartClick,
}: {
  onStartClick: () => void;
}) => (
  <section className="mb-16 text-center bg-gray-800/20 border border-gray-700 rounded-lg p-4 sm:p-8">
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
      Self-discovery survey within 10 mins
    </h2>
    <p className="text-base sm:text-lg text-gray-400 mb-6">
      Answer a meaningful questions about your goals and values.
      <br /> We’ll use it to create a tailored path forward — just for you.
    </p>
    <button
      onClick={onStartClick}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 sm:py-3 sm:px-6 rounded-lg transition-colors duration-300 text-base sm:text-lg"
    >
      Start your journey!
    </button>
  </section>
);

// --- MERGED: SurveyModal Component with your text and my responsive classes ---
const SurveyModal = ({
  isOpen,
  onClose,
  onEngage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEngage: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Settle in, we're about to start....
        </h3>
        <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
          Each step auto-saves.
          <br />
          Try not to overthink the questions, your first response is often your
          truest.
          <br />
          Good luck!
        </p>
        <button
          onClick={onEngage}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-base"
        >
          Engage
        </button>
      </div>
    </div>
  );
};

const Results = () => {
  const [questionnaireState, setQuestionnaireState] =
    useState<QuestionnaireStatePayload | null>(null);
  const [pulseCheckState, setPulseCheckState] =
    useState<PulseCheckStatePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePillar, setActivePillar] = useState<string | undefined>();

  const [isSurveyModalOpen, setSurveyModalOpen] = useState(false);

  const { authToken, isLoggedIn, completedFutureQuestionnaire } = useAuth();
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
    const path =
      type === "current" ? "/pulse-check" : "/onboarding-questionnaire";
    navigate(path);
  };

  const handleEngageClick = () => {
    navigate("/onboarding-questionnaire");
  };

  if (isLoading) return <PageLoading />;

  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="bg-[#18181b] min-h-screen text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <main>
          <ResultsHeader />
          <ChartsSection
            currentProgress={chartData.current as PillarProgress}
            futureProgress={chartData.future as PillarProgress}
            answers={{}}
            onPillarClick={handlePillarClick}
            activePillar={activePillar}
            onRetakeCurrent={() => handleRetake("current")}
            onStartFutureQuestionnaire={() => handleRetake("future")}
          />

          {completedFutureQuestionnaire ? (
            <InsightSynthesis insights={mockInsights} />
          ) : (
            <SelfDiscoverySurvey
              onStartClick={() => setSurveyModalOpen(true)}
            />
          )}
        </main>
        <ResultsFooter />
      </div>

      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        onEngage={handleEngageClick}
      />
    </div>
  );
};

export default Results;
