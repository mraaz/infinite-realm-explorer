
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Rocket, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { FutureSelfArchitect } from '@/types/results';

interface HabitsTimelineProps {
  habits: FutureSelfArchitect[];
}

const HabitsTimeline = ({ habits }: HabitsTimelineProps) => {
  const [visibleCount, setVisibleCount] = useState(2);

  if (habits.length === 0) {
    return null;
  }

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 2, habits.length));
  };

  const visibleHabits = habits.slice(0, visibleCount);
  const hasMore = visibleCount < habits.length;

  return (
    <section className="mb-16 flex justify-center">
      <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <h2>Habits Timeline</h2>
          </div>
          <div className="relative border-l-2 border-gray-200 pl-6">
            <ul className="space-y-8">
              {visibleHabits.map((habit, index) => (
                <li key={index} className="relative">
                  <div className="absolute -left-[34px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                      <p className="font-semibold text-gray-800">{habit.identity}</p>
                      <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {habit.completionDate ? format(new Date(habit.completionDate), 'do MMM yyyy') : ''}
                      </p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700">Core Systems:</p>
                        <div className="mt-1 space-y-1 text-gray-600 italic">
                          {habit.system.split('\n').filter(s => s.trim()).map((s, i) => <p key={i}>- {s}</p>)}
                        </div>
                    </div>
                    {habit.completionNotes && (
                       <div className="mt-2">
                         <p className="font-semibold text-gray-700">Completion Notes:</p>
                         <p className="mt-1 text-gray-600 italic">"{habit.completionNotes}"</p>
                       </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={showMore}
                variant="outline"
                className="flex items-center gap-2"
              >
                <span>Show More ({habits.length - visibleCount} remaining)</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default HabitsTimeline;
