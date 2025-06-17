
import { FutureQuestionnaire, FutureSelfArchitect } from '@/types/results';
import { useProgressCalculation } from './useProgressCalculation';

export const useResultsDataTransformation = (
  futureQuestionnaire: FutureQuestionnaire | undefined,
  locationFutureProgress: any
) => {
  const { calculateCurrentProgress, calculateFutureProgress } = useProgressCalculation();
  
  const progress = calculateCurrentProgress();
  const isFutureQuestionnaireComplete = !!futureQuestionnaire;
  const futureProgress = locationFutureProgress || calculateFutureProgress(isFutureQuestionnaireComplete);

  let futureSelfArchitect: FutureSelfArchitect[] | undefined;

  if (futureQuestionnaire?.architect) {
    const architects = Array.isArray(futureQuestionnaire.architect) ? futureQuestionnaire.architect : [futureQuestionnaire.architect];

    futureSelfArchitect = architects
      .map(arch => ({
        ...arch,
        mainFocus: (arch as any).mainFocus || futureQuestionnaire.priorities?.mainFocus || 'unknown',
        // Preserve all streak-related properties
        streakWeeks: arch.streakWeeks || [],
        currentStreak: arch.currentStreak || 0,
        isCompleted: arch.isCompleted || false,
        completionDate: arch.completionDate,
        completionNotes: arch.completionNotes,
      }))
      .filter(a => a.identity && a.system && a.proof);
      
    console.log('useResultsDataTransformation - Processed futureSelfArchitect:', futureSelfArchitect);
  }

  return {
    progress,
    futureProgress,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
