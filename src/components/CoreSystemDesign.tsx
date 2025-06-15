
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';

interface CoreSystemDesignProps {
  chosenIdentity: string;
  mainFocus: string;
  onComplete: (system: string) => void;
  value?: string;
}

const promptFocusMapping: Record<string, string> = {
  health: 'your energy levels become',
  career: 'your professional growth becomes',
  financials: 'your financial well-being becomes',
  connections: 'your relationships become',
};

const CoreSystemDesign = ({ chosenIdentity, mainFocus, onComplete, value }: CoreSystemDesignProps) => {
  const [system, setSystem] = useState(value || '');
  const focusText = promptFocusMapping[mainFocus.toLowerCase()] || 'this becomes';

  return (
    <div className="text-left max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Step 2: Design Your Core System</h2>
      <p className="text-gray-600 mt-2 mb-6 text-center">
        For your chosen identity of '{chosenIdentity}'... This identity doesn't rely on willpower; it relies on systems. What is one weekly system you can put in place to guarantee {focusText} a priority?
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

      <div className="mt-4 mb-6 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-md">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Lightbulb className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <span className="font-bold">Tip:</span> A system is a repeatable process, not a one-off task. Think about when, where, and how you'll consistently take action.
            </p>
          </div>
        </div>
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
