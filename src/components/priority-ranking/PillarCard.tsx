/*
================================================================================
File: /components/priority-ranking/PillarCard.tsx (Child Component)
================================================================================
- Styles have been updated for the dark theme.
*/
import React from "react";
import { Badge } from "@/components/ui/badge";
import { PillarInfo } from "./types";
import { cn } from "@/lib/utils";

interface PillarCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pillar: PillarInfo;
  recommendedPillars: string[];
}

const PillarCard = React.forwardRef<HTMLDivElement, PillarCardProps>(
  ({ pillar, recommendedPillars, ...props }, ref) => {
    const isRecommended = recommendedPillars.includes(pillar.id);
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
            <p className="text-xs text-gray-400">
              Current score: {pillar.score}
            </p>
          </div>
        </div>
        {isRecommended && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            Recommended
          </Badge>
        )}
      </div>
    );
  }
);

export default PillarCard;
