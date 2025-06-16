
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import archetypes from '@/data/archetypes.json';

interface ArchetypeSelectionProps {
  pillar: string;
  onNext: (data: { archetype: string }) => void;
  onPrevious?: () => void;
}

const ArchetypeSelection = ({ pillar, onNext, onPrevious }: ArchetypeSelectionProps) => {
  const pillarData = archetypes[pillar as keyof typeof archetypes];

  if (!pillarData) {
    return <div>Invalid pillar selected</div>;
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Choose Your Archetype
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        {pillarData.prompt}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillarData.archetypes.map((archetype, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => onNext({ archetype: archetype.title })}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {archetype.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {archetype.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {onPrevious && (
        <div className="mt-8">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArchetypeSelection;
