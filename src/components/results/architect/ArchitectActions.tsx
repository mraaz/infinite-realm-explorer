
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchitectActionsProps {
  habitsCount: number;
  isCurrentHabitCompleted?: boolean;
  isQuestionnaireComplete: boolean;
  canAddHabit: boolean;
  onMarkAsDoneClick: () => void;
  onEditClick: () => void;
  onAddClick: () => void;
}

const ArchitectActions = ({
  habitsCount,
  isCurrentHabitCompleted,
  isQuestionnaireComplete,
  canAddHabit,
  onMarkAsDoneClick,
  onEditClick,
  onAddClick,
}: ArchitectActionsProps) => {
  if (habitsCount > 0) {
    return (
      <div className="w-full flex flex-col sm:flex-row gap-2">
        {!isCurrentHabitCompleted && (
          <Button onClick={onMarkAsDoneClick} variant="outline" className="w-full no-print h-11 px-8 rounded-md border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
            <CheckCircle2 className="mr-2" />
            Mark as Done
          </Button>
        )}
        <Button onClick={onEditClick} variant="outline" className="w-full no-print h-11 px-8 rounded-md">
          Edit This Habit
        </Button>
        <Button
          onClick={onAddClick}
          className={cn(
            "w-full justify-center no-print h-11 px-8 rounded-md",
            (!isQuestionnaireComplete || !canAddHabit) && "opacity-50 cursor-not-allowed"
          )}
          disabled={!isQuestionnaireComplete || !canAddHabit}
        >
          <PlusCircle className="mr-2" />
          Add Another Habit
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onAddClick}
      className={cn(
        "w-full justify-between no-print h-11 px-8 rounded-md",
        !isQuestionnaireComplete && "opacity-50 cursor-not-allowed"
      )}
      disabled={!isQuestionnaireComplete}
    >
      <span>Design Your Future Self</span>
      <ArrowRight />
    </Button>
  );
};

export default ArchitectActions;
