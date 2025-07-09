import React, { useState } from "react";
import { categoryColors, categoryIconPaths } from "@/data/pulseCheckCards";

interface CategoryProgressProps {
  categories: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
}

const CategoryProgress: React.FC<CategoryProgressProps> = ({ categories }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded (rings) view

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  const getGradientColors = (categoryName: string) => {
    switch (categoryName) {
      case "Career":
        return { start: "#8B5CF6", end: "#EC4899" };
      case "Finances":
        return { start: "#3B82F6", end: "#06B6D4" };
      case "Health":
        return { start: "#10B981", end: "#14B8A6" };
      case "Connections":
        return { start: "#F59E0B", end: "#F97316" };
      default:
        return { start: "#8B5CF6", end: "#EC4899" };
    }
  };

  return (
    <div
      onClick={toggleExpansion} // Click handler for the whole component area
      className="w-full max-w-5xl mx-auto mb-6 md:mb-10 cursor-pointer overflow-hidden" // Added overflow-hidden for cleaner transitions
    >
      {isExpanded ? (
        // Expanded State: Rings view - This div *is* the grid container
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 py-4 px-2 sm:px-4">
          {" "}
          {/* Added padding here for spacing around rings */}
          {categories.map((category) => {
            const categoryColor =
              categoryColors[category.name as keyof typeof categoryColors];
            const iconPath =
              categoryIconPaths[
                category.name as keyof typeof categoryIconPaths
              ];
            const percentage =
              category.total > 0
                ? (category.completed / category.total) * 100
                : 0;
            const circumference = 2 * Math.PI * 35;
            const strokeDasharray = circumference;
            const strokeDashoffset =
              circumference - (percentage / 100) * circumference;

            return (
              <div key={category.name} className="flex flex-col items-center">
                <div className="relative w-20 h-20 md:w-32 md:h-32 mb-2 md:mb-4">
                  <svg
                    className="w-20 h-20 md:w-32 md:h-32 -rotate-90"
                    viewBox="0 0 80 80"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="rgba(75, 85, 99, 0.3)"
                      strokeWidth="6"
                      fill="none"
                      className="drop-shadow-sm"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke={`url(#gradient-${category.name})`}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out drop-shadow-lg"
                    />
                    <defs>
                      <linearGradient
                        id={`gradient-${category.name}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={getGradientColors(category.name).start}
                        />
                        <stop
                          offset="100%"
                          stopColor={getGradientColors(category.name).end}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`${categoryColor.bg} p-2 md:p-3 rounded-full shadow-xl border-2 border-white/30`}
                    >
                      <img
                        src={iconPath}
                        alt={category.name}
                        className="w-5 h-5 md:w-8 md:h-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3
                    className={`font-bold text-sm md:text-lg ${categoryColor.text} mb-1 md:mb-2`}
                  >
                    {category.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 font-medium">
                    {category.completed}/{category.total}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Collapsed State: Bar graph view - Apply padding directly here
        <div className="space-y-4 py-4 px-6">
          {" "}
          {/* Added padding for bars to prevent touching edges */}
          {categories.map((category) => {
            const categoryColor =
              categoryColors[category.name as keyof typeof categoryColors];
            const percentage =
              category.total > 0
                ? (category.completed / category.total) * 100
                : 0;
            return (
              <div key={category.name} className="flex items-center gap-4">
                {/* Applied left padding to the span for pillar names */}
                <span
                  className={`text-sm md:text-base font-semibold w-24 flex-shrink-0 ${categoryColor.text} pl-2`}
                >
                  {" "}
                  {/* Added pl-2 */}
                  {category.name}
                </span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(to right, ${
                        getGradientColors(category.name).start
                      }, ${getGradientColors(category.name).end})`,
                    }}
                  ></div>
                </div>
                {/* Applied right padding to the span for percentages */}
                <span className="text-xs md:text-sm text-gray-400 font-medium w-10 text-right pr-2">
                  {" "}
                  {/* Added pr-2 */}
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryProgress;
