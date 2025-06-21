
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';

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
  const { user, isVerified } = useSecureAuth();

  useEffect(() => {
    const fetchResults = async () => {
      // Early return if user is not authenticated
      if (!user?.id || !isVerified) {
        console.log('User not authenticated or missing ID, waiting...', { user: user?.id, isVerified });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);

        console.log('Fetching results for user:', user.id);

        // Get the current session to ensure we have a valid token
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsError(true);
          toast({
            title: "Authentication Error",
            description: "Please sign in again to view your results.",
            variant: "destructive",
          });
          return;
        }

        const session = sessionData?.session;
        if (!session?.access_token) {
          console.error('No valid session or access token found');
          setIsError(true);
          toast({
            title: "Authentication Error",
            description: "Please sign in again to view your results.",
            variant: "destructive",
          });
          return;
        }

        console.log('Calling generate-results edge function...');

        const { data, error } = await supabase.functions.invoke('generate-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id
          })
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

        console.log('Results received:', data);

        if (data?.life_dashboard_chart && data?.smart_takeaways) {
          setResults(data);
        } else {
          console.error('Invalid data structure received:', data);
          setIsError(true);
          toast({
            title: "Error",
            description: "Received invalid data format. Please try again.",
            variant: "destructive",
          });
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
  }, [user?.id, isVerified, toast]);

  return {
    results,
    isLoading,
    isError,
    refetch: () => {
      if (user?.id && isVerified) {
        setIsLoading(true);
        setIsError(false);
        // Re-trigger the effect by refreshing the page or manually calling fetchResults
        window.location.reload();
      }
    }
  };
};
