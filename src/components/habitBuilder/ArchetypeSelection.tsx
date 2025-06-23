import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import archetypes from "@/data/archetypes.json";
import { cn } from "@/lib/utils";

interface ArchetypeSelectionProps {
  pillar: string;
  onNext: (data: { archetype: string }) => void;
  onPrevious?: () => void;
}

const ArchetypeSelection = ({
  pillar,
  onNext,
  onPrevious,
}: ArchetypeSelectionProps) => {
  const pillarData =
    archetypes[pillar.toLowerCase() as keyof typeof archetypes];

  if (!pillarData) {
    return (
      <div className="text-red-500 text-center">
        Invalid pillar selected. Please go back.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">
        Choose Your Archetype
      </h1>
      <p className="text-lg text-gray-400 mb-8">{pillarData.prompt}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillarData.archetypes.map((archetype, index) => (
          <Card
            key={index}
            className={cn(
              "cursor-pointer bg-[#1e1e24] border-2 border-transparent text-white ring-1 ring-white/10 h-full",
              "transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:border-purple-500"
            )}
            onClick={() => onNext({ archetype: archetype.title })}
          >
            <CardContent className="p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">
                {archetype.title}
              </h3>
              <p className="text-gray-400 text-sm">{archetype.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {onPrevious && (
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
          >
            Previous
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArchetypeSelection;
