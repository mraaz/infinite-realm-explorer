import { useResultsDataFetching } from "./useResultsDataFetching";
import { useResultsDataTransformation } from "./useResultsDataTransformation";

export const useResultsData = () => {
  // --- FIX PART 1 ---
  // We now destructure `progress` and `isLoading` from the fetching hook.
  const {
    isLoading,
    answers,
    progress,
    futureQuestionnaire,
    locationFutureProgress,
  } = useResultsDataFetching();

  // --- FIX PART 2 ---
  // We pass the `progress` data into the transformation hook.
  const {
    progress: finalProgress, // Renaming to avoid conflict
    futureProgress,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  } = useResultsDataTransformation(
    progress, // Pass the "Current Self" progress here
    futureQuestionnaire,
    locationFutureProgress
  );

  return {
    isLoading, // Pass loading state to the UI
    answers,
    progress: finalProgress, // Return the final "Current Self" progress
    futureProgress,
    futureQuestionnaire,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
