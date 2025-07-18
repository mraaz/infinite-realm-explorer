import {
  NewQuadrantChart,
  PillarProgress,
} from "@/components/NewQuadrantChart";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  progress: PillarProgress;
  answers: Record<string, any>;
  onPillarClick: (pillar: string) => void;
  activePillar?: string;
  isFuture?: boolean;
  onRetake: () => void;
  retakeLabel: string;
}

const ChartCard = ({
  title,
  progress,
  answers,
  onPillarClick,
  activePillar,
  isFuture = false,
  onRetake,
  retakeLabel,
}: ChartCardProps) => {
  const hasData = Object.values(progress).some((value) => value > 0);

  return (
    <div className="relative group bg-[#1e1e24] p-6 md:p-8 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {title}
      </h2>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          isFuture && "flex-col"
        )}
      >
        <NewQuadrantChart
          progress={progress}
          answers={answers}
          isFuture={isFuture}
          onPillarClick={onPillarClick}
          activePillar={activePillar}
        />
      </div>
    </div>
  );
};

export default ChartCard;
