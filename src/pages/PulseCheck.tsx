import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import RadarChart from '@/components/pulse-check/RadarChart';
import { pulseCheckCards, PulseCheckCard, categoryColors, categoryIconPaths } from '@/data/pulseCheckCards';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SwipeResult {
  cardId: number;
  decision: 'keep' | 'pass';
  card: PulseCheckCard;
}

interface PulseCheckScores {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

interface PulseCheckAnalysis {
  sessionId: string;
  scores: PulseCheckScores;
  insights: string[];
  totalCards: number;
  timestamp: string;
}

const PulseCheck: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<PulseCheckCard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<PulseCheckAnalysis | null>(null);
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);

  // Shuffle cards on mount
  useEffect(() => {
    const shuffled = [...pulseCheckCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, []);

  const categories = ['Career', 'Finances', 'Health', 'Connections'];
  
  const getKeptCardsByCategory = () => {
    const keptCards = swipeResults.filter(result => result.decision === 'keep');
    const byCategory: Record<string, number> = {};
    categories.forEach(cat => {
      byCategory[cat] = keptCards.filter(result => result.card.category === cat).length;
    });
    return byCategory;
  };

  const canGetResults = () => {
    const keptByCategory = getKeptCardsByCategory();
    return categories.every(category => keptByCategory[category] >= 1);
  };

  const handleSwipe = async (cardId: number, decision: 'keep' | 'pass') => {
    const card = shuffledCards.find(c => c.id === cardId);
    if (!card) return;

    const result: SwipeResult = { cardId, decision, card };
    const newResults = [...swipeResults, result];
    setSwipeResults(newResults);

    // Save to database
    if (user) {
      try {
        await supabase.from('pulse_check_results').insert({
          user_id: user.id,
          session_id: sessionId,
          card_data: card as any,
          swipe_decision: decision,
          category: card.category
        });
      } catch (error) {
        console.error('Error saving swipe result:', error);
        toast.error('Failed to save result');
      }
    }

    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleGetResults = async () => {
    if (!canGetResults()) {
      toast.error('You need to keep at least one card from each category before getting results.');
      return;
    }
    
    if (!user) {
      toast.error('Please sign in to get your results.');
      navigate('/auth');
      return;
    }

    setIsGeneratingResults(true);
    toast.loading('Generating your insights...', { id: 'generating' });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scores', {
        body: {
          sessionId,
          userId: user.id
        }
      });

      if (error) throw error;

      setAnalysis(data);
      setShowResults(true);
      toast.success('Your pulse check results are ready!', { id: 'generating' });
    } catch (error) {
      console.error('Error generating results:', error);
      toast.error('Failed to generate results. Please try again.', { id: 'generating' });
    } finally {
      setIsGeneratingResults(false);
    }
  };

  const handleContinueToQuestionnaire = () => {
    navigate('/future-questionnaire');
  };

  const progressPercentage = ((currentCardIndex + (isComplete ? 1 : 0)) / shuffledCards.length) * 100;
  const keptByCategory = getKeptCardsByCategory();

  if (shuffledCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#16161a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16161a] relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-semibold text-white">Pulse Check</h1>
          <p className="text-sm text-gray-400">
            {isComplete ? 'Complete!' : `${currentCardIndex + 1} of ${shuffledCards.length}`}
          </p>
        </div>

        <div className="w-16"></div> {/* Spacer for alignment */}
      </header>

      {/* Progress bar */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((category) => {
            const categoryColor = categoryColors[category as keyof typeof categoryColors];
            const iconPath = categoryIconPaths[category as keyof typeof categoryIconPaths];
            const keptCount = keptByCategory[category] || 0;
            const hasMinimum = keptCount >= 1;

            return (
              <div 
                key={category}
                className={`${categoryColor.bg} border ${categoryColor.border} rounded-xl p-3 text-center relative`}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className={`w-5 h-5 ${categoryColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                  </svg>
                </div>
                <h3 className={`text-sm font-medium ${categoryColor.text} mb-1`}>{category}</h3>
                <p className="text-xs text-gray-400">
                  {keptCount}/4
                </p>
                {hasMinimum && (
                  <CheckCircle className="w-4 h-4 text-green-400 absolute top-2 right-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Stack or Results */}
      <div className="flex-1 px-4 sm:px-6 pb-24">
        <div className="max-w-md mx-auto relative">
          {showResults && analysis ? (
            /* Results View */
            <div className="space-y-6">
              {/* Results Header */}
              <div className="text-center mb-8">
                <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your Pulse Check Results</h2>
                <p className="text-gray-400">Based on {analysis.totalCards} cards reviewed</p>
              </div>

              {/* Radar Chart */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Life Balance Overview</h3>
                <RadarChart scores={analysis.scores} />
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.scores).map(([category, score]) => {
                  const categoryColor = categoryColors[category as keyof typeof categoryColors];
                  const iconPath = categoryIconPaths[category as keyof typeof categoryIconPaths];
                  return (
                    <div key={category} className={`${categoryColor.bg} border ${categoryColor.border} rounded-xl p-4 text-center`}>
                      <div className="flex items-center justify-center mb-2">
                        <svg className={`w-5 h-5 ${categoryColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                        </svg>
                      </div>
                      <h4 className={`text-sm font-medium ${categoryColor.text} mb-1`}>{category}</h4>
                      <p className="text-2xl font-bold text-white">{score}%</p>
                    </div>
                  );
                })}
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center space-y-4">
                <button
                  onClick={handleContinueToQuestionnaire}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Continue to Full Questionnaire
                </button>
                <p className="text-xs text-gray-400">
                  Get deeper insights with our comprehensive life assessment
                </p>
              </div>
            </div>
          ) : !isComplete ? (
            /* Card Stack */
            <div className="h-96 sm:h-[500px] relative">
              {/* Render up to 3 cards in stack */}
              {shuffledCards.slice(currentCardIndex, currentCardIndex + 3).map((card, index) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  onSwipe={handleSwipe}
                  isActive={index === 0}
                  zIndex={3 - index}
                />
              ))}
            </div>
          ) : (
            /* Completion Dialog */
            <div className="h-96 sm:h-[500px] flex flex-col items-center justify-center text-center p-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/20 p-8 w-full max-w-sm">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">All Done!</h3>
                <p className="text-gray-400 mb-6">
                  You've completed your pulse check. Ready to see your insights?
                </p>
                <button
                  onClick={handleGetResults}
                  disabled={!canGetResults() || isGeneratingResults}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    canGetResults() && !isGeneratingResults
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGeneratingResults ? 'Generating...' : 'Get Your Results'}
                </button>
                {!canGetResults() && (
                  <p className="text-xs text-amber-400 mt-2">
                    Keep at least one card from each category
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Early Results Button */}
          {!isComplete && !showResults && canGetResults() && (
            <div className="mt-6 text-center">
              <button
                onClick={handleGetResults}
                disabled={isGeneratingResults}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGeneratingResults ? 'Generating...' : 'Get Your Results'}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Keep answering to make results more insightful.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-0 right-0 text-center px-4">
        <p className="text-sm text-gray-500">
          Swipe left to pass • Swipe right to keep
        </p>
      </div>
    </div>
  );
};

export default PulseCheck;