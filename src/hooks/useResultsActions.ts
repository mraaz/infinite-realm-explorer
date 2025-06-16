
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { useNavigationActions } from './useNavigationActions';
import { useHabitActions } from './useHabitActions';

export const useResultsActions = (futureQuestionnaire: FutureQuestionnaire | undefined, progress: PillarProgress) => {
    const { actions } = useQuestionnaireStore();
    const { navigateToRetake, navigateToFutureQuestionnaire, navigateToResults } = useNavigationActions(progress);
    const { markHabitAsDone } = useHabitActions();

    const handleRetakeCurrent = () => {
        actions.startRetake();
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

    return {
        handleRetakeCurrent,
        handleSetFutureTargets,
        handleStartArchitectQuestionnaire,
        handleMarkHabitAsDone,
    };
};
