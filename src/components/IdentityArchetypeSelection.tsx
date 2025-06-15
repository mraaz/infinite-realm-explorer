import { useState } from 'react';
import { Button } from '@/components/ui/button';
import archetypesData from '@/data/archetypes.json';

interface Archetype {
  title: string;
  description: string;
}

interface IdentityArchetypeSelectionProps {
  mainFocus: string;
  onComplete: (identity: string) => void;
}

const IdentityArchetypeSelection = ({ mainFocus, onComplete }: IdentityArchetypeSelectionProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const typedArchetypesData = archetypesData as Record<string, { prompt: string; archetypes: { title: string; description: string }[] }>;
  const { prompt, archetypes } = typedArchetypesData[mainFocus] || { prompt: 'Choose your identity', archetypes: []};

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
