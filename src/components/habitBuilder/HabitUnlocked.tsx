
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle } from 'lucide-react';

interface HabitUnlockedProps {
  habitData: {
    archetype: string;
    habitStatement: string;
  };
  onFinish: () => void;
}

const HabitUnlocked = ({ habitData, onFinish }: HabitUnlockedProps) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Habit Unlocked: {habitData.archetype} 🏆
        </h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your New Habit:</h3>
              <p className="text-gray-700 italic text-lg">"{habitData.habitStatement}"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
        <p className="text-blue-700 text-sm">
          Your new habit is now active! Track your progress with weekly check-ins and build your streak. 
          Remember: consistency beats perfection.
        </p>
      </div>

      <Button onClick={onFinish} size="lg" className="w-full sm:w-auto">
        Got it. Let's Start!
      </Button>
    </div>
  );
};

export default HabitUnlocked;
