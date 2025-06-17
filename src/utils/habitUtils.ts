
import { FutureSelfArchitect } from '@/types/results';

export const extractTargetFrequency = (system: string): number => {
  const match = system.match(/(\d+)\s*times?\s*a?\s*week/i);
  return match ? parseInt(match[1]) : 3;
};

export const determineStreakType = (completionCount: number, targetFrequency: number): 'gold' | 'silver' | 'grey' => {
  if (completionCount >= targetFrequency) {
    return 'gold';
  } else if (completionCount > 0) {
    return 'silver';
  } else {
    return 'grey';
  }
};

export const calculateNewStreak = (currentStreak: number, streakType: 'gold' | 'silver' | 'grey'): number => {
  if (streakType === 'gold') {
    return currentStreak + 1;
  } else if (streakType === 'grey') {
    return 0;
  }
  // Silver maintains the streak
  return currentStreak;
};

export const isHabitEstablished = (streakWeeks: ('gold' | 'silver' | 'grey')[], currentStreak: number): boolean => {
  const recentGoldWeeks = streakWeeks.slice(-4).filter(week => week === 'gold').length;
  return recentGoldWeeks === 4 && currentStreak >= 4;
};

export const updateHabitWithStreak = (
  habit: FutureSelfArchitect,
  completionCount: number
): FutureSelfArchitect => {
  const targetFrequency = extractTargetFrequency(habit.system);
  const streakType = determineStreakType(completionCount, targetFrequency);
  const updatedStreakWeeks = [...(habit.streakWeeks || []), streakType];
  const newStreak = calculateNewStreak(habit.currentStreak || 0, streakType);
  const isEstablished = isHabitEstablished(updatedStreakWeeks, newStreak);

  return {
    ...habit,
    streakWeeks: updatedStreakWeeks,
    currentStreak: newStreak,
    isCompleted: isEstablished,
    completionDate: isEstablished ? new Date().toISOString() : habit.completionDate,
  };
};
