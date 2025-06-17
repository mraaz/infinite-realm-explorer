
import { useState } from 'react';
import { MarkAsDoneData } from '@/components/results/MarkAsDoneDialog';

export const useArchitectModal = () => {
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [habitToMark, setHabitToMark] = useState<number | null>(null);

  const openMarkAsDoneModal = (habitIndex: number) => {
    setHabitToMark(habitIndex);
    setIsDoneModalOpen(true);
  };

  const closeMarkAsDoneModal = () => {
    setIsDoneModalOpen(false);
    setHabitToMark(null);
  };

  const handleDoneSubmit = (data: MarkAsDoneData, onMarkAsDone: (habitIndex: number, data: MarkAsDoneData) => void) => {
    if (habitToMark !== null) {
      onMarkAsDone(habitToMark, data);
    }
    closeMarkAsDoneModal();
  };

  return {
    isDoneModalOpen,
    setIsDoneModalOpen,
    habitToMark,
    openMarkAsDoneModal,
    closeMarkAsDoneModal,
    handleDoneSubmit,
  };
};
