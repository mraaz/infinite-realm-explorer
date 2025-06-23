/*
================================================================================
File: /components/architect/ArchitectEmptyState.tsx
================================================================================
- This is the updated empty state component for the Habit Architect.
- All styles have been updated to match the dark theme.
*/
import React from "react";

const ArchitectEmptyState = () => {
  return (
    <div>
      {/* Updated text color for dark theme */}
      <p className="text-gray-400 mb-4">
        Don't just chase goals—build a new identity. Choose the person you want
        to become, and we'll help you create the one small habit that makes it
        real.
      </p>
      {/* Updated quote box for dark theme */}
      <div className="bg-black/20 p-4 rounded-lg ring-1 ring-white/10">
        <p className="font-semibold text-gray-200">
          Ready to design your future identity?
        </p>
        <p className="text-gray-400 text-sm italic mt-1">
          "Give me six hours to chop down a tree, and I will spend the first
          four sharpening the axe." - Abraham Lincoln.
        </p>
      </div>
    </div>
  );
};

export default ArchitectEmptyState;
