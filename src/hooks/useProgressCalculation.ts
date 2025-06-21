
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const useProgressCalculation = () => {
  const { answers } = useQuestionnaireStore();
  const { user } = useSecureAuth();
  const [databaseScores, setDatabaseScores] = useState<any>(null);

  // Fetch scores from database
  useEffect(() => {
    const fetchDatabaseScores = async () => {
      if (!user?.id) return;

      try {
        console.log('Fetching database scores for user:', user.id);
        
        // Get the latest completed survey for this user
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (surveyError) {
          console.error('Error fetching survey:', surveyError);
          return;
        }

        if (!surveyData) {
          console.log('No completed surveys found for user');
          setDatabaseScores(null);
          return;
        }

        // Get profile data for the latest survey
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('scores')
          .eq('survey_id', surveyData.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile scores:', profileError);
          return;
        }

        if (profileData?.scores) {
          console.log('Database scores found:', profileData.scores);
          setDatabaseScores(profileData.scores);
        } else {
          console.log('No profile scores found');
          setDatabaseScores(null);
        }
      } catch (error) {
        console.error('Error in fetchDatabaseScores:', error);
        setDatabaseScores(null);
      }
    };

    fetchDatabaseScores();
  }, [user?.id]);

  const calculateCurrentProgress = () => {
    // If we have database scores, use those (they take priority)
    if (databaseScores) {
      console.log('Using database scores:', databaseScores);
      return {
        basics: parseFloat(databaseScores.basics || 0),
        career: parseFloat(databaseScores.Career || databaseScores.career || 0),
        finances: parseFloat(databaseScores.Finances || databaseScores.finances || 0),
        health: parseFloat(databaseScores.Health || databaseScores.health || 0),
        connections: parseFloat(databaseScores.Connections || databaseScores.connections || 0),
      };
    }

    // Fallback to calculating from answers if no database scores
    console.log('Calculating from answers, no database scores available');
    
    if (!answers || Object.keys(answers).length === 0) {
      console.log('No answers available, returning zeros');
      return {
        basics: 0,
        career: 0,
        finances: 0,
        health: 0,
        connections: 0,
      };
    }

    // Simple calculation based on answers (this is a fallback)
    const calculatePillarScore = (pillarQuestions: string[]) => {
      const relevantAnswers = pillarQuestions
        .map(q => answers[q])
        .filter(a => a !== undefined && a !== null);
      
      if (relevantAnswers.length === 0) return 0;
      
      const sum = relevantAnswers.reduce((acc, answer) => {
        const numValue = typeof answer === 'number' ? answer : 
                        typeof answer === 'string' ? parseFloat(answer) : 0;
        return acc + (isNaN(numValue) ? 0 : numValue);
      }, 0);
      
      return Math.round((sum / relevantAnswers.length) * 20); // Convert to 0-100 scale
    };

    return {
      basics: 0, // Not used in current implementation
      career: calculatePillarScore(['career1', 'career2', 'career3', 'career4', 'career5']),
      finances: calculatePillarScore(['finances1', 'finances2', 'finances3', 'finances4', 'finances5']),
      health: calculatePillarScore(['health1', 'health2', 'health3', 'health4', 'health5']),
      connections: calculatePillarScore(['connections1', 'connections2', 'connections3', 'connections4', 'connections5']),
    };
  };

  const calculateFutureProgress = (isFutureQuestionnaireComplete: boolean) => {
    if (!isFutureQuestionnaireComplete) {
      return undefined;
    }

    // For future progress, we use the current progress as a baseline
    // and add some improvement (this could be more sophisticated)
    const currentProgress = calculateCurrentProgress();
    
    return {
      basics: Math.min(100, currentProgress.basics + 20),
      career: Math.min(100, currentProgress.career + 20),
      finances: Math.min(100, currentProgress.finances + 20),
      health: Math.min(100, currentProgress.health + 20),
      connections: Math.min(100, currentProgress.connections + 20),
    };
  };

  return {
    calculateCurrentProgress,
    calculateFutureProgress,
    databaseScores, // Expose this for debugging
  };
};
