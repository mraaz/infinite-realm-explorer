
import { useResultsDataFetching } from './useResultsDataFetching';
import { useResultsDataTransformation } from './useResultsDataTransformation';
import { useQuestionnaireStore } from '@/store/questionnaireStore';

export const useResultsData = () => {
  const { answers: storeAnswers } = useQuestionnaireStore();
  const { answers, futureQuestionnaire, locationFutureProgress } = useResultsDataFetching();
  const { progress, futureProgress, isFutureQuestionnaireComplete, futureSelfArchitect } = useResultsDataTransformation(
    futureQuestionnaire,
    locationFutureProgress
  );

  // Use store answers if no fetched answers (for unauthorized users)
  const finalAnswers = answers && Object.keys(answers).length > 0 ? answers : storeAnswers;

  return {
    answers: finalAnswers,
    progress,
    futureProgress,
    futureQuestionnaire,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
