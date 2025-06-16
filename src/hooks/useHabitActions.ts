
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useFireworks } from '@/hooks/useFireworks';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';

export const useHabitActions = () => {
  const { actions } = useQuestionnaireStore();
  const { fire } = useFireworks();

  const markHabitAsDone = (
    futureQuestionnaire: FutureQuestionnaire | undefined,
    habitIndex: number,
    data: MarkAsDoneData
  ) => {
    fire();

    if (!futureQuestionnaire?.architect) return null;

    const updatedArchitect = [...futureQuestionnaire.architect];
    updatedArchitect[habitIndex] = {
      ...updatedArchitect[habitIndex],
      isCompleted: true,
      completionDate: data.completionDate.toISOString(),
      completionNotes: data.completionNotes,
    };

    const updatedFq = {
      ...futureQuestionnaire,
      architect: updatedArchitect,
    };

    actions.setFutureQuestionnaire(updatedFq);
    return updatedFq;
  };

  return {
    markHabitAsDone,
  };
};
