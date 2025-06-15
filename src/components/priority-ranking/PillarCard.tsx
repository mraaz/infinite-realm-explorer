
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PillarInfo, Pillar } from './types';
import { cn } from '@/lib/utils';

const PillarCard = React.forwardRef<HTMLDivElement, { pillar: PillarInfo; recommendedPillars: Pillar[] } & React.HTMLAttributes<HTMLDivElement>>(
  ({ pillar, recommendedPillars, className, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={cn("flex items-center gap-4 p-4 rounded-lg bg-white border cursor-grab shadow-sm", className)}
    >
      {pillar.icon}
      <div className="flex-grow">
        <h4 className="font-semibold">{pillar.name}</h4>
        <p className="text-sm text-gray-500">Current score: {pillar.score}</p>
      </div>
      {recommendedPillars.includes(pillar.id) && <Badge variant="secondary">Recommended</Badge>}
    </div>
  )
);

PillarCard.displayName = 'PillarCard';

export default PillarCard;
