
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CoreSystemDesignProps {
  chosenIdentity: string;
  onComplete: (system: string) => void;
}

const CoreSystemDesign = ({ chosenIdentity, onComplete }: CoreSystemDesignProps) => {
  const [system, setSystem] = useState('');

  return (
    <div className="text-left max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Step 2: Design Your Core System</h2>
      <p className="text-gray-600 mt-2 mb-6 text-center">
        For your chosen identity of '{chosenIdentity}'... This identity doesn't rely on willpower; it relies on systems. What is one weekly system you can put in place to guarantee this becomes a priority?
      </p>
      
      <div className="space-y-2 mb-6">
        <label htmlFor="system-description" className="font-semibold text-gray-700 mb-2 block">Your Weekly System:</label>
        <Textarea 
          id="system-description"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          placeholder="e.g., 'Every Sunday evening, I will plan and schedule my three workouts for the upcoming week directly in my work calendar.'"
          rows={4}
        />
      </div>

      <div className="text-center">
        <Button onClick={() => system && onComplete(system)} disabled={!system}>
          Confirm System
        </Button>
      </div>
    </div>
  );
};

export default CoreSystemDesign;
