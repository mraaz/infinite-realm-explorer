
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logDebug, logError, logInfo } from '@/utils/logger';
import { SurveySession, PENDING_ANSWERS_KEY, PENDING_STEP_KEY } from './types';
import { generateBasicScores, generateBasicInsights, generateBasicActions } from './helperFunctions';

export const useSurveyOperations = () => {
  const { toast } = useToast();

  const updateSurveyAnswers = async (surveyId: string, answers: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ 
          answers,
          updated_at: new Date().toISOString()
        })
        .eq('id', surveyId);

      if (error) {
        logError('Error updating survey answers:', error);
        throw error;
      }
      
      logDebug("Updated survey answers in database:", answers);
    } catch (error) {
      logError('Failed to update survey answers:', error);
      throw error;
    }
  };

  const saveAnswer = async (user: any, surveySession: SurveySession | null, setSurveySession: any, questionId: string, answer: any) => {
    if (!user) {
      const existingAnswers = JSON.parse(localStorage.getItem(PENDING_ANSWERS_KEY) || '{}');
      const updatedAnswers = { ...existingAnswers, [questionId]: answer };
      localStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(updatedAnswers));
      logDebug("Stored answer in localStorage (pre-login):", { questionId, answer });
      return { success: true };
    }

    if (!surveySession) {
      logError("No survey session available to save answer");
      return { success: false };
    }

    try {
      const updatedAnswers = {
        ...surveySession.answers,
        [questionId]: answer
      };

      await updateSurveyAnswers(surveySession.id, updatedAnswers);

      setSurveySession((prev: SurveySession | null) => prev ? {
        ...prev,
        answers: updatedAnswers,
        updated_at: new Date().toISOString()
      } : null);

      logDebug("Saved answer:", { questionId, answer, surveyId: surveySession.id });
      return { success: true };
    } catch (error) {
      logError('Save answer error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your answer. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const storePendingProgress = (answers: Record<string, any>, currentStep: number) => {
    localStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(answers));
    localStorage.setItem(PENDING_STEP_KEY, currentStep.toString());
    logDebug("Stored pending progress:", { answers, currentStep });
  };

  const completeSurvey = async (surveySession: SurveySession | null, user: any, setSurveySession: any, completionInProgress: React.MutableRefObject<boolean>) => {
    if (!surveySession || !user || completionInProgress.current) {
      logError("Cannot complete survey - missing session, user, or completion in progress");
      return { success: false };
    }

    completionInProgress.current = true;

    try {
      logInfo("Completing survey:", surveySession.id);

      const { data: currentSurvey, error: checkError } = await supabase
        .from('surveys')
        .select('status')
        .eq('id', surveySession.id)
        .single();

      if (checkError) {
        logError('Error checking survey status:', checkError);
        throw new Error('Failed to check survey status');
      }

      if (currentSurvey.status === 'completed') {
        logInfo("Survey already completed, skipping completion");
        return { success: true };
      }

      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('survey_id', surveySession.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        logError('Error checking existing profile:', profileCheckError);
        throw new Error('Failed to check existing profile');
      }

      if (existingProfile) {
        logInfo("Profile already exists for survey, skipping creation");
        
        const { error: updateError } = await supabase
          .from('surveys')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', surveySession.id);

        if (updateError) {
          logError('Error completing survey:', updateError);
          throw new Error('Failed to complete survey');
        }

        setSurveySession((prev: SurveySession | null) => prev ? { 
          ...prev, 
          status: 'completed' as const,
          updated_at: new Date().toISOString()
        } : null);

        return { success: true };
      }

      const { error: updateError } = await supabase
        .from('surveys')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', surveySession.id);

      if (updateError) {
        logError('Error completing survey:', updateError);
        throw new Error('Failed to complete survey');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          survey_id: surveySession.id,
          scores: generateBasicScores(surveySession.answers),
          insights: generateBasicInsights(surveySession.answers),
          actions: generateBasicActions(surveySession.answers)
        });

      if (profileError) {
        logError('Error creating profile:', profileError);
      } else {
        logDebug("Profile created successfully");
      }

      setSurveySession((prev: SurveySession | null) => prev ? { 
        ...prev, 
        status: 'completed' as const,
        updated_at: new Date().toISOString()
      } : null);

      toast({
        title: "Survey Completed!",
        description: "Your 5-Year Snapshot is ready. View your results now.",
      });

      return { success: true };
    } catch (error) {
      logError('Complete survey error:', error);
      toast({
        title: "Completion Failed",
        description: "Unable to complete your survey. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      completionInProgress.current = false;
    }
  };

  const makePublic = async (surveySession: SurveySession | null, user: any) => {
    if (!surveySession || !user) {
      logError("Cannot make survey public - missing session or user");
      return { success: false, publicSlug: null };
    }

    try {
      logInfo("Making survey public:", surveySession.id);

      const { error: surveyError } = await supabase
        .from('surveys')
        .update({ 
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', surveySession.id);

      if (surveyError) {
        logError('Error making survey public:', surveyError);
        throw new Error('Failed to make survey public');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('public_slug')
        .eq('id', user.id)
        .single();

      if (userError) {
        logError('Error fetching user slug:', userError);
        throw new Error('Failed to get public link');
      }

      const { error: updateUserError } = await supabase
        .from('users')
        .update({ is_public: true })
        .eq('id', user.id);

      if (updateUserError) {
        logError('Error updating user public status:', updateUserError);
      }

      logDebug("Survey made public with slug:", userData.public_slug);
      return { success: true, publicSlug: userData.public_slug };
    } catch (error) {
      logError('Make public error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to create shareable link. Please try again.",
        variant: "destructive",
      });
      return { success: false, publicSlug: null };
    }
  };

  return {
    updateSurveyAnswers,
    saveAnswer,
    storePendingProgress,
    completeSurvey,
    makePublic
  };
};
