import { Target, PiggyBank, Heart, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pillar, pillarsInfo } from "@/data/questions";

// This is the individual pillar circle component. All styles have been updated for the dark theme.
const PillarItem = ({
  name,
  Icon,
  progress,
  active,
}: {
  name: string;
  Icon: React.ElementType;
  progress: number;
  active: boolean;
}) => (
  <div className="flex flex-col items-center gap-2 text-center w-28">
    <div
      className={cn(
        "relative h-24 w-24 rounded-full flex items-center justify-center border-4 transition-colors duration-300",
        active ? "border-purple-500" : "border-gray-700" // Dark theme border
      )}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center transition-colors duration-300",
          active ? "bg-purple-500/10" : "bg-gray-800" // Dark theme background
        )}
      >
        <Icon
          className={cn(
            "h-8 w-8 transition-colors duration-300",
            active ? "text-purple-400" : "text-gray-500"
          )}
        />
      </div>
      {progress > 0 && (
        // Styled the progress bubble for dark theme
        <div className="absolute -bottom-2.5 bg-gray-700 px-2 rounded-full text-xs font-semibold text-gray-200 border border-gray-600">
          {Math.round(progress)}%
        </div>
      )}
    </div>
    {/* Updated text color for readability */}
    <p className="font-semibold text-gray-300 text-sm mt-2">{name}</p>
    {progress === 100 ? null : (
      // Placeholder to maintain layout consistency
      <div className="h-5" />
    )}
  </div>
);

// This is the main container component. No style changes were needed here.
const PillarStatus = ({
  pillarPercentages,
}: {
  pillarPercentages: Record<Pillar, number>;
}) => (
  <div className="flex justify-center items-start flex-wrap gap-4 sm:gap-8 md:gap-12 my-8 w-full max-w-3xl mx-auto">
    {(Object.keys(pillarsInfo) as Pillar[]).map((pillarName) => {
      const info = pillarsInfo[pillarName];
      const progress = pillarPercentages[pillarName];
      const isActive = progress > 0;
      return (
        <PillarItem
          key={pillarName}
          name={pillarName}
          Icon={info.icon}
          progress={progress}
          active={isActive}
        />
      );
    })}
  </div>
);

export default PillarStatus;
