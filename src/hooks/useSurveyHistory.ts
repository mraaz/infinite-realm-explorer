
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export interface SurveyHistoryItem {
  id: string;
  created_at: string;
  status: string;
  is_public: boolean;
  answers: Record<string, any>;
  profiles: {
    scores: Record<string, any>;
  }[];
}

export const useSurveyHistory = () => {
  const [surveys, setSurveys] = useState<SurveyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const { user, isVerified } = useSecureAuth();

  useEffect(() => {
    const fetchSurveyHistory = async () => {
      if (!user?.id || !isVerified) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);

        console.log('Fetching survey history for user:', user.id);

        const { data, error } = await supabase
          .from('surveys')
          .select(`
            id,
            created_at,
            status,
            is_public,
            answers,
            profiles(scores)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching survey history:', error);
          setIsError(true);
          toast({
            title: "Error",
            description: "Failed to load your survey history. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('Survey history received:', data);
        setSurveys(data || []);
      } catch (error) {
        console.error('Error in fetchSurveyHistory:', error);
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

    fetchSurveyHistory();
  }, [user?.id, isVerified, toast]);

  return {
    surveys,
    isLoading,
    isError,
    refetch: () => {
      if (user?.id && isVerified) {
        setIsLoading(true);
        setIsError(false);
        // Re-trigger the effect
        setSurveys([]);
      }
    }
  };
};
