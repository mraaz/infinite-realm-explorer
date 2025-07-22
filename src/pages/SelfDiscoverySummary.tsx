import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingQuestionnaireStore } from "@/store/onboardingQuestionnaireStore";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  Target,
  TrendingUp,
  Heart,
  Users,
} from "lucide-react";

const pillarIcons: { [key: string]: React.ReactNode } = {
  Career: <Target className="h-6 w-6 text-purple-400" />,
  Finances: <TrendingUp className="h-6 w-6 text-blue-400" />,
  Health: <Heart className="h-6 w-6 text-green-400" />,
  Connections: <Users className="h-6 w-6 text-orange-400" />,
};

const SelfDiscoverySummary = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const {
    summary,
    isLoading,
    isGeneratingSummary,
    summaryError,
    fetchSummary,
  } = useOnboardingQuestionnaireStore();

  useEffect(() => {
    if (!summary && authToken) {
      fetchSummary(authToken);
    }
  }, [authToken, summary, fetchSummary]);

  const handleDone = () => {
    navigate("/results");
  };

  if (isLoading || isGeneratingSummary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#16161a] text-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">
          {isGeneratingSummary
            ? "Crafting your summary..."
            : "Loading your summary..."}
        </h1>
        <p className="text-lg text-gray-400">
          {isGeneratingSummary
            ? "Analysing your responses..."
            : "Please wait a moment."}
        </p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#16161a] text-white p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
        <p className="text-lg text-gray-400 mb-8 max-w-md">{summaryError}</p>
        <Button onClick={() => navigate("/onboarding-questionnaire")}>
          Start Questionnaire
        </Button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="bg-[#16161a] min-h-screen text-white">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
              {summary.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 text-center mb-12">
              {summary.overallSummary}
            </p>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-yellow-400" /> Key Insights
              </h2>
              <div className="space-y-6">
                {summary.keyInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-[#1e1e24] p-6 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-xl font-semibold text-purple-400 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-gray-300">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Your Actionable Steps</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {summary.actionableSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-[#1e1e24] p-6 rounded-lg border border-gray-700 flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {pillarIcons[step.pillar] || (
                        <Sparkles className="h-6 w-6" />
                      )}
                      <h3 className="text-2xl font-bold">{step.pillar}</h3>
                    </div>
                    <p className="text-gray-300 mb-4 flex-grow">
                      {step.recommendation}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2 font-semibold">
                        Your First Step:
                      </p>
                      <p className="text-purple-400 font-medium">
                        {step.firstStep}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16">
              <Button
                onClick={handleDone}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-10 py-6"
              >
                View My Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#16161a] text-white p-4">
      <h1 className="text-2xl">No summary to display.</h1>
      <Button onClick={() => navigate("/")} className="mt-4">
        Go Home
      </Button>
    </div>
  );
};

export default SelfDiscoverySummary;
