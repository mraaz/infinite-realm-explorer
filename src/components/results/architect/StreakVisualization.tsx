
import React from 'react';
import { Target } from 'lucide-react';

interface StreakVisualizationProps {
  streakWeeks: ('gold' | 'silver' | 'grey')[];
  currentStreak: number;
}

const StreakVisualization = ({ streakWeeks, currentStreak }: StreakVisualizationProps) => {
  const getStreakIcon = (weekType: 'gold' | 'silver' | 'grey') => {
    switch (weekType) {
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      case 'grey':
        return '⚫';
      default:
        return '⚫';
    }
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          Weekly Streak: {currentStreak} weeks
        </span>
      </div>
      <div className="flex gap-1">
        {streakWeeks.slice(-8).map((weekType, index) => (
          <span key={index} className="text-lg">
            {getStreakIcon(weekType)}
          </span>
        ))}
        {/* Show empty slots for upcoming weeks */}
        {Array.from({ length: Math.max(0, 8 - streakWeeks.length) }).map((_, index) => (
          <span key={`empty-${index}`} className="text-lg opacity-30">⚪</span>
        ))}
      </div>
    </div>
  );
};

export default StreakVisualization;
