
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle, Calendar } from 'lucide-react';
import { FutureSelfArchitect } from '@/types/results';
import ArchitectEmptyState from './architect/ArchitectEmptyState';
import HabitDashboard from './architect/HabitDashboard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface HabitArchitectSectionProps {
  architect?: FutureSelfArchitect[];
  onStart: (index?: number) => void;
  isQuestionnaireComplete: boolean;
  onMarkAsDone: (habitIndex: number, data: any) => void;
  onWeeklyCheckin: (habitIndex: number, completionCount: number) => void;
}

const HabitArchitectSection = ({ 
  architect, 
  onStart, 
  isQuestionnaireComplete,
  onMarkAsDone,
  onWeeklyCheckin
}: HabitArchitectSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeHabits = architect?.filter(h => !h.isCompleted) || [];
  const canAddHabit = activeHabits.length < 2;

  const handleDesignHabits = () => {
    if (!isQuestionnaireComplete) {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Questionnaire before you can proceed.",
      });
      return;
    }
    navigate('/habit-builder');
  };

  const handleAddHabit = () => {
    if (!canAddHabit) {
      toast({
        title: "Sorry, it's hard to manage more than two habits at a time.",
        description: "Complete an existing habit to add a new one.",
      });
      return;
    }
    navigate('/habit-builder');
  };

  const handleEditHabit = (habitIndex: number) => {
    navigate('/habit-builder', { state: { editHabitIndex: habitIndex } });
  };

  return (
    <section className="mb-16 flex justify-center">
      <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h2>The Habit Architect</h2>
          </div>
          
          {activeHabits.length === 0 ? (
            <ArchitectEmptyState />
          ) : (
            <HabitDashboard
              habits={activeHabits}
              onEdit={handleEditHabit}
              onWeeklyCheckin={onWeeklyCheckin}
            />
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 md:p-8 md:pt-0">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            {activeHabits.length === 0 ? (
              <Button
                onClick={handleDesignHabits}
                className="w-full justify-center no-print h-11 px-8 rounded-md"
                disabled={!isQuestionnaireComplete}
              >
                <span>Design Your Habits!</span>
              </Button>
            ) : (
              <Button
                onClick={handleAddHabit}
                variant="outline"
                className="w-full justify-center no-print h-11 px-8 rounded-md"
                disabled={!canAddHabit}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Build Another Habit
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </section>
  );
};

export default HabitArchitectSection;
