
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleAddClick = () => {
    if (!isQuestionnaireComplete || !canAddHabit) {
      if (!canAddHabit) {
        toast({
          title: "Sorry, it's hard to manage more than two habits at a time.",
          description: "Complete an existing habit to add a new one.",
        });
      }
      return;
    }
    onAddClick();
  };

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
          onClick={handleAddClick}
          className={cn(
            "w-full justify-center no-print h-11 px-8 rounded-md",
            (!isQuestionnaireComplete || !canAddHabit) && "opacity-50 cursor-not-allowed"
          )}
        >
          <PlusCircle className="mr-2" />
          Add Another Habit
        </Button>
      </div>
    );
  }

  const handleInitialAddClick = () => {
    if (!isQuestionnaireComplete) {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Questionnaire before you can proceed.",
      });
      return;
    }
    onAddClick();
  };

  return (
    <Button
      onClick={handleInitialAddClick}
      className={cn(
        "w-full justify-between no-print h-11 px-8 rounded-md",
        !isQuestionnaireComplete && "opacity-50 cursor-not-allowed"
      )}
    >
      <span>Design Your Future Self</span>
      <ArrowRight />
    </Button>
  );
};

export default ArchitectActions;
