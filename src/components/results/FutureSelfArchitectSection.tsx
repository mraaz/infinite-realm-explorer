
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkAsDoneDialog, MarkAsDoneData } from './MarkAsDoneDialog';
import { FutureSelfArchitect } from '@/types/results';
import ArchitectEmptyState from './architect/ArchitectEmptyState';
import HabitCard from './architect/HabitCard';
import ArchitectActions from './architect/ArchitectActions';

interface FutureSelfArchitectSectionProps {
  architect?: FutureSelfArchitect[];
  onStart: (index?: number) => void;
  isQuestionnaireComplete: boolean;
  onMarkAsDone: (habitIndex: number, data: MarkAsDoneData) => void;
}

const FutureSelfArchitectSection = ({ architect, onStart, isQuestionnaireComplete, onMarkAsDone }: FutureSelfArchitectSectionProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [habitToMark, setHabitToMark] = useState<number | null>(null);

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
        onStart(); // No index means add new
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
      const originalIndex = allHabits.findIndex(h => h.identity === currentHabit.identity && h.system === currentHabit.system && h.proof === currentHabit.proof && !h.isCompleted);
      if (originalIndex !== -1) {
        onStart(originalIndex);
      }
    }
  };
  
  const handleMarkAsDoneClick = () => {
    if (currentHabit) {
      const originalIndex = allHabits.findIndex(h => h.identity === currentHabit.identity && h.system === currentHabit.system && h.proof === currentHabit.proof && !h.isCompleted);
      if (originalIndex !== -1) {
        setHabitToMark(originalIndex);
        setIsDoneModalOpen(true);
      }
    }
  };

  const handleDoneSubmit = (data: MarkAsDoneData) => {
    if (habitToMark !== null) {
      onMarkAsDone(habitToMark, data);
    }
    setIsDoneModalOpen(false);
    setHabitToMark(null);
  };

  const handlePreviousHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <section className="mb-16 flex justify-center">
        <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h2>Future Self Architect</h2>
            </div>
            {currentHabit ? (
              <HabitCard 
                habit={currentHabit}
                currentPage={currentPage}
                totalPages={totalPages}
                onPreviousHabit={handlePreviousHabit}
                onNextHabit={handleNextHabit}
              />
            ) : (
              <ArchitectEmptyState />
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 md:p-8 md:pt-0">
            <ArchitectActions
              habitsCount={habits.length}
              isCurrentHabitCompleted={currentHabit?.isCompleted}
              isQuestionnaireComplete={isQuestionnaireComplete}
              canAddHabit={canAddHabit}
              onMarkAsDoneClick={handleMarkAsDoneClick}
              onEditClick={handleEditClick}
              onAddClick={handleAddClick}
            />
          </CardFooter>
        </Card>
      </section>
      <MarkAsDoneDialog
        isOpen={isDoneModalOpen}
        onOpenChange={setIsDoneModalOpen}
        onDone={handleDoneSubmit}
      />
    </>
  );
};

export default FutureSelfArchitectSection;
