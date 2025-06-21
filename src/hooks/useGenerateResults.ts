
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LifeDashboardChart {
  career: {
    creative: number;
    reactive: number;
  };
  health: {
    creative: number;
    reactive: number;
  };
  relationships: {
    creative: number;
    reactive: number;
  };
  personal_growth: {
    creative: number;
    reactive: number;
  };
}

export interface SmartTakeaway {
  title: string;
  explanation: string;
}

export interface GeneratedResults {
  life_dashboard_chart: LifeDashboardChart;
  smart_takeaways: SmartTakeaway[];
}

export const useGenerateResults = () => {
  const [results, setResults] = useState<GeneratedResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const { data, error } = await supabase.functions.invoke('generate-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (error) {
          console.error('Error fetching results:', error);
          setIsError(true);
          toast({
            title: "Error",
            description: "Failed to generate your results. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setResults(data);
        }
      } catch (error) {
        console.error('Error in fetchResults:', error);
        setIsError(true);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [toast]);

  return {
    results,
    isLoading,
    isError,
    refetch: () => {
      setIsLoading(true);
      setIsError(false);
      // Re-trigger the effect
      window.location.reload();
    }
  };
};
