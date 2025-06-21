
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
    if (!surveySession || !user) {
      logError("Cannot complete survey - missing session or user");
      return { success: false, error: "Missing session or user" };
    }

    if (completionInProgress.current) {
      logInfo("Survey completion already in progress, skipping");
      return { success: false, error: "Completion already in progress" };
    }

    completionInProgress.current = true;

    try {
      logInfo("Starting survey completion process:", surveySession.id);

      // Step 1: Check current survey status
      const { data: currentSurvey, error: checkError } = await supabase
        .from('surveys')
        .select('status, answers')
        .eq('id', surveySession.id)
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        logError('Error checking survey status:', checkError);
        throw new Error('Failed to verify survey status: ' + checkError.message);
      }

      if (currentSurvey.status === 'completed') {
        logInfo("Survey already completed, proceeding to success");
        return { success: true };
      }

      // Step 2: Check if profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, scores, insights, actions')
        .eq('survey_id', surveySession.id)
        .maybeSingle();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        logError('Error checking existing profile:', profileCheckError);
        throw new Error('Failed to check existing profile: ' + profileCheckError.message);
      }

      // Step 3: Update survey status to completed
      logInfo("Updating survey status to completed");
      const { error: updateError } = await supabase
        .from('surveys')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', surveySession.id)
        .eq('user_id', user.id);

      if (updateError) {
        logError('Error updating survey status:', updateError);
        throw new Error('Failed to complete survey: ' + updateError.message);
      }

      logInfo("Survey status updated successfully");

      // Step 4: Create profile only if it doesn't exist
      if (!existingProfile) {
        logInfo("Creating new profile for survey");
        
        // Safely handle the answers data and ensure it's a proper object
        const answersData = currentSurvey.answers || surveySession.answers || {};
        const safeAnswers = typeof answersData === 'object' && answersData !== null ? answersData as Record<string, any> : {};
        
        const profileData = {
          survey_id: surveySession.id,
          scores: generateBasicScores(safeAnswers),
          insights: generateBasicInsights(safeAnswers),
          actions: generateBasicActions(safeAnswers)
        };

        logDebug("Profile data to insert:", profileData);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          logError('Error creating profile:', profileError);
          // Don't throw here - survey is still completed, but log the issue
          logError("Profile creation failed but survey is completed");
        } else {
          logInfo("Profile created successfully");
        }
      } else {
        logInfo("Profile already exists, skipping creation");
      }

      // Step 5: Update local state
      setSurveySession((prev: SurveySession | null) => prev ? { 
        ...prev, 
        status: 'completed' as const,
        updated_at: new Date().toISOString()
      } : null);

      toast({
        title: "Survey Completed!",
        description: "Your assessment is ready. View your results now.",
      });

      logInfo("Survey completion successful");
      return { success: true };

    } catch (error) {
      logError('Complete survey error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Completion Failed", 
        description: `Unable to complete your survey: ${errorMessage}`,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
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

      // Update survey to public
      const { error: surveyError } = await supabase
        .from('surveys')
        .update({ 
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', surveySession.id)
        .eq('user_id', user.id);

      if (surveyError) {
        logError('Error making survey public:', surveyError);
        throw new Error('Failed to make survey public');
      }

      // Get user's public slug
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('public_slug')
        .eq('id', user.id)
        .single();

      if (userError) {
        logError('Error fetching user slug:', userError);
        throw new Error('Failed to get public link');
      }

      // Update user public status
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
