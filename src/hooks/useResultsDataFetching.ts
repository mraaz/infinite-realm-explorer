
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { FutureQuestionnaire } from '@/types/results';

export const useResultsDataFetching = () => {
  const { answers } = useOnboardingQuestionnaireStore();
  const location = useLocation();
  const { futureQuestionnaire: locationFutureQuestionnaire, futureProgress: locationFutureProgress } = location.state || {};
  
  const futureQuestionnaire: FutureQuestionnaire | undefined = locationFutureQuestionnaire;

  console.log('useResultsDataFetching - Location state:', location.state);
  console.log('useResultsDataFetching - Final futureQuestionnaire:', futureQuestionnaire);

  return {
    answers,
    futureQuestionnaire,
    locationFutureProgress,
  };
};
