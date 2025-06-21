
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logDebug, logError, logInfo } from '@/utils/logger';
import { SurveySession, PENDING_ANSWERS_KEY, PENDING_STEP_KEY } from './types';

export const useSurveySessionLoader = () => {
  const { toast } = useToast();

  const loadOrCreateSession = async (user: any, setSurveySession: any, setIsResuming: any, updateSurveyAnswers: any) => {
    if (!user) {
      logError("No user found when loading survey session");
      return;
    }

    try {
      logDebug("Loading survey session for user:", user.id);

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
      const pendingAnswers = localStorage.getItem(PENDING_ANSWERS_KEY);
      const pendingStep = localStorage.getItem(PENDING_STEP_KEY);
      
      if (pendingAnswers && pendingStep) {
        logDebug("Found pending pre-login answers:", JSON.parse(pendingAnswers));
        
        const parsedAnswers = JSON.parse(pendingAnswers);
        
        if (existingSurvey) {
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
        
        localStorage.removeItem(PENDING_ANSWERS_KEY);
        localStorage.removeItem(PENDING_STEP_KEY);
      }

      if (existingSurvey && !pendingAnswers) {
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
    }
  };

  return { loadOrCreateSession };
};
