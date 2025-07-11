
import { RefreshCw, Play } from 'lucide-react';
import { NewQuadrantChart, PillarProgress } from '@/components/NewQuadrantChart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  retakeLabel
}: ChartCardProps) => {
  const hasData = Object.values(progress).some(value => value > 0);

  return (
    <div className="relative group bg-[#1e1e24] p-6 md:p-8 rounded-2xl shadow-lg border border-gray-700">
      {(hasData || !isFuture) && (
        <Button
          onClick={onRetake}
          variant="secondary"
          size="sm"
          className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 no-print bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-gray-600"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {retakeLabel}
        </Button>
      )}
      <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
      <div className={cn("flex items-center justify-center rounded-lg", isFuture && "flex-col")}>
        <NewQuadrantChart 
          progress={progress}
          answers={answers}
          isFuture={isFuture}
          onPillarClick={onPillarClick}
          activePillar={activePillar}
        />
        {isFuture && !hasData && (
          <Button onClick={onRetake} className="mt-8 no-print h-11 rounded-md px-8 bg-gradient-cta hover:opacity-90">
            <Play className="mr-2 h-4 w-4" />
            Start your future self journey
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
