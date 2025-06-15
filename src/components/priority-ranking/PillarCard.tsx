
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PillarInfo, Pillar } from './types';

const PillarCard = ({ pillar, recommendedPillars }: { pillar: PillarInfo; recommendedPillars: Pillar[] }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-white border cursor-grab shadow-sm">
    {pillar.icon}
    <div className="flex-grow">
      <h4 className="font-semibold">{pillar.name}</h4>
      <p className="text-sm text-gray-500">Current score: {pillar.score}</p>
    </div>
    {recommendedPillars.includes(pillar.id) && <Badge variant="secondary">Recommended</Badge>}
  </div>
);

export default PillarCard;
