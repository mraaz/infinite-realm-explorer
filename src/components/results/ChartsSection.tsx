import {
  PulsingRadarChart,
  PillarProgress,
} from "@/components/PulsingRadarChart";

interface ChartsSectionProps {
  currentProgress: PillarProgress;
  futureProgress: PillarProgress;
  onPillarClick: (pillar: string) => void;
  activePillar?: string;
  onStartFutureQuestionnaire: () => void;
}

const ChartsSection = ({
  currentProgress,
  futureProgress,
  onPillarClick,
  activePillar,
}: ChartsSectionProps) => {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
      {/* Chart for "Current Self" */}
      <div className="flex flex-col items-center gap-4">
        <PulsingRadarChart
          title="Your Current Self"
          progress={currentProgress}
          onPillarClick={onPillarClick}
          activePillar={activePillar}
          className="w-full"
        />
      </div>

      {/* Chart for "Future Self" */}
      <div className="flex flex-col items-center gap-4">
        <PulsingRadarChart
          title="Your Future Self"
          progress={futureProgress}
          onPillarClick={onPillarClick}
          activePillar={activePillar}
          className="w-full"
        />
      </div>
    </section>
  );
};

export default ChartsSection;
