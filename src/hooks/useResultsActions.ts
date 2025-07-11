
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { useNavigationActions } from './useNavigationActions';
import { useHabitActions } from './useHabitActions';

export const useResultsActions = (futureQuestionnaire: FutureQuestionnaire | undefined, progress: PillarProgress) => {
    const { navigateToRetake, navigateToFutureQuestionnaire, navigateToResults } = useNavigationActions(progress);
    const { markHabitAsDone, updateHabitStreak } = useHabitActions();

    const handleRetakeCurrent = () => {
        // Reset the questionnaire state
        navigateToRetake();
    };

    const handleSetFutureTargets = () => {
        navigateToFutureQuestionnaire(false);
    };

    const handleStartArchitectQuestionnaire = (index?: number) => {
        navigateToFutureQuestionnaire(true, index);
    };

    const handleMarkHabitAsDone = (habitIndex: number, data: MarkAsDoneData) => {
        const updatedFq = markHabitAsDone(futureQuestionnaire, habitIndex, data);
        if (updatedFq) {
            navigateToResults(updatedFq);
        }
    };

    const handleWeeklyCheckin = (habitIndex: number, completionCount: number) => {
        const updatedFq = updateHabitStreak(futureQuestionnaire, habitIndex, completionCount);
        if (updatedFq) {
            navigateToResults(updatedFq);
        }
    };

    return {
        handleRetakeCurrent,
        handleSetFutureTargets,
        handleStartArchitectQuestionnaire,
        handleMarkHabitAsDone,
        handleWeeklyCheckin,
    };
};
