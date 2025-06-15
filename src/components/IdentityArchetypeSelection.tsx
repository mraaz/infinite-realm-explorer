
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Archetype {
  title: string;
  description: string;
}

const archetypesData: Record<string, { prompt: string; archetypes: Archetype[] }> = {
  health: {
    prompt: "Which of these identities best captures the healthy person you want to become?",
    archetypes: [
        { title: 'The Resilient Athlete', description: 'Implying strength, consistency, and pushing limits' },
        { title: 'The Energetic Person', description: 'Implying vitality, good sleep, and daily movement' },
        { title: 'The Mindful Eater', description: 'Implying a focus on nutrition, presence, and body awareness' },
    ]
  },
  career: {
    prompt: "Which professional identity are you working towards?",
    archetypes: [
        { title: 'The Strategic Leader', description: 'Implying mentorship, big-picture thinking' },
        { title: 'The Focused Craftsman', description: 'Implying deep work, skill mastery' },
        { title: 'The Connected Networker', description: 'Implying relationship-building, communication' },
    ]
  },
  financials: {
    prompt: "Which financial identity will bring you peace of mind?",
    archetypes: [
        { title: 'The Confident Investor', description: 'Implying growth, calculated risks, long-term vision' },
        { title: 'The Secure Planner', description: 'Implying stability, budgeting, safety nets' },
        { title: 'The Mindful Spender', description: 'Implying value-alignment, anti-consumerism, conscious choices' },
    ]
  },
  connections: {
    prompt: "Which of these identities will help you build stronger connections?",
    archetypes: [
      { title: 'The Deep Listener', description: 'Implying presence, empathy, and understanding' },
      { title: 'The Community Builder', description: 'Implying bringing people together and creating belonging' },
      { title: 'The Nurturing Friend', description: 'Implying loyalty, support, and proactive care' },
    ]
  },
};

interface IdentityArchetypeSelectionProps {
  mainFocus: string;
  onComplete: (identity: string) => void;
}

const IdentityArchetypeSelection = ({ mainFocus, onComplete }: IdentityArchetypeSelectionProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const { prompt, archetypes } = archetypesData[mainFocus] || { prompt: 'Choose your identity', archetypes: []};

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-700">Step 1: Choose Your Future Identity</h2>
      <p className="text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
        {prompt}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {archetypes.map((archetype) => (
          <div
            key={archetype.title}
            onClick={() => setSelected(archetype.title)}
            className={`p-6 border-2 rounded-lg text-center transition-all duration-200 cursor-pointer h-full flex flex-col justify-center ${
              selected === archetype.title ? 'bg-purple-50 border-purple-500 shadow-md' : 'bg-white hover:border-purple-300 hover:shadow-sm'
            }`}
            role="button"
            aria-pressed={selected === archetype.title}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(archetype.title)}
          >
            <h3 className="font-bold text-lg text-gray-800">{archetype.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{archetype.description}</p>
          </div>
        ))}
      </div>

      <Button onClick={() => selected && onComplete(selected)} disabled={!selected}>
        Confirm Identity
      </Button>
    </div>
  );
};

export default IdentityArchetypeSelection;
