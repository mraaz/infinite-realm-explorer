import {
  FutureQuestionnaire,
  FutureSelfArchitect,
  PillarProgress,
} from "@/types/results"; // Make sure PillarProgress is imported
import { useProgressCalculation } from "./useProgressCalculation";

// --- THIS IS THE FIX ---
// The hook now accepts `currentProgress` as its first argument.
export const useResultsDataTransformation = (
  currentProgress: PillarProgress,
  futureQuestionnaire: FutureQuestionnaire | undefined,
  locationFutureProgress: any
) => {
  // We no longer need to calculate the current progress here.
  // We only need the calculator for the "Future Self" progress.
  const { calculateFutureProgress } = useProgressCalculation();

  // The progress for the "Current Self" chart is now the data we passed in.
  const progress = currentProgress;

  const isFutureQuestionnaireComplete = !!futureQuestionnaire;
  const futureProgress =
    locationFutureProgress ||
    calculateFutureProgress(isFutureQuestionnaireComplete);

  let futureSelfArchitect: FutureSelfArchitect[] | undefined;

  if (futureQuestionnaire?.architect) {
    const architects = Array.isArray(futureQuestionnaire.architect)
      ? futureQuestionnaire.architect
      : [futureQuestionnaire.architect];

    futureSelfArchitect = architects
      .map((arch) => ({
        ...arch,
        mainFocus:
          (arch as any).mainFocus ||
          futureQuestionnaire.priorities?.mainFocus ||
          "unknown",
        // Preserve all streak-related properties
        streakWeeks: arch.streakWeeks || [],
        currentStreak: arch.currentStreak || 0,
        isCompleted: arch.isCompleted || false,
        completionDate: arch.completionDate,
        completionNotes: arch.completionNotes,
      }))
      .filter((a) => a.identity && a.system && a.proof);

    console.log(
      "useResultsDataTransformation - Processed futureSelfArchitect:",
      futureSelfArchitect
    );
  }

  return {
    progress,
    futureProgress,
    isFutureQuestionnaireComplete,
    futureSelfArchitect,
  };
};
