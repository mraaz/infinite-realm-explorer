
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from './useSecureAuth';
import { surveyAnswerSchema, checkRateLimit } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

export const useSecureSurvey = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isVerified } = useSecureAuth();
  const { toast } = useToast();

  const saveSurveyProgress = async (answers: Record<string, any>) => {
    if (!user || !isVerified) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your progress.",
        variant: "destructive",
      });
      return { error: { message: 'Authentication required' } };
    }

    // Rate limiting check
    if (!checkRateLimit(`survey-${user.id}`, 5, 60000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait before saving again.",
        variant: "destructive",
      });
      return { error: { message: 'Rate limited' } };
    }

    setIsSubmitting(true);

    try {
      // Validate all answers
      const validatedAnswers: Record<string, any> = {};
      for (const [questionId, answer] of Object.entries(answers)) {
        try {
          const validated = surveyAnswerSchema.parse({
            questionId,
            answer
          });
          validatedAnswers[questionId] = validated.answer;
        } catch (error) {
          console.warn(`Invalid answer for question ${questionId}:`, error);
          // Skip invalid answers rather than failing entirely
          continue;
        }
      }

      // Check for existing survey
      const { data: existingSurvey, error: fetchError } = await supabase
        .from('surveys')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing survey:', fetchError);
        throw new Error('Failed to check existing survey');
      }

      let surveyId: string;

      if (existingSurvey) {
        // Update existing survey
        const { error: updateError } = await supabase
          .from('surveys')
          .update({
            answers: validatedAnswers,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSurvey.id);

        if (updateError) {
          console.error('Error updating survey:', updateError);
          throw new Error('Failed to update survey');
        }

        surveyId = existingSurvey.id;
      } else {
        // Create new survey
        const { data: newSurvey, error: insertError } = await supabase
          .from('surveys')
          .insert({
            user_id: user.id,
            answers: validatedAnswers,
            status: 'in_progress'
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error creating survey:', insertError);
          throw new Error('Failed to create survey');
        }

        surveyId = newSurvey.id;
      }

      toast({
        title: "Progress Saved",
        description: "Your survey progress has been securely saved.",
      });

      return { surveyId, error: null };
    } catch (error) {
      console.error('Save survey error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your progress. Please try again.",
        variant: "destructive",
      });
      return { error: { message: 'Save failed' } };
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeSurvey = async (surveyId: string) => {
    if (!user || !isVerified) {
      return { error: { message: 'Authentication required' } };
    }

    try {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'completed' })
        .eq('id', surveyId)
        .eq('user_id', user.id); // Security: Ensure user owns the survey

      if (error) {
        console.error('Error completing survey:', error);
        throw new Error('Failed to complete survey');
      }

      return { error: null };
    } catch (error) {
      console.error('Complete survey error:', error);
      return { error: { message: 'Failed to complete survey' } };
    }
  };

  const loadSurveyProgress = async () => {
    if (!user || !isVerified) {
      return { data: null, error: { message: 'Authentication required' } };
    }

    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .select('id, answers, status')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading survey:', error);
        throw new Error('Failed to load survey progress');
      }

      return { data: survey, error: null };
    } catch (error) {
      console.error('Load survey error:', error);
      return { data: null, error: { message: 'Failed to load progress' } };
    }
  };

  return {
    saveSurveyProgress,
    completeSurvey,
    loadSurveyProgress,
    isSubmitting,
    isAuthenticated: !!user && isVerified
  };
};
