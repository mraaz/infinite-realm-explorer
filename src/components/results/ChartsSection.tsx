
import { useState } from 'react';
import { BarChart3, TrendingUp, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewQuadrantChart, PillarProgress } from '@/components/NewQuadrantChart';

interface ChartsSectionProps {
  currentProgress: PillarProgress;
  futureProgress?: PillarProgress;
  answers: Record<string, any>;
  onPillarClick: (pillar: string) => void;
  activePillar?: string;
  onRetakeCurrent: () => void;
  onStartFutureQuestionnaire: () => void;
  isPublicView?: boolean;
}

const ChartsSection = ({
  currentProgress,
  futureProgress,
  answers,
  onPillarClick,
  activePillar,
  onRetakeCurrent,
  onStartFutureQuestionnaire,
  isPublicView = false
}: ChartsSectionProps) => {
  const [showComparison, setShowComparison] = useState(false);

  const hasFutureTargets = futureProgress && Object.values(futureProgress).some(val => val > 0);

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          Your Life Balance Overview
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          See how you're performing across the four key pillars of life and track your progress toward your ideal future self.
        </p>
      </div>

      <div className="grid gap-8 lg:gap-12">
        {/* Current Results Chart */}
        <Card className="bg-white/60 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <BarChart3 className="h-5 w-5" />
              Current Life Balance
            </CardTitle>
            <CardDescription>
              Your baseline assessment across the four pillars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewQuadrantChart
              progress={currentProgress}
              answers={answers}
              onPillarClick={onPillarClick}
              activePillar={activePillar}
            />
            {!isPublicView && (
              <div className="mt-6 text-center">
                <Button
                  onClick={onRetakeCurrent}
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Repeat className="h-4 w-4" />
                  Retake Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Targets or Call to Action */}
        {hasFutureTargets && !isPublicView ? (
          <Card className="bg-white/60 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <TrendingUp className="h-5 w-5" />
                Future Self Targets
              </CardTitle>
              <CardDescription>
                Your aspirational goals for each pillar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewQuadrantChart
                progress={futureProgress}
                answers={answers}
                isFuture={true}
              />
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setShowComparison(!showComparison)}
                  variant="outline"
                  className="mr-3"
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </Button>
                <Button
                  onClick={onStartFutureQuestionnaire}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Update Targets
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !isPublicView ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-gray-600">
                <TrendingUp className="h-5 w-5" />
                Set Your Future Targets
              </CardTitle>
              <CardDescription>
                Define where you want to be in 5 years across each pillar of life
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={onStartFutureQuestionnaire}
                className="bg-green-600 hover:bg-green-700"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Set Future Goals
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Comparison Chart */}
        {showComparison && hasFutureTargets && !isPublicView && (
          <Card className="bg-white/60 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <TrendingUp className="h-5 w-5" />
                Progress Comparison
              </CardTitle>
              <CardDescription>
                Current state vs future aspirations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-center mb-4 text-blue-600">Current</h3>
                  <NewQuadrantChart
                    progress={currentProgress}
                    answers={answers}
                    className="scale-75"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-center mb-4 text-green-600">Target</h3>
                  <NewQuadrantChart
                    progress={futureProgress}
                    answers={answers}
                    isFuture={true}
                    className="scale-75"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default ChartsSection;
