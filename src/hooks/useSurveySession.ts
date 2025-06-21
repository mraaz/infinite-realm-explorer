
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from './useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import { logDebug, logError, logInfo } from '@/utils/logger';

interface SurveySession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

const PENDING_ANSWERS_KEY = 'pendingAnswers';
const PENDING_STEP_KEY = 'pendingStep';

export const useSurveySession = () => {
  const [surveySession, setSurveySession] = useState<SurveySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, isVerified } = useSecureAuth();
  const { toast } = useToast();
  const completionInProgress = useRef(false);

  // Load or create survey session on mount
  useEffect(() => {
    if (user && isVerified) {
      loadOrCreateSession();
    } else {
      setIsLoading(false);
    }
  }, [user, isVerified]);

  const loadOrCreateSession = async () => {
    if (!user) {
      logError("No user found when loading survey session");
      return;
    }

    try {
      setIsLoading(true);
      logDebug("Loading survey session for user:", user.id);

      // Check for existing in_progress survey
      const { data: openSurveys, error: fetchError } = await supabase
        .from('surveys')
        .select('id, user_id, status, answers, created_at, updated_at, is_public')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        logError('Error fetching surveys:', fetchError);
        throw new Error('Failed to load survey');
      }

      logDebug("Open surveys found:", openSurveys);

      const existingSurvey = openSurveys?.[0];

      // Check for pending answers from pre-login state
      const pendingAnswers = localStorage.getItem(PENDING_ANSWERS_KEY);
      const pendingStep = localStorage.getItem(PENDING_STEP_KEY);
      
      if (pendingAnswers && pendingStep) {
        logDebug("Found pending pre-login answers:", JSON.parse(pendingAnswers));
        
        const parsedAnswers = JSON.parse(pendingAnswers);
        
        if (existingSurvey) {
          // Merge pending answers with existing survey
          const mergedAnswers = { ...existingSurvey.answers as Record<string, any>, ...parsedAnswers };
          await updateSurveyAnswers(existingSurvey.id, mergedAnswers);
          
          const sessionData: SurveySession = {
            id: existingSurvey.id,
            user_id: existingSurvey.user_id || '',
            status: (existingSurvey.status as 'in_progress' | 'completed') || 'in_progress',
            answers: mergedAnswers,
            created_at: existingSurvey.created_at || new Date().toISOString(),
            updated_at: existingSurvey.updated_at || new Date().toISOString(),
            is_public: existingSurvey.is_public || false
          };
          
          setSurveySession(sessionData);
          setIsResuming(true);
        } else {
          // Create new survey with pending answers
          const { data: newSurvey, error: insertError } = await supabase
            .from('surveys')
            .insert({
              user_id: user.id,
              status: 'in_progress',
              answers: parsedAnswers
            })
            .select('id, user_id, status, answers, created_at, updated_at, is_public')
            .single();

          if (insertError) {
            logError('Error creating survey with pending answers:', insertError);
            throw new Error('Failed to create survey');
          }

          const sessionData: SurveySession = {
            id: newSurvey.id,
            user_id: newSurvey.user_id || '',
            status: (newSurvey.status as 'in_progress' | 'completed') || 'in_progress',
            answers: parsedAnswers,
            created_at: newSurvey.created_at || new Date().toISOString(),
            updated_at: newSurvey.updated_at || new Date().toISOString(),
            is_public: newSurvey.is_public || false
          };
          
          setSurveySession(sessionData);
          setIsResuming(true);
        }
        
        // Clear pending data
        localStorage.removeItem(PENDING_ANSWERS_KEY);
        localStorage.removeItem(PENDING_STEP_KEY);
      }

      if (existingSurvey && !pendingAnswers) {
        // Found existing survey - resume
        const sessionData: SurveySession = {
          id: existingSurvey.id,
          user_id: existingSurvey.user_id || '',
          status: (existingSurvey.status as 'in_progress' | 'completed') || 'in_progress',
          answers: (existingSurvey.answers as Record<string, any>) || {},
          created_at: existingSurvey.created_at || new Date().toISOString(),
          updated_at: existingSurvey.updated_at || new Date().toISOString(),
          is_public: existingSurvey.is_public || false
        };
        setSurveySession(sessionData);
        setIsResuming(true);
        logInfo("Resuming existing survey session:", sessionData.id);
        toast({
          title: "Welcome back!",
          description: "Resuming your 5-Year Snapshot from where you left off.",
        });
      } else if (!pendingAnswers && !existingSurvey) {
        // Create new survey session
        const { data: newSurvey, error: insertError } = await supabase
          .from('surveys')
          .insert({
            user_id: user.id,
            status: 'in_progress',
            answers: {}
          })
          .select('id, user_id, status, answers, created_at, updated_at, is_public')
          .single();

        if (insertError) {
          logError('Error creating new survey:', insertError);
          throw new Error('Failed to create survey');
        }

        const sessionData: SurveySession = {
          id: newSurvey.id,
          user_id: newSurvey.user_id || '',
          status: (newSurvey.status as 'in_progress' | 'completed') || 'in_progress',
          answers: {},
          created_at: newSurvey.created_at || new Date().toISOString(),
          updated_at: newSurvey.updated_at || new Date().toISOString(),
          is_public: newSurvey.is_public || false
        };
        setSurveySession(sessionData);
        setIsResuming(false);
        logInfo("Created new survey session:", sessionData.id);
      }
    } catch (error) {
      logError('Survey session error:', error);
      toast({
        title: "Survey Error",
        description: "Unable to load your survey. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const saveAnswer = async (questionId: string, answer: any) => {
    if (!user) {
      // Store in localStorage for pre-login state
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

      // Update local session
      setSurveySession(prev => prev ? {
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

  const completeSurvey = async () => {
    if (!surveySession || !user || completionInProgress.current) {
      logError("Cannot complete survey - missing session, user, or completion in progress");
      return { success: false };
    }

    // Prevent multiple completion attempts
    completionInProgress.current = true;
    setIsCompleting(true);

    try {
      logInfo("Completing survey:", surveySession.id);

      // Check if survey is already completed
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

      // Check if profile already exists for this survey
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
        
        // Just mark survey as completed
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

        setSurveySession(prev => prev ? { 
          ...prev, 
          status: 'completed',
          updated_at: new Date().toISOString()
        } : null);

        return { success: true };
      }

      // Mark survey as completed first
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

      // Create profile entry - ONLY if it doesn't exist
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
        // Don't throw here - survey completion is more important
      } else {
        logDebug("Profile created successfully");
      }

      setSurveySession(prev => prev ? { 
        ...prev, 
        status: 'completed',
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
      setIsCompleting(false);
    }
  };

  const makePublic = async () => {
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
        .eq('id', surveySession.id);

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

      // Update user to public if not already
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ is_public: true })
        .eq('id', user.id);

      if (updateUserError) {
        logError('Error updating user public status:', updateUserError);
        // Don't throw - we still have the slug
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
    surveySession,
    isLoading,
    isResuming,
    isCompleting,
    saveAnswer,
    completeSurvey,
    makePublic,
    storePendingProgress,
    isAuthenticated: !!user && isVerified
  };
};

// Helper functions for basic score/insight generation
const generateBasicScores = (answers: Record<string, any>) => {
  const pillars = { Career: 0, Finances: 0, Health: 0, Connections: 0 };
  
  Object.entries(answers).forEach(([key, value]) => {
    if (key.includes('career')) {
      pillars.Career += typeof value === 'number' ? value : 5;
    } else if (key.includes('financial')) {
      pillars.Finances += typeof value === 'number' ? value : 5;
    } else if (key.includes('health')) {
      pillars.Health += typeof value === 'number' ? value : 5;
    } else if (key.includes('connections')) {
      pillars.Connections += typeof value === 'number' ? value : 5;
    }
  });

  return pillars;
};

const generateBasicInsights = (answers: Record<string, any>) => {
  return [
    {
      title: "Career Focus",
      description: "Based on your responses, you're building a strong foundation in your career."
    },
    {
      title: "Growth Mindset",
      description: "Your answers indicate a forward-thinking approach to personal development."
    }
  ];
};

const generateBasicActions = (answers: Record<string, any>) => {
  return [
    {
      title: "Weekly Career Planning",
      description: "Set aside 30 minutes each week to plan your career goals."
    },
    {
      title: "Health Check-in",
      description: "Schedule regular health and wellness check-ins with yourself."
    }
  ];
};
