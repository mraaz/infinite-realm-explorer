
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { FutureQuestionnaire } from '@/types/results';

export const useResultsDataFetching = () => {
  const { answers, actions, futureQuestionnaire: storeFutureQuestionnaire } = useQuestionnaireStore();
  const location = useLocation();
  const { futureQuestionnaire: locationFutureQuestionnaire, futureProgress: locationFutureProgress } = location.state || {};
  
  const futureQuestionnaire: FutureQuestionnaire | undefined = locationFutureQuestionnaire || storeFutureQuestionnaire;

  console.log('useResultsDataFetching - Location state:', location.state);
  console.log('useResultsDataFetching - Store futureQuestionnaire:', storeFutureQuestionnaire);
  console.log('useResultsDataFetching - Final futureQuestionnaire:', futureQuestionnaire);

  useEffect(() => {
    if (locationFutureQuestionnaire) {
      console.log('useResultsDataFetching - Updating store with location data:', locationFutureQuestionnaire);
      actions.setFutureQuestionnaire(locationFutureQuestionnaire);
    }
  }, [locationFutureQuestionnaire, actions]);

  return {
    answers,
    futureQuestionnaire,
    locationFutureProgress,
  };
};
