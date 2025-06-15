
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
  const [system, setSystem] = useState<string>(value || '');
  const focusText = promptFocusMapping[mainFocus.toLowerCase()] || 'this becomes';

  const handleSystemChange = (newValue: string) => {
    setSystem(newValue);
  };

  const handleComplete = () => {
    const validSystems = system.split('\n').filter(s => s.trim() !== '');
    if (validSystems.length > 0) {
      onComplete(validSystems.join('\n'));
    }
  };

  const isSystemFilled = system.trim() !== '';

  return (
    <div className="text-left max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Step 2: Design Your Core Systems</h2>
      <p className="text-gray-600 mt-2 mb-6 text-center">
        For your chosen identity of '{chosenIdentity}'... This identity doesn't rely on willpower; it relies on systems. What weekly systems can you put in place to guarantee {focusText} a priority?
      </p>

      <div className="mt-4 mb-6 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-md">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Lightbulb className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <span className="font-bold">Tip:</span> A system is a repeatable process, not a one-off task. You can add multiple systems by writing each on a new line.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <label htmlFor="system-description" className="font-semibold text-gray-700 mb-2 block">Your Weekly Systems:</label>
        <Textarea 
          id="system-description"
          value={system}
          onChange={(e) => handleSystemChange(e.target.value)}
          placeholder="e.g., 'Every Sunday evening, I will plan and schedule my three workouts for the upcoming week directly in my work calendar.'"
          rows={5}
          className="flex-grow"
        />
      </div>

      <div className="text-center">
        <Button onClick={handleComplete} disabled={!isSystemFilled}>
          Confirm Systems
        </Button>
      </div>
    </div>
  );
};

export default CoreSystemDesign;
