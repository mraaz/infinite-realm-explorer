import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { FutureQuestionnaire, FutureSelfArchitect } from '@/types/results';

export const useResultsData = () => {
  const { answers, actions, futureQuestionnaire: storeFutureQuestionnaire } = useQuestionnaireStore();
  const { getProgress } = actions;
  const location = useLocation();
  const { futureQuestionnaire: locationFutureQuestionnaire, futureProgress: locationFutureProgress } = location.state || {};
  
  const futureQuestionnaire: FutureQuestionnaire | undefined = locationFutureQuestionnaire || storeFutureQuestionnaire;

  useEffect(() => {
    if (locationFutureQuestionnaire) {
      actions.setFutureQuestionnaire(locationFutureQuestionnaire);
    }
  }, [locationFutureQuestionnaire, actions]);

  const mockProgress: PillarProgress = {
    basics: 75,
    career: 80,
    finances: 60,
    health: 90,
    connections: 70,
  };

  const progress: PillarProgress = (() => {
    const answeredQuestionsCount = Object.keys(answers).length;
    if (answeredQuestionsCount === 0) {
      return mockProgress;
    }
    const { pillarPercentages } = getProgress();
    return {
      basics: 75,
      career: pillarPercentages.Career ?? 0,
      finances: pillarPercentages.Finances ?? 0,
      health: pillarPercentages.Health ?? 0,
      connections: pillarPercentages.Connections ?? 0,
    };
  })();

  const defaultFutureProgress: PillarProgress = {
    basics: 80,
    career: 95,
    finances: 85,
    health: 90,
    connections: 80,
  };
  
  const isFutureQuestionnaireComplete = !!futureQuestionnaire;

  const futureProgress = locationFutureProgress || (isFutureQuestionnaireComplete ? defaultFutureProgress : {
    basics: 0,
    career: 0,
    finances: 0,
    health: 0,
    connections: 0,
  });

  let futureSelfArchitect: FutureSelfArchitect[] | undefined;

  if (futureQuestionnaire && futureQuestionnaire.priorities && futureQuestionnaire.architect) {
    const { priorities, architect: architectAnswers } = futureQuestionnaire;
    const mainFocus = priorities.mainFocus;

    const architects = Array.isArray(architectAnswers) ? architectAnswers : [architectAnswers];

    if (mainFocus) {
      futureSelfArchitect = architects
        .map(arch => ({
            ...arch,
            mainFocus: mainFocus,
        }))
        .filter(a => a.identity && a.system && a.proof);
    }
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
