
import { useQuery } from '@tanstack/react-query';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';

export interface LifeDashboardChart {
  career: { creative: number; reactive: number };
  health: { creative: number; reactive: number };
  relationships: { creative: number; reactive: number };
  personal_growth: { creative: number; reactive: number };
}

export interface SmartTakeaway {
  id: string;
  title: string;
  description: string;
  type: 'insight' | 'warning' | 'opportunity';
  pillar: string;
}

export interface GeneratedResults {
  life_dashboard_chart: LifeDashboardChart;
  smart_takeaways: SmartTakeaway[];
}

// Mock data generator for unauthorized users
const generateMockResults = (answers: Record<string, any>): GeneratedResults => {
  // Simple algorithm to generate mock data based on answers
  const mockChart: LifeDashboardChart = {
    career: { creative: 60, reactive: 40 },
    health: { creative: 45, reactive: 55 },
    relationships: { creative: 70, reactive: 30 },
    personal_growth: { creative: 55, reactive: 45 }
  };

  const mockTakeaways: SmartTakeaway[] = [
    {
      id: '1',
      title: 'Career Momentum Building',
      description: 'Your career responses show strong creative alignment. Consider leveraging this strength.',
      type: 'insight',
      pillar: 'career'
    },
    {
      id: '2',
      title: 'Health Balance Opportunity',
      description: 'Your health pillar shows room for more strategic, creative approaches to wellness.',
      type: 'opportunity',
      pillar: 'health'
    },
    {
      id: '3',
      title: 'Strong Relationship Foundation',
      description: 'Your connections show predominantly creative patterns - a key strength to maintain.',
      type: 'insight',
      pillar: 'relationships'
    }
  ];

  return {
    life_dashboard_chart: mockChart,
    smart_takeaways: mockTakeaways
  };
};

export const useGenerateResults = () => {
  const { answers } = useQuestionnaireStore();
  const { user, isVerified } = useSecureAuth();
  const isAuthenticated = user?.id && isVerified;

  return useQuery({
    queryKey: ['generate-results', answers, isAuthenticated],
    queryFn: async (): Promise<GeneratedResults> => {
      // If user is not authenticated, generate mock results from memory
      if (!isAuthenticated) {
        if (!answers || Object.keys(answers).length === 0) {
          throw new Error('No answers available');
        }
        return generateMockResults(answers);
      }

      // For authenticated users, use the edge function
      if (!answers || Object.keys(answers).length === 0) {
        throw new Error('No answers available for processing');
      }

      const { data, error } = await supabase.functions.invoke('generate-results', {
        body: { answers }
      });

      if (error) {
        console.error('Error generating results:', error);
        throw new Error(error.message || 'Failed to generate results');
      }

      if (!data || !data.life_dashboard_chart || !data.smart_takeaways) {
        throw new Error('Invalid response format from results generation');
      }

      return data;
    },
    enabled: !!answers && Object.keys(answers).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error.message?.includes('authentication') || error.message?.includes('No answers')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};
