import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Axe, PlusCircle } from "lucide-react";
import { FutureSelfArchitect } from "@/types/results";
import ArchitectEmptyState from "./architect/ArchitectEmptyState";
import HabitDashboard from "./architect/HabitDashboard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  onWeeklyCheckin,
}: HabitArchitectSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const activeHabits = architect?.filter((h) => !h.isCompleted) || [];
  const canAddHabit = activeHabits.length < 2;

  const handleDesignHabits = () => {
    if (!isQuestionnaireComplete) {
      toast({
        title: "Action Required",
        description:
          "Please complete the Future Self Questionnaire before you can proceed.",
      });
      return;
    }
    navigate("/habit-builder");
  };

  const handleAddHabit = () => {
    if (!canAddHabit) {
      toast({
        title: "You can only have two habits at a time.",
        description:
          "It's hard to juggle more. Complete an existing habit to add a new one.",
      });
      return;
    }
    navigate("/habit-builder");
  };

  const handleEditHabit = (habitIndex: number) => {
    navigate("/habit-builder", { state: { editHabitIndex: habitIndex } });
  };

  return (
    <section className="mb-16 flex justify-center">
      {/* Updated Card component with dark theme styles */}
      <Card className="bg-[#1e1e24] shadow-2xl ring-1 ring-white/10 w-full max-w-3xl flex flex-col">
        <CardContent className="p-6 md:p-8">
          {/* Updated header with dark theme styles */}
          <div className="flex items-center gap-3 text-2xl font-bold text-white mb-6">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Axe className="h-6 w-6 text-blue-400" />
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
              // Updated primary button with gradient style
              <Button
                onClick={handleDesignHabits}
                className="w-full justify-center no-print h-11 px-8 rounded-md bg-gradient-cta text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                disabled={!isQuestionnaireComplete}
              >
                <span>Design Your Habits!</span>
              </Button>
            ) : (
              // Updated secondary button with dark theme outline style
              <Button
                onClick={handleAddHabit}
                variant="outline"
                className="w-full justify-center no-print h-11 px-8 rounded-md bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
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
