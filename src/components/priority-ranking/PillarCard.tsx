/*
================================================================================
File: /components/priority-ranking/PillarCard.tsx (Child Component) - CORRECTED
================================================================================
*/
import React from "react";
import { PillarInfo } from "./types";
import { cn } from "@/lib/utils";

// The props are simplified, removing `recommendedPillars`.
interface PillarCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pillar: PillarInfo;
}

const PillarCard = React.forwardRef<HTMLDivElement, PillarCardProps>(
  ({ pillar, ...props }, ref) => {
    // The logic for `isRecommended` and the score is completely removed.
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          "w-full p-4 rounded-lg flex items-center justify-between cursor-grab",
          "bg-gray-800 ring-1 ring-gray-700 hover:ring-purple-500 transition-shadow"
        )}
      >
        <div className="flex items-center gap-4">
          {pillar.icon}
          <div>
            <p className="font-bold text-white">{pillar.name}</p>
            {/* The line displaying the score has been removed. */}
          </div>
        </div>
        {/* The "Recommended" badge has been removed. */}
      </div>
    );
  }
);

export default PillarCard;
