
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

  useEffect(() => {
    if (locationFutureQuestionnaire) {
      actions.setFutureQuestionnaire(locationFutureQuestionnaire);
    }
  }, [locationFutureQuestionnaire, actions]);

  const progress = calculateCurrentProgress();
  const isFutureQuestionnaireComplete = !!futureQuestionnaire;
  const futureProgress = locationFutureProgress || calculateFutureProgress(isFutureQuestionnaireComplete);

  let futureSelfArchitect: FutureSelfArchitect[] | undefined;

  if (futureQuestionnaire?.priorities?.mainFocus && futureQuestionnaire?.architect) {
    const { priorities, architect: architectAnswers } = futureQuestionnaire;
    const architects = Array.isArray(architectAnswers) ? architectAnswers : [architectAnswers];

    futureSelfArchitect = architects
      .map(arch => ({
        ...arch,
        mainFocus: priorities.mainFocus,
      }))
      .filter(a => a.identity && a.system && a.proof);
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
