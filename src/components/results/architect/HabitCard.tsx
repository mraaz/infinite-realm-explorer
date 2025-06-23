import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Calendar, Award } from "lucide-react";
import { FutureSelfArchitect } from "@/types/results";
import WeeklyCheckinDialog from "./WeeklyCheckinDialog";
import StreakVisualization from "./StreakVisualization";

interface HabitCardProps {
  habit: FutureSelfArchitect;
  habitIndex: number;
  onEdit: () => void;
  onWeeklyCheckin: (completionCount: number) => void;
}

const HabitCard = ({
  habit,
  habitIndex,
  onEdit,
  onWeeklyCheckin,
}: HabitCardProps) => {
  const [showCheckin, setShowCheckin] = useState(false);

  const streakWeeks = habit.streakWeeks || [];
  const currentStreak = habit.currentStreak || 0;
  const isEstablished = currentStreak >= 4;

  return (
    // Updated card styles
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {/* Updated text and badge styles */}
            <h4 className="font-semibold text-white">{habit.identity}</h4>
            {isEstablished && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              >
                <Award className="h-3 w-3 mr-1" />
                Established
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2">{habit.system}</p>
          <p className="text-xs text-gray-500 italic">"{habit.proof}"</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>

      <StreakVisualization
        streakWeeks={streakWeeks}
        currentStreak={currentStreak}
      />

      {/* Updated button styles */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCheckin(true)}
        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Weekly Check-in
      </Button>

      <WeeklyCheckinDialog
        isOpen={showCheckin}
        onOpenChange={setShowCheckin}
        habit={habit}
        onSubmit={onWeeklyCheckin}
      />
    </div>
  );
};

export default HabitCard;
