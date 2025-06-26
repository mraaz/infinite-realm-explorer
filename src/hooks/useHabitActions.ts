
import { useOnboardingQuestionnaireStore } from '@/store/onboardingQuestionnaireStore';
import { useFireworks } from '@/hooks/useFireworks';
import { useToast } from '@/hooks/use-toast';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';
import { updateHabitWithStreak } from '@/utils/habitUtils';

export const useHabitActions = () => {
  const { fire } = useFireworks();
  const { toast } = useToast();

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

    return updatedFq;
  };

  const updateHabitStreak = (
    futureQuestionnaire: FutureQuestionnaire | undefined,
    habitIndex: number,
    completionCount: number
  ) => {
    if (!futureQuestionnaire?.architect) return null;

    const habit = futureQuestionnaire.architect[habitIndex];
    
    // Ensure the habit has the mainFocus property required by FutureSelfArchitect
    const habitWithMainFocus = {
      ...habit,
      mainFocus: (habit as any).mainFocus || futureQuestionnaire.priorities?.mainFocus || 'unknown',
    };
    
    const updatedHabit = updateHabitWithStreak(habitWithMainFocus, completionCount);

    // Check if habit was just established
    const wasEstablished = habit.isCompleted;
    const isNowEstablished = updatedHabit.isCompleted;

    if (!wasEstablished && isNowEstablished) {
      fire();
      toast({
        title: "Congrats!!! 🎉",
        description: "Well done you can now unlock another habit!",
      });
    }

    const updatedArchitect = [...futureQuestionnaire.architect];
    updatedArchitect[habitIndex] = updatedHabit;

    const updatedFq = {
      ...futureQuestionnaire,
      architect: updatedArchitect,
    };

    return updatedFq;
  };

  return {
    markHabitAsDone,
    updateHabitStreak,
  };
};
