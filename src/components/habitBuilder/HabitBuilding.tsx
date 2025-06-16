
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HabitBuildingProps {
  pillar: string;
  archetype: string;
  onNext: (data: { habitStatement: string; action: string; duration: string; frequency: string }) => void;
  isEditing?: boolean;
  initialData?: any;
}

// Starter habits for each archetype
const starterHabits = {
  "The Energetic Person": [
    { title: "The Lunchtime Walk", action: "go for a walk", duration: "15 minutes", frequency: "3" },
    { title: "The Morning Stretch", action: "do stretching exercises", duration: "10 minutes", frequency: "5" },
    { title: "The Digital Sunset", action: "put away all screens", duration: "1 hour before bed", frequency: "7" },
  ],
  "The Strategic Leader": [
    { title: "The Daily Reflection", action: "write in my journal", duration: "10 minutes", frequency: "7" },
    { title: "The Learning Hour", action: "read industry articles", duration: "30 minutes", frequency: "3" },
    { title: "The Team Check-in", action: "have one-on-ones", duration: "20 minutes", frequency: "2" },
  ],
  // Add more archetypes as needed
};

const HabitBuilding = ({ pillar, archetype, onNext, isEditing, initialData }: HabitBuildingProps) => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [customMode, setCustomMode] = useState(false);
  const [action, setAction] = useState(initialData?.action || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || '');

  const suggestions = starterHabits[archetype as keyof typeof starterHabits] || [];

  const handleStarterSelect = (habit: any) => {
    setSelectedHabit(habit);
    setAction(habit.action);
    setDuration(habit.duration);
    setFrequency(habit.frequency);
  };

  const handleNext = () => {
    const habitStatement = `I will ${action} for ${duration}, ${frequency} times a week.`;
    onNext({ habitStatement, action, duration, frequency });
  };

  const handleGoBack = () => {
    setCustomMode(false);
    setSelectedHabit(null);
    setAction('');
    setDuration('');
    setFrequency('');
  };

  const isValid = action && duration && frequency;

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Build Your Habit
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        You've chosen the path of <strong>"{archetype}"</strong>. Let's build the small, consistent habit for this identity.
      </p>

      {!customMode && suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose a Starter Habit</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {suggestions.map((habit, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedHabit?.title === habit.title ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleStarterSelect(habit)}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{habit.title}</h4>
                  <p className="text-sm text-gray-600">
                    I will {habit.action} for {habit.duration}, {habit.frequency} times a week.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button variant="outline" onClick={() => setCustomMode(true)}>
            Create Your Own
          </Button>
        </div>
      )}

      {(customMode || selectedHabit || isEditing) && (
        <Card className="text-left max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Customise Your Habit</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="action">I will</Label>
                <Input
                  id="action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="go for a walk"
                />
              </div>
              
              <div>
                <Label htmlFor="duration">for</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="15 minutes"
                />
              </div>
              
              <div>
                <Label htmlFor="frequency">times a week</Label>
                <Input
                  id="frequency"
                  type="number"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="7"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Your Habit Preview:</h4>
              <p className="text-gray-800 italic">
                "I will {action || '[ACTION]'} for {duration || '[DURATION]'}, {frequency || '[NUMBER]'} times a week."
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              {customMode && (
                <Button variant="outline" onClick={handleGoBack}>
                  Go Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={!isValid} className="flex-1">
                {isEditing ? 'Update Habit' : 'Lock In This Habit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HabitBuilding;
