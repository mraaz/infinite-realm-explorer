
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PulseCheckCard } from '@/data/pulseCheckCards';
import { logger } from '@/utils/logger';

interface AIResults {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
  insights: {
    Career: string;
    Finances: string;
    Health: string;
    Connections: string;
  };
}

interface PulseCheckResult {
  cardId: number;
  decision: 'keep' | 'pass';
  card_data: {
    category: string;
    tone: 'positive' | 'negative';
    text: string;
  };
}

export function useAIResults() {
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIResults = async (
    answers: { [key: number]: 'keep' | 'pass' },
    cards: PulseCheckCard[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare results data for AI analysis
      const results: PulseCheckResult[] = Object.entries(answers).map(([cardId, decision]) => {
        const card = cards.find(c => c.id === Number(cardId));
        if (!card) throw new Error(`Card not found: ${cardId}`);
        
        return {
          cardId: Number(cardId),
          decision,
          card_data: {
            category: card.category,
            tone: card.tone,
            text: card.text
          }
        };
      });

      logger.debug('Calling generate-scores edge function', { results });

      const { data, error: functionError } = await supabase.functions.invoke('generate-scores', {
        body: { results }
      });

      if (functionError) {
        logger.error('Edge function error', { functionError });
        throw new Error(functionError.message);
      }

      if (data.error) {
        logger.error('AI generation error', { error: data.error });
        // Use fallback scores if AI fails
        const fallbackResults = generateFallbackScores(answers, cards);
        setAiResults(fallbackResults);
      } else {
        logger.info('AI results received successfully', { data });
        setAiResults(data as AIResults);
      }
    } catch (err) {
      logger.error('Error generating AI results', { err });
      setError(err instanceof Error ? err.message : 'Failed to generate results');
      
      // Use fallback scores
      const fallbackResults = generateFallbackScores(answers, cards);
      setAiResults(fallbackResults);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackScores = (
    answers: { [key: number]: 'keep' | 'pass' },
    cards: PulseCheckCard[]
  ): AIResults => {
    const categories = ['Career', 'Finances', 'Health', 'Connections'] as const;
    const results: any = { insights: {} };

    categories.forEach(category => {
      const categoryCards = cards.filter(card => card.category === category);
      const answeredCards = categoryCards.filter(card => answers[card.id] !== undefined);
      const keptCards = categoryCards.filter(card => answers[card.id] === 'keep');
      
      if (answeredCards.length > 0) {
        results[category] = Math.round((keptCards.length / answeredCards.length) * 100);
      } else {
        results[category] = 50; // Default score
      }
      
      results.insights[category] = `Based on your responses, your ${category.toLowerCase()} score reflects your current focus in this area.`;
    });

    return results as AIResults;
  };

  return {
    aiResults,
    isLoading,
    error,
    generateAIResults
  };
}
