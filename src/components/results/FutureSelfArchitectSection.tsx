
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { MarkAsDoneDialog, MarkAsDoneData } from './MarkAsDoneDialog';
import { FutureSelfArchitect } from '@/types/results';
import ArchitectEmptyState from './architect/ArchitectEmptyState';
import HabitCard from './architect/HabitCard';
import ArchitectActions from './architect/ArchitectActions';
import HabitNavigation from './architect/HabitNavigation';
import { useArchitectSection } from '@/hooks/useArchitectSection';

interface FutureSelfArchitectSectionProps {
  architect?: FutureSelfArchitect[];
  onStart: (index?: number) => void;
  isQuestionnaireComplete: boolean;
  onMarkAsDone: (habitIndex: number, data: MarkAsDoneData) => void;
}

const FutureSelfArchitectSection = ({ 
  architect, 
  onStart, 
  isQuestionnaireComplete, 
  onMarkAsDone 
}: FutureSelfArchitectSectionProps) => {
  const {
    currentPage,
    totalPages,
    currentHabit,
    habits,
    canAddHabit,
    isDoneModalOpen,
    setIsDoneModalOpen,
    handleAddClick,
    handleEditClick,
    handleMarkAsDoneClick,
    handleDoneSubmit,
    handlePreviousHabit,
    handleNextHabit,
  } = useArchitectSection({
    architect,
    isQuestionnaireComplete,
    onStart,
    onMarkAsDone,
  });

  const handleWeeklyCheckin = (completionCount: number) => {
    // This is a placeholder for weekly checkin functionality
    // In the new system, this would be handled differently
    console.log('Weekly checkin:', completionCount);
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
              <div>
                <HabitCard 
                  habit={currentHabit}
                  habitIndex={currentPage - 1}
                  onEdit={handleEditClick}
                  onWeeklyCheckin={handleWeeklyCheckin}
                />
                <HabitNavigation
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={handlePreviousHabit}
                  onNext={handleNextHabit}
                />
              </div>
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
