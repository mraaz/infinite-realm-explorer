
import {
  FutureQuestionnaire,
  FutureSelfArchitect,
} from "@/types/results";
import { useProgressCalculation } from "./useProgressCalculation";

// Define PillarProgress locally for onboarding isolation
interface PillarProgress {
  basics: number;
  career: number;
  finances: number;
  health: number;
  connections: number;
}

export const useResultsDataTransformation = (
  currentProgress: PillarProgress, // It receives the correct data here...
  futureQuestionnaire: FutureQuestionnaire | undefined,
  locationFutureProgress: any
) => {
  // We only need the calculator for the "Future Self" progress.
  const { calculateFutureProgress } = useProgressCalculation();

  // --- THIS IS THE FIX ---
  // We now use the `currentProgress` object that was passed in,
  // instead of calling calculateCurrentProgress().
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
