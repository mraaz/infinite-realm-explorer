
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FutureSelfArchitect } from '@/types/results';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';
import { useArchitectModal } from './useArchitectModal';

interface UseArchitectSectionProps {
  architect?: FutureSelfArchitect[];
  isQuestionnaireComplete: boolean;
  onStart: (index?: number) => void;
  onMarkAsDone: (habitIndex: number, data: MarkAsDoneData) => void;
}

export const useArchitectSection = ({
  architect,
  isQuestionnaireComplete,
  onStart,
  onMarkAsDone,
}: UseArchitectSectionProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const modal = useArchitectModal();

  const allHabits = architect || [];
  const activeHabits = allHabits.filter(h => !h.isCompleted);
  const habits = activeHabits;
  const totalPages = habits.length;
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentHabit = habits.length > 0 ? habits[currentPage - 1] : undefined;
  const activeHabitsCount = activeHabits.length;
  const canAddHabit = activeHabitsCount < 2;

  const handleAddClick = () => {
    if (isQuestionnaireComplete) {
      if (canAddHabit) {
        onStart();
      } else {
        toast({
          title: "Habit Limit Reached",
          description: "You can only have two active habits. Mark one as complete to add another.",
        });
      }
    } else {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Questionnaire before you can proceed.",
      });
    }
  };

  const handleEditClick = () => {
    if (currentHabit) {
      const originalIndex = allHabits.findIndex(h => 
        h.identity === currentHabit.identity && 
        h.system === currentHabit.system && 
        h.proof === currentHabit.proof && 
        !h.isCompleted
      );
      if (originalIndex !== -1) {
        onStart(originalIndex);
      }
    }
  };
  
  const handleMarkAsDoneClick = () => {
    if (currentHabit) {
      const originalIndex = allHabits.findIndex(h => 
        h.identity === currentHabit.identity && 
        h.system === currentHabit.system && 
        h.proof === currentHabit.proof && 
        !h.isCompleted
      );
      if (originalIndex !== -1) {
        modal.openMarkAsDoneModal(originalIndex);
      }
    }
  };

  const handleDoneSubmit = (data: MarkAsDoneData) => {
    modal.handleDoneSubmit(data, onMarkAsDone);
  };

  const handlePreviousHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return {
    currentPage,
    totalPages,
    currentHabit,
    habits,
    canAddHabit,
    isDoneModalOpen: modal.isDoneModalOpen,
    setIsDoneModalOpen: modal.setIsDoneModalOpen,
    handleAddClick,
    handleEditClick,
    handleMarkAsDoneClick,
    handleDoneSubmit,
    handlePreviousHabit,
    handleNextHabit,
  };
};
