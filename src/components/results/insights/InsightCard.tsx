import React from "react";
import { RotateCcw } from "lucide-react";
import { Insight } from "@/types/insights";
import { getInsightColor } from "@/utils/colorTheme";
import { getIcon } from "@/utils/iconMapper";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: Insight;
  isFlipped: boolean;
  onClick: () => void;
  showPeekAnimation?: boolean;
  isFirstCard?: boolean;
  animationDelay?: number;
}

const InsightCard = ({
  insight,
  isFlipped,
  onClick,
  showPeekAnimation = false,
  isFirstCard = false,
  animationDelay = 0,
}: InsightCardProps) => {
  const Icon = getIcon(insight.icon);
  const colorTheme = getInsightColor(insight.color);

  return (
    <div
      className="flip-card cursor-pointer h-48 group" // Added group for hover effects
      onClick={onClick}
    >
      <div
        className={`flip-card-inner ${isFlipped ? "flipped" : ""} ${
          showPeekAnimation && isFirstCard ? "animate-peek" : ""
        }`}
        style={{
          animationDelay: showPeekAnimation ? `${animationDelay}ms` : undefined,
        }}
      >
        {/* Front of card - Redesigned with a colored top border */}
        <div
          className={cn(
            "flip-card-front bg-[#1e1e24] p-6 rounded-2xl shadow-2xl border-t-4 overflow-hidden flex flex-col justify-between transition-all duration-300 transform group-hover:-translate-y-1",
            colorTheme.border // Applies the dynamic border color (e.g., border-t-purple-500)
          )}
        >
          <div>
            <h3 className="font-bold text-white mb-2 text-lg flex items-start">
              <Icon
                className={cn(
                  "mr-3 h-6 w-6 flex-shrink-0 mt-0.5",
                  colorTheme.text
                )}
                aria-hidden="true"
              />
              <span className="break-words">Observation: {insight.title}</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed break-words hyphens-auto overflow-hidden">
              {insight.description}
            </p>
          </div>
          {isFirstCard && (
            <div className="flex items-center justify-end text-xs text-gray-500 animate-pulse">
              <RotateCcw className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>Click to flip</span>
            </div>
          )}
        </div>

        {/* Back of card - Updated gradient for better contrast */}
        <div className="flip-card-back bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white mb-3 text-lg flex items-start">
              <Icon
                className={cn(
                  "mr-3 h-6 w-6 flex-shrink-0 mt-0.5",
                  colorTheme.text
                )}
                aria-hidden="true"
              />
              <span className="break-words">{insight.backContent.title}</span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4 break-words hyphens-auto overflow-hidden">
              {insight.backContent.content}
            </p>
          </div>
          {isFirstCard && (
            <div className="flex items-center justify-end text-sm text-gray-400">
              <RotateCcw className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>Click to flip back</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
