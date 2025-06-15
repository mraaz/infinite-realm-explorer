import { useState } from 'react';
import Header from '@/components/Header';
import { Share2, Download, RefreshCw } from 'lucide-react';
import { NewQuadrantChart, PillarProgress } from '@/components/NewQuadrantChart';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

const Results = () => {
  const { answers, actions } = useQuestionnaireStore();
  const { getProgress, startRetake } = actions;
  // Mock data based on the image for placeholder content
  const insightSyntheses = [
    {
      title: "The Burnout Risk",
      description: "Your profile shows a pattern of high professional output (e.g., 55 hours/week) combined with low personal energy reserves. This is a classic indicator of potential burnout, where performance is sustained at the cost of personal wellbeing."
    },
    {
      title: "The Anxious Saver",
      description: "Your profile shows excellent saving habits, which is a ripper strength. However, this is paired with low confidence about your financial future. This suggests your financial stress may be linked to your mindset or overall plan, rather than your actions."
    },
    {
      title: "Social Battery Drain",
      description: "Your profile indicates you are spending a fair dinkum amount of time in social situations, but your sense of true belonging and connection remains low. This pattern can often lead to feeling drained rather than energised by your social life."
    },
    {
      title: "Untapped Support System",
      description: "Your strong sense of connection is a powerful asset. Your profile suggests you are facing significant stress in your career or finances, but you have a bonza support system you can lean on to navigate these challenges."
    }
  ];

  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);

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
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            G'day, Marc Raaz!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's your personalised Life View - a deep dive into the patterns shaping your future.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="relative group bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <Button
              onClick={handleRetakeCurrent}
              variant="secondary"
              size="sm"
              className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Current Self</h2>
            <div className="h-96 flex items-center justify-center rounded-lg">
              <NewQuadrantChart 
                progress={progress}
                answers={answers}
                onPillarClick={handlePillarClick}
                activePillar={activePillar}
              />
            </div>
          </div>

          <div className="relative group bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <Button
              onClick={handleStartFutureQuestionnaire}
              variant="secondary"
              size="sm"
              className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Future Self</h2>
            <div className="h-96 flex flex-col items-center justify-center rounded-lg">
                <NewQuadrantChart 
                  progress={futureProgress}
                  answers={answers}
                  isFuture={true}
                  onPillarClick={handlePillarClick}
                  activePillar={activePillar}
                />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
          <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insightSyntheses.map((insight, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">Observation: {insight.title}</h3>
                  <p className="text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/80 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Future Self Architect</h2>
            <p className="text-gray-600 mb-4">Goals are fleeting, but your identity is who you are. Instead of setting a target, let's define the identity of your future self and build the systems that make success inevitable.</p>
            
            {futureSelfArchitect ? (
              <div className="bg-gray-100/50 p-6 rounded-lg space-y-4">
                  <div>
                      <h3 className="font-semibold text-gray-700 capitalize">Your Future Identity for {futureSelfArchitect.mainFocus}:</h3>
                      <p className="font-bold text-purple-600 text-xl">"{futureSelfArchitect.identity}"</p>
                  </div>
                  <div>
                      <h3 className="font-semibold text-gray-700">Your Core System:</h3>
                      <p className="text-gray-600 italic">"{futureSelfArchitect.system}"</p>
                  </div>
                  <div>
                      <h3 className="font-semibold text-gray-700">Your First Proof of Identity:</h3>
                      <p className="text-gray-600 italic">"{futureSelfArchitect.proof}"</p>
                  </div>
                  <Button onClick={handleStartFutureQuestionnaire} variant="outline" className="w-full mt-4 !text-gray-800">
                      Redesign Your Future Self
                  </Button>
              </div>
            ) : (
              <div className="bg-gray-100/50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">Ready to design your future identity?</p>
                  <p className="text-gray-600 text-sm mb-4">Create a personalised identity system based on your main focus area that will help you achieve your goals through consistent habits and mindset shifts.</p>
                  <Button onClick={handleStartFutureQuestionnaire} className="w-full justify-between">
                      <span>Design Your Future Self</span>
                      <span>&rarr;</span>
                  </Button>
              </div>
            )}
        </section>
        
        <section className="flex flex-col sm:flex-row justify-center items-center gap-4">
           <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
             <Share2 size={18} />
             Share My Life View
           </button>
           <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
             <Download size={18} />
             Download Full Report
           </button>
        </section>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200/80 mt-8">
        © {new Date().getFullYear()} Infinite Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Results;
