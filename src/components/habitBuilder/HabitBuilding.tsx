
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HabitBuildingProps {
  pillar: string;
  archetype: string;
  onNext: (data: { habitStatement: string; action: string; duration: string; frequency: string }) => void;
  onPrevious?: () => void;
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

const HabitBuilding = ({ pillar, archetype, onNext, onPrevious, isEditing, initialData }: HabitBuildingProps) => {
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

  const handleKeyDown = (event: React.KeyboardEvent, habit: any) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStarterSelect(habit);
    }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
          Build Your Habit
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
          You've chosen the path of <strong>"{archetype}"</strong>. Let's build the small, consistent habit for this identity.
        </p>
      </div>

      {!customMode && suggestions.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Choose a Starter Habit</h3>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
            role="radiogroup"
            aria-label="Choose a starter habit for your archetype"
          >
            {suggestions.map((habit, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 ${
                  selectedHabit?.title === habit.title ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleStarterSelect(habit)}
                onKeyDown={(e) => handleKeyDown(e, habit)}
                tabIndex={0}
                role="radio"
                aria-checked={selectedHabit?.title === habit.title}
                aria-labelledby={`habit-title-${index}`}
                aria-describedby={`habit-description-${index}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <h4 id={`habit-title-${index}`} className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{habit.title}</h4>
                  <p id={`habit-description-${index}`} className="text-xs sm:text-sm text-gray-600">
                    I will {habit.action} for {habit.duration}, {habit.frequency} times a week.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setCustomMode(true)}
              aria-label="Switch to custom habit creation mode"
            >
              Customise Your Own
            </Button>
          </div>
        </div>
      )}

      {(customMode || selectedHabit || isEditing) && (
        <Card className="text-left max-w-2xl mx-auto">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Customise Your Habit</h3>
            
            <div className="space-y-3 sm:space-y-4" role="group" aria-labelledby="habit-form">
              <div>
                <Label htmlFor="action" className="text-sm sm:text-base">I will</Label>
                <Input
                  id="action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="go for a walk"
                  aria-describedby="action-help"
                  className="mt-1"
                />
                <div id="action-help" className="sr-only">
                  Enter the action you want to perform as part of your habit
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration" className="text-sm sm:text-base">for</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="15 minutes"
                  aria-describedby="duration-help"
                  className="mt-1"
                />
                <div id="duration-help" className="sr-only">
                  Enter how long you want to perform this action
                </div>
              </div>
              
              <div>
                <Label htmlFor="frequency" className="text-sm sm:text-base">times a week</Label>
                <Input
                  id="frequency"
                  type="number"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="7"
                  aria-describedby="frequency-help"
                  className="mt-1"
                />
                <div id="frequency-help" className="sr-only">
                  Enter how many times per week you want to perform this habit (1-7)
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Your Habit Preview:</h4>
              <p className="text-gray-800 italic text-sm sm:text-base" aria-live="polite">
                "I will {action || '[ACTION]'} for {duration || '[DURATION]'}, {frequency || '[NUMBER]'} times a week."
              </p>
            </div>

            {customMode && (
              <div className="mt-4 sm:mt-6">
                <Button variant="outline" onClick={handleGoBack}>
                  Go Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons at the bottom */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4 sm:gap-0">
        {onPrevious ? (
          <Button variant="outline" size="lg" onClick={onPrevious} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        ) : (
          <div className="hidden sm:block sm:w-24"></div>
        )}
        
        <Button 
          size="lg" 
          onClick={handleNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 w-full sm:w-auto"
          aria-label={isValid ? (isEditing ? 'Update your habit' : 'Confirm and lock in this habit') : 'Complete all fields to continue'}
        >
          {isEditing ? 'Update Habit' : 'Lock In This Habit'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HabitBuilding;
