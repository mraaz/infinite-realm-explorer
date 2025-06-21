
import { useState, useEffect, useRef } from 'react';
import { useSecureAuth } from './useSecureAuth';
import { SurveySession } from './useSurveySession/types';
import { useSurveyOperations } from './useSurveySession/useSurveyOperations';
import { useSurveySessionLoader } from './useSurveySession/useSurveySessionLoader';

export const useSurveySession = () => {
  const [surveySession, setSurveySession] = useState<SurveySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, isVerified } = useSecureAuth();
  const completionInProgress = useRef(false);

  const { updateSurveyAnswers, saveAnswer, storePendingProgress, completeSurvey, makePublic } = useSurveyOperations();
  const { loadOrCreateSession } = useSurveySessionLoader();

  useEffect(() => {
    if (user && isVerified) {
      loadOrCreateSession(user, setSurveySession, setIsResuming, updateSurveyAnswers).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user, isVerified]);

  const handleSaveAnswer = async (questionId: string, answer: any) => {
    return await saveAnswer(user, surveySession, setSurveySession, questionId, answer);
  };

  const handleCompleteSurvey = async () => {
    setIsCompleting(true);
    try {
      return await completeSurvey(surveySession, user, setSurveySession, completionInProgress);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleMakePublic = async () => {
    return await makePublic(surveySession, user);
  };

  return {
    surveySession,
    isLoading,
    isResuming,
    isCompleting,
    saveAnswer: handleSaveAnswer,
    completeSurvey: handleCompleteSurvey,
    makePublic: handleMakePublic,
    storePendingProgress,
    isAuthenticated: !!user && isVerified
  };
};
