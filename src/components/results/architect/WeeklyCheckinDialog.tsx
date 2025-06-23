import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FutureSelfArchitect } from "@/types/results";
import { cn } from "@/lib/utils";

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
  const [selectedCount, setSelectedCount] = useState<number | null>(null);

  const extractTargetFrequency = (system: string): number => {
    const match = system.match(/(\d+)\s*times?/i);
    return match ? parseInt(match[1]) : 3;
  };

  const targetFrequency = extractTargetFrequency(habit.system);

  const handleSubmit = () => {
    if (selectedCount !== null) {
      onSubmit(selectedCount);
      onOpenChange(false);
      setSelectedCount(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedCount(null);
    }
    onOpenChange(open);
  };

  const getCompletionMessage = () => {
    if (selectedCount === null) return null;

    if (selectedCount >= targetFrequency) {
      return "🏆 Outstanding! You hit your target!";
    } else if (selectedCount > 0) {
      return "🥈 Great effort! Every step counts.";
    } else {
      return "That's okay. This week is a fresh start!";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        {" "}
        {/* Base styles from ui/dialog.tsx will now apply the dark theme */}
        <DialogHeader>
          <DialogTitle>Weekly Check-in</DialogTitle>
          <DialogDescription>
            How did you do with "{habit.identity}" this week?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Your goal: {habit.system}
            </p>
            <p className="text-sm font-medium text-gray-300 mb-4">
              How many times did you complete this habit last week?
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: targetFrequency + 2 }, (_, i) => (
              <Button
                key={i}
                variant={selectedCount === i ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCount(i)}
                className={cn(
                  "w-12 h-12 text-sm",
                  selectedCount === i
                    ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 hover:border-purple-500"
                )}
              >
                {i === targetFrequency + 1 ? `${targetFrequency}+` : i}
              </Button>
            ))}
          </div>

          {selectedCount !== null && (
            <div className="text-center p-3 bg-black/20 rounded-lg mt-4 ring-1 ring-white/10">
              <p className="text-sm font-medium text-white">
                {getCompletionMessage()}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-gradient-cta text-white font-bold disabled:opacity-50"
            disabled={selectedCount === null}
          >
            Submit Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyCheckinDialog;
