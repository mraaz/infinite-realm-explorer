
import { useResultsDataFetching } from './useResultsDataFetching';
import { useResultsDataTransformation } from './useResultsDataTransformation';

export const useResultsData = () => {
  const { answers, futureQuestionnaire, locationFutureProgress } = useResultsDataFetching();
  const { progress, futureProgress, isFutureQuestionnaireComplete, futureSelfArchitect } = useResultsDataTransformation(
    futureQuestionnaire,
    locationFutureProgress
  );

  return {
    answers,
    progress,
    futureProgress,
    futureQuestionnaire,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
