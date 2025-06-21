
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from './useSecureAuth';
import { useToast } from '@/hooks/use-toast';

interface SurveySession {
  id: string;
  user_id: string;
  status: 'open' | 'completed';
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

export const useSurveySession = () => {
  const [surveySession, setSurveySession] = useState<SurveySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const { user, isVerified } = useSecureAuth();
  const { toast } = useToast();

  // Load or create survey session on mount
  useEffect(() => {
    if (user && isVerified) {
      loadOrCreateSession();
    } else {
      setIsLoading(false);
    }
  }, [user, isVerified]);

  const loadOrCreateSession = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Check for existing open survey
      const { data: existingSurvey, error: fetchError } = await supabase
        .from('surveys')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching survey:', fetchError);
        throw new Error('Failed to load survey');
      }

      if (existingSurvey) {
        // Found existing survey - resume
        const sessionData: SurveySession = {
          ...existingSurvey,
          answers: existingSurvey.answers as Record<string, any> || {},
          updated_at: existingSurvey.updated_at || existingSurvey.created_at
        };
        setSurveySession(sessionData);
        setIsResuming(true);
        toast({
          title: "Welcome back!",
          description: "Resuming your 5-Year Snapshot from where you left off.",
        });
      } else {
        // Create new survey session
        const { data: newSurvey, error: insertError } = await supabase
          .from('surveys')
          .insert({
            user_id: user.id,
            status: 'open',
            answers: {}
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating survey:', insertError);
          throw new Error('Failed to create survey');
        }

        const sessionData: SurveySession = {
          ...newSurvey,
          answers: newSurvey.answers as Record<string, any> || {},
          updated_at: newSurvey.updated_at || newSurvey.created_at
        };
        setSurveySession(sessionData);
        setIsResuming(false);
      }
    } catch (error) {
      console.error('Survey session error:', error);
      toast({
        title: "Survey Error",
        description: "Unable to load your survey. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, answer: any) => {
    if (!surveySession || !user) return { success: false };

    try {
      const updatedAnswers = {
        ...surveySession.answers,
        [questionId]: answer
      };

      const { error } = await supabase
        .from('surveys')
        .update({
          answers: updatedAnswers,
          updated_at: new Date().toISOString()
        })
        .eq('id', surveySession.id);

      if (error) {
        console.error('Error saving answer:', error);
        throw new Error('Failed to save answer');
      }

      // Update local session
      setSurveySession(prev => prev ? {
        ...prev,
        answers: updatedAnswers,
        updated_at: new Date().toISOString()
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Save answer error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your answer. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const completeSurvey = async () => {
    if (!surveySession || !user) return { success: false };

    try {
      // Mark survey as completed
      const { error: updateError } = await supabase
        .from('surveys')
        .update({ status: 'completed' })
        .eq('id', surveySession.id);

      if (updateError) {
        console.error('Error completing survey:', updateError);
        throw new Error('Failed to complete survey');
      }

      // Create profile entry (basic implementation - you can enhance with AI-generated insights)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          survey_id: surveySession.id,
          scores: generateBasicScores(surveySession.answers),
          insights: generateBasicInsights(surveySession.answers),
          actions: generateBasicActions(surveySession.answers)
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here - survey completion is more important
      }

      setSurveySession(prev => prev ? { ...prev, status: 'completed' } : null);

      toast({
        title: "Survey Completed!",
        description: "Your 5-Year Snapshot is ready. View your results now.",
      });

      return { success: true };
    } catch (error) {
      console.error('Complete survey error:', error);
      toast({
        title: "Completion Failed",
        description: "Unable to complete your survey. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const makePublic = async () => {
    if (!surveySession || !user) return { success: false, publicSlug: null };

    try {
      // Update survey to public
      const { error: surveyError } = await supabase
        .from('surveys')
        .update({ is_public: true })
        .eq('id', surveySession.id);

      if (surveyError) {
        console.error('Error making survey public:', surveyError);
        throw new Error('Failed to make survey public');
      }

      // Get user's public slug
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('public_slug')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user slug:', userError);
        throw new Error('Failed to get public link');
      }

      // Update user to public if not already
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ is_public: true })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('Error updating user public status:', updateUserError);
        // Don't throw - we still have the slug
      }

      return { success: true, publicSlug: userData.public_slug };
    } catch (error) {
      console.error('Make public error:', error);
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
    saveAnswer,
    completeSurvey,
    makePublic,
    isAuthenticated: !!user && isVerified
  };
};

// Helper functions for basic score/insight generation
const generateBasicScores = (answers: Record<string, any>) => {
  // Basic scoring logic - you can enhance this with AI
  const pillars = { Career: 0, Finances: 0, Health: 0, Connections: 0 };
  
  // Simple scoring based on slider values and multiple choice answers
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
