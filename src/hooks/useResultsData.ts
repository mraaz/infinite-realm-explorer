
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { FutureQuestionnaire, FutureSelfArchitect } from '@/types/results';
import { useProgressCalculation } from './useProgressCalculation';

export const useResultsData = () => {
  const { answers, actions, futureQuestionnaire: storeFutureQuestionnaire } = useQuestionnaireStore();
  const location = useLocation();
  const { futureQuestionnaire: locationFutureQuestionnaire, futureProgress: locationFutureProgress } = location.state || {};
  const { calculateCurrentProgress, calculateFutureProgress } = useProgressCalculation();
  
  const futureQuestionnaire: FutureQuestionnaire | undefined = locationFutureQuestionnaire || storeFutureQuestionnaire;

  console.log('useResultsData - Location state:', location.state);
  console.log('useResultsData - Store futureQuestionnaire:', storeFutureQuestionnaire);
  console.log('useResultsData - Final futureQuestionnaire:', futureQuestionnaire);

  useEffect(() => {
    if (locationFutureQuestionnaire) {
      console.log('useResultsData - Updating store with location data:', locationFutureQuestionnaire);
      actions.setFutureQuestionnaire(locationFutureQuestionnaire);
    }
  }, [locationFutureQuestionnaire, actions]);

  const progress = calculateCurrentProgress();
  const isFutureQuestionnaireComplete = !!futureQuestionnaire;
  const futureProgress = locationFutureProgress || calculateFutureProgress(isFutureQuestionnaireComplete);

  let futureSelfArchitect: FutureSelfArchitect[] | undefined;

  if (futureQuestionnaire?.architect) {
    const architects = Array.isArray(futureQuestionnaire.architect) ? futureQuestionnaire.architect : [futureQuestionnaire.architect];

    futureSelfArchitect = architects
      .map(arch => ({
        ...arch,
        mainFocus: arch.mainFocus || futureQuestionnaire.priorities?.mainFocus || 'unknown',
      }))
      .filter(a => a.identity && a.system && a.proof);
      
    console.log('useResultsData - Processed futureSelfArchitect:', futureSelfArchitect);
  }

  return {
    answers,
    progress,
    futureProgress,
    futureQuestionnaire,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
