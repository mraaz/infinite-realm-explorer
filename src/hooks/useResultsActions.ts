
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useFireworks } from '@/hooks/useFireworks';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';
import { PillarProgress } from '@/components/NewQuadrantChart';

export const useResultsActions = (futureQuestionnaire: FutureQuestionnaire | undefined, progress: PillarProgress) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { actions } = useQuestionnaireStore();
    const { fire } = useFireworks();

    const handleRetakeCurrent = () => {
        actions.startRetake();
        navigate('/questionnaire', { state: { retake: true } });
    };

    const handleSetFutureTargets = () => {
        navigate('/future-questionnaire', { state: { ...location.state, progress, isArchitect: false } });
    };

    const handleStartArchitectQuestionnaire = (index?: number) => {
        navigate('/future-questionnaire', { state: { ...location.state, progress, isArchitect: true, editHabitIndex: index } });
    };

    const handleMarkHabitAsDone = (habitIndex: number, data: MarkAsDoneData) => {
        fire();

        const currentFq = futureQuestionnaire;
        if (!currentFq || !currentFq.architect) return;

        const updatedArchitect = [...currentFq.architect];
        updatedArchitect[habitIndex] = {
            ...updatedArchitect[habitIndex],
            isCompleted: true,
            completionDate: data.completionDate.toISOString(),
            completionNotes: data.completionNotes,
        };

        const updatedFq = {
            ...currentFq,
            architect: updatedArchitect,
        };

        actions.setFutureQuestionnaire(updatedFq);

        navigate('/results', {
            state: { ...location.state, futureQuestionnaire: updatedFq },
            replace: true,
        });
    };

    return {
        handleRetakeCurrent,
        handleSetFutureTargets,
        handleStartArchitectQuestionnaire,
        handleMarkHabitAsDone,
    };
};
