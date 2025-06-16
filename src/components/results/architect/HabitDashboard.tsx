
import React from 'react';
import { FutureSelfArchitect } from '@/types/results';
import HabitCard from './HabitCard';

interface HabitDashboardProps {
  habits: FutureSelfArchitect[];
  onEdit: (habitIndex: number) => void;
  onWeeklyCheckin: (habitIndex: number, completionCount: number) => void;
}

const HabitDashboard = ({ habits, onEdit, onWeeklyCheckin }: HabitDashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Active Habits</h3>
        <div className="space-y-4">
          {habits.map((habit, index) => (
            <HabitCard
              key={index}
              habit={habit}
              habitIndex={index}
              onEdit={() => onEdit(index)}
              onWeeklyCheckin={(completionCount) => onWeeklyCheckin(index, completionCount)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitDashboard;
