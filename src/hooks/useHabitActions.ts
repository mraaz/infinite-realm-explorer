
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useFireworks } from '@/hooks/useFireworks';
import { useToast } from '@/hooks/use-toast';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { FutureQuestionnaire } from '@/types/results';

export const useHabitActions = () => {
  const { actions } = useQuestionnaireStore();
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

    actions.setFutureQuestionnaire(updatedFq);
    return updatedFq;
  };

  const updateHabitStreak = (
    futureQuestionnaire: FutureQuestionnaire | undefined,
    habitIndex: number,
    completionCount: number
  ) => {
    if (!futureQuestionnaire?.architect) return null;

    const habit = futureQuestionnaire.architect[habitIndex];
    
    // Extract target frequency from habit system
    const extractTargetFrequency = (system: string): number => {
      const match = system.match(/(\d+)\s*times?\s*a?\s*week/i);
      return match ? parseInt(match[1]) : 3;
    };

    const targetFrequency = extractTargetFrequency(habit.system);
    
    // Determine streak type
    let streakType: 'gold' | 'silver' | 'grey';
    if (completionCount >= targetFrequency) {
      streakType = 'gold';
    } else if (completionCount > 0) {
      streakType = 'silver';
    } else {
      streakType = 'grey';
    }

    // Update streak
    const updatedStreakWeeks = [...(habit.streakWeeks || []), streakType];
    let newStreak = habit.currentStreak || 0;
    
    if (streakType === 'gold') {
      newStreak += 1;
    } else if (streakType === 'grey') {
      newStreak = 0;
    }
    // Silver maintains the streak

    // Check if habit is established (4 consecutive gold weeks)
    const recentGoldWeeks = updatedStreakWeeks.slice(-4).filter(week => week === 'gold').length;
    const isEstablished = recentGoldWeeks === 4 && newStreak >= 4;

    const updatedArchitect = [...futureQuestionnaire.architect];
    updatedArchitect[habitIndex] = {
      ...habit,
      streakWeeks: updatedStreakWeeks,
      currentStreak: newStreak,
      isCompleted: isEstablished,
      completionDate: isEstablished ? new Date().toISOString() : habit.completionDate,
    };

    if (isEstablished) {
      fire();
      toast({
        title: "Congrats!!! 🎉",
        description: "Well done you can now unlock another habit!",
      });
    }

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
