
import ChartCard from './ChartCard';
import { PillarProgress } from '@/components/NewQuadrantChart';

interface ChartsSectionProps {
  currentProgress: PillarProgress;
  futureProgress: PillarProgress;
  answers: Record<string, any>;
  onPillarClick: (pillar: string) => void;
  activePillar?: string;
  onRetakeCurrent: () => void;
  onStartFutureQuestionnaire: () => void;
}

const ChartsSection = ({
  currentProgress,
  futureProgress,
  answers,
  onPillarClick,
  activePillar,
  onRetakeCurrent,
  onStartFutureQuestionnaire,
}: ChartsSectionProps) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <ChartCard
        title="Your Current Self"
        progress={currentProgress}
        answers={answers}
        onPillarClick={onPillarClick}
        activePillar={activePillar}
        onRetake={onRetakeCurrent}
        retakeLabel="Retake"
        isFuture={false}
      />
      <ChartCard
        title="Your Future Self"
        progress={futureProgress}
        answers={answers}
        onPillarClick={onPillarClick}
        activePillar={activePillar}
        isFuture={true}
        onRetake={onStartFutureQuestionnaire}
        retakeLabel="Retake"
      />
    </section>
  );
};

export default ChartsSection;
