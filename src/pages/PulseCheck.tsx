import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import RadarChart from '@/components/pulse-check/RadarChart';
import { pulseCheckCards } from '@/data/pulseCheckCards';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface PulseCheckResult {
  cardId: number;
  decision: 'keep' | 'pass';
  card_data: any;
}

interface CategoryProgress {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

export default function PulseCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const isGuest = searchParams.get('guest') === 'true';
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [results, setResults] = useState<PulseCheckResult[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [radarData, setRadarData] = useState<{
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
    insights?: {
      Career: string;
      Finances: string;
      Health: string;
      Connections: string;
    };
  } | null>(null);

  // Use ALL cards, shuffled for variety
  const [shuffledCards] = useState(() => {
    return [...pulseCheckCards].sort(() => Math.random() - 0.5);
  });

  // Redirect unauthenticated users (unless they're guests)
  useEffect(() => {
    // Generate session ID
    setSessionId(crypto.randomUUID());
    
    if (!isLoggedIn && !isGuest) {
      // Allow a moment for auth context to initialize
      const timer = setTimeout(() => {
        if (!isLoggedIn && !isGuest) {
          navigate('/?login=true');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isGuest, navigate]);

  // Check if minimum requirements are met (1 keep per category)
  const checkMinimumRequirements = (resultsToCheck: PulseCheckResult[]) => {
    const categories = ['Career', 'Finances', 'Health', 'Connections'];
    const categoryKeeps = categories.map(category => {
      return resultsToCheck.filter(r => r.card_data.category === category && r.decision === 'keep').length;
    });
    return categoryKeeps.every(count => count >= 1);
  };

  // Get category progress for display
  const getCategoryProgress = () => {
    const categories = ['Career', 'Finances', 'Health', 'Connections'];
    return categories.reduce((acc, category) => {
      const keeps = results.filter(r => r.card_data.category === category && r.decision === 'keep').length;
      acc[category as keyof CategoryProgress] = keeps;
      return acc;
    }, {} as CategoryProgress);
  };

  const handleSwipe = async (cardId: number, decision: 'keep' | 'pass') => {
    const card = shuffledCards.find(c => c.id === cardId);
    if (!card) return;

    const newResult: PulseCheckResult = {
      cardId,
      decision,
      card_data: card
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    // Save to database if user is logged in
    if (isLoggedIn && user) {
      try {
        await supabase
          .from('pulse_check_results')
          .insert({
            user_id: user.sub,
            session_id: sessionId,
            card_data: card as any,
            swipe_decision: decision,
            category: card.category
          });
      } catch (error) {
        console.error('Error saving pulse check result:', error);
        // Don't block user flow for save errors
      }
    }

    // Check if minimum requirements are now met
    const meetsRequirements = checkMinimumRequirements(updatedResults);
    setShowResultsButton(meetsRequirements);

    // Move to next card or complete
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsComplete(true);
      if (isLoggedIn) {
        toast.success('All cards completed! Results saved to your profile.');
      }
    }
  };

  const restartPulseCheck = () => {
    setCurrentCardIndex(0);
    setResults([]);
    setIsComplete(false);
    setShowResultsButton(false);
    setRadarData(null);
    setSessionId(crypto.randomUUID());
  };

  const handleGoBack = () => {
    navigate('/');
  };

  // Generate radar data by calling the edge function
  const generateRadarData = async () => {
    if (results.length === 0) return;
    
    setIsLoading(true);
    try {
      console.log('Calling generate-scores with results:', results);
      
      const { data, error } = await supabase.functions.invoke('generate-scores', {
        body: { results }
      });

      if (error) {
        console.error('Error calling generate-scores:', error);
        throw error;
      }

      console.log('Received radar data:', data);
      setRadarData(data);
      
    } catch (error) {
      console.error('Failed to generate radar data:', error);
      toast.error('Failed to generate insights. Please try again.');
      
      // Fallback to simple calculation
      const categories = ['Career', 'Finances', 'Health', 'Connections'] as const;
      const fallbackData = categories.reduce((acc, category) => {
        const categoryResults = results.filter(r => r.card_data.category === category);
        const keeps = categoryResults.filter(r => r.decision === 'keep').length;
        const total = categoryResults.length;
        acc[category] = total > 0 ? Math.round((keeps / total) * 100) : 50;
        return acc;
      }, {} as { [K in typeof categories[number]]: number });
      
      setRadarData({
        ...fallbackData,
        insights: {
          Career: "Unable to analyze at this time. Please try again.",
          Finances: "Unable to analyze at this time. Please try again.",
          Health: "Unable to analyze at this time. Please try again.",
          Connections: "Unable to analyze at this time. Please try again."
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate radar data when results are complete
  useEffect(() => {
    if (isComplete && results.length > 0 && !radarData) {
      generateRadarData();
    }
  }, [isComplete, results, radarData]);

  const getResultsSummary = () => {
    const categories = ['Career', 'Finances', 'Health', 'Connections'];
    const summary = categories.map(category => {
      const categoryResults = results.filter(r => r.card_data.category === category);
      const keeps = categoryResults.filter(r => r.decision === 'keep').length;
      const total = categoryResults.length;
      return { category, keeps, total, percentage: total > 0 ? (keeps / total) * 100 : 0 };
    });
    return summary;
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Your Life Pulse Results
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered insights from your pulse check
              </p>
            </div>

            {/* Loading state */}
            {isLoading && !radarData && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Analyzing your responses...</p>
              </div>
            )}

            {/* Radar Chart */}
            {radarData && (
              <div className="flex flex-col items-center space-y-8">
                <RadarChart 
                  data={{
                    Career: radarData.Career,
                    Finances: radarData.Finances,
                    Health: radarData.Health,
                    Connections: radarData.Connections
                  }}
                  insights={radarData.insights}
                />
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {isLoggedIn ? "Your results have been saved to your profile." : "Sign up to save your results and track your progress over time."}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={restartPulseCheck} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Take Another Pulse Check
                </Button>
                <Button onClick={handleGoBack} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Home
                </Button>
                {!isLoggedIn && (
                  <Button onClick={() => navigate('/?signup=true')} variant="secondary">
                    Sign Up to Save Results
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentCardIndex + 1) / shuffledCards.length) * 100;
  const currentCard = shuffledCards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleGoBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentCardIndex + 1} of {shuffledCards.length}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            60-Second Pulse Check
          </h1>
          
          <Progress value={progress} className="w-full h-2" />
        </div>

        {/* Card Container */}
        <div className="relative h-[500px] w-full max-w-md mx-auto">
          {shuffledCards.slice(currentCardIndex, currentCardIndex + 3).map((card, index) => (
            <SwipeCard
              key={card.id}
              card={card}
              onSwipe={handleSwipe}
              isActive={index === 0}
              zIndex={10 - index}
            />
          ))}
        </div>

        {/* Category Progress */}
        <div className="mt-6 mb-4">
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            {Object.entries(getCategoryProgress()).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  count >= 1 
                    ? 'bg-purple-500 border-purple-500 text-white' 
                    : 'bg-transparent border-gray-600 text-gray-400'
                }`}>
                  {count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{category}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Keep at least 1 from each category to unlock results
          </p>
        </div>

        {/* Get Results Button */}
        {showResultsButton && (
          <div className="text-center mb-6">
            <Button 
              onClick={() => setIsComplete(true)} 
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-secondary"
            >
              <ArrowRight className="w-4 h-4" />
              Get Your Results
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-muted-foreground">
            Tap to reveal, then swipe or tap to choose
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Swipe left to pass</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">Swipe right to keep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}