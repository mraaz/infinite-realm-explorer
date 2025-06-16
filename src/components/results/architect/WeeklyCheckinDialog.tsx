
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FutureSelfArchitect } from '@/types/results';

interface WeeklyCheckinDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habit: FutureSelfArchitect;
  onSubmit: (completionCount: number) => void;
}

const WeeklyCheckinDialog = ({
  isOpen,
  onOpenChange,
  habit,
  onSubmit,
}: WeeklyCheckinDialogProps) => {
  const [selectedCount, setSelectedCount] = useState<number>(0);

  // Extract target frequency from habit system (this is a simplified extraction)
  const extractTargetFrequency = (system: string): number => {
    const match = system.match(/(\d+)\s*times?\s*a?\s*week/i);
    return match ? parseInt(match[1]) : 3; // Default to 3 if not found
  };

  const targetFrequency = extractTargetFrequency(habit.system);

  const handleSubmit = () => {
    onSubmit(selectedCount);
    onOpenChange(false);
    setSelectedCount(0);
  };

  const getCompletionMessage = () => {
    if (selectedCount >= targetFrequency) {
      return "🏆 Outstanding! You hit your target!";
    } else if (selectedCount > 0) {
      return "🥈 Great effort! Every step counts.";
    } else {
      return "That's okay. This week is a fresh start!";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Weekly Check-in</DialogTitle>
          <DialogDescription>
            How did you do with "{habit.identity}" this week?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Your goal: {habit.system}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-3">
              How many times did you complete this habit last week?
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {Array.from({ length: targetFrequency + 2 }, (_, i) => (
              <Button
                key={i}
                variant={selectedCount === i ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCount(i)}
                className="w-12 h-12"
              >
                {i === targetFrequency + 1 ? `${targetFrequency}+` : i}
              </Button>
            ))}
          </div>

          {selectedCount !== null && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{getCompletionMessage()}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyCheckinDialog;
