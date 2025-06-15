
import { useState, useMemo, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Landmark, Heart, Users, ArrowRight } from 'lucide-react';

type Pillar = 'Career' | 'Financials' | 'Health' | 'Connections';
type PillarInfo = {
  id: Pillar;
  name: Pillar;
  score: number;
  icon: JSX.Element;
};

interface PriorityRankingProps {
  progress: { [key: string]: number };
  onComplete: (priorities: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] }) => void;
}

const pillarDetails: Record<Pillar, { icon: JSX.Element }> = {
  Career: { icon: <Briefcase className="h-6 w-6 text-purple-600" /> },
  Financials: { icon: <Landmark className="h-6 w-6 text-blue-600" /> },
  Health: { icon: <Heart className="h-6 w-6 text-green-600" /> },
  Connections: { icon: <Users className="h-6 w-6 text-orange-600" /> },
};

export const PriorityRanking = ({ progress, onComplete }: PriorityRankingProps) => {
  const initialPillars = useMemo(() => {
    return (['Career', 'Financials', 'Health', 'Connections'] as Pillar[]).map(p => ({
      id: p,
      name: p,
      score: progress[p.toLowerCase()] ?? 0,
      icon: pillarDetails[p].icon,
    }));
  }, [progress]);
  
  const [pillars, setPillars] = useState<PillarInfo[]>(initialPillars);
  const [mainFocus, setMainFocus] = useState<PillarInfo | null>(null);
  const [secondaryFocus, setSecondaryFocus] = useState<PillarInfo | null>(null);
  const [maintenance, setMaintenance] = useState<PillarInfo[]>([]);

  const recommendedPillars = useMemo(() => {
    const sorted = [...initialPillars].sort((a, b) => a.score - b.score);
    return sorted.slice(0, 2).map(p => p.id);
  }, [initialPillars]);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, pillar: PillarInfo) => {
    e.dataTransfer.setData('pillarId', pillar.id);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, zone: 'main' | 'secondary' | 'maintenance') => {
    e.preventDefault();
    const pillarId = e.dataTransfer.getData('pillarId') as Pillar;
    if (!pillarId) return;

    let pillar = pillars.find(p => p.id === pillarId) || mainFocus || secondaryFocus || maintenance.find(p => p.id === pillarId);
    if (!pillar) return;

    // Remove from all zones before adding to the new one
    setPillars(prev => prev.filter(p => p.id !== pillarId));
    if (mainFocus?.id === pillarId) setMainFocus(null);
    if (secondaryFocus?.id === pillarId) setSecondaryFocus(null);
    setMaintenance(prev => prev.filter(p => p.id !== pillarId));

    // Add to the new zone
    switch(zone) {
      case 'main':
        if (mainFocus) setPillars(prev => [...prev, mainFocus]);
        setMainFocus(pillar);
        break;
      case 'secondary':
        if (secondaryFocus) setPillars(prev => [...prev, secondaryFocus]);
        setSecondaryFocus(pillar);
        break;
      case 'maintenance':
        if (maintenance.length < 2) {
          setMaintenance(prev => [...prev, pillar!]);
        } else {
          // Zone is full, return dragged pillar to source list
          setPillars(prev => [...prev, pillar!]);
        }
        break;
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const isComplete = mainFocus && secondaryFocus && maintenance.length === 2;

  const PillarCard = ({ pillar, isDraggable }: { pillar: PillarInfo; isDraggable: boolean }) => (
    <div
      draggable={isDraggable}
      onDragStart={e => isDraggable && handleDragStart(e, pillar)}
      className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-${isDraggable ? 'grab' : 'default'} transition-all`}
    >
      {pillar.icon}
      <div className="flex-grow">
        <h4 className="font-semibold">{pillar.name}</h4>
        <p className="text-sm text-gray-500">Current score: {pillar.score}</p>
      </div>
      {recommendedPillars.includes(pillar.id) && <Badge variant="secondary">Recommended</Badge>}
    </div>
  );

  const DropZone = ({ title, pillars, onDrop, onDragOver, id }: { title: string; pillars: PillarInfo | PillarInfo[] | null; onDrop: any; onDragOver: any; id: string }) => (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div
        id={id}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="p-4 w-full h-full min-h-[100px] bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center gap-2"
      >
        {!pillars || (Array.isArray(pillars) && pillars.length === 0) ? (
          <p className="text-gray-400">Drag pillar here</p>
        ) : (
          (Array.isArray(pillars) ? pillars : [pillars]).map(p => <PillarCard key={p.id} pillar={p} isDraggable={true} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Setting Your Priorities</h2>
        <p className="text-gray-600 mt-2">To build your ideal 5-year future, where do you want to focus your energy? Drag the four pillars to set your priorities.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Your Life Pillars</h3>
          <div className="space-y-3">
            {pillars.map(p => <PillarCard key={p.id} pillar={p} isDraggable={true} />)}
          </div>
        </div>
        <div className="space-y-4">
            <DropZone title="Main Focus (1 pillar)" pillars={mainFocus} id="main" onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, 'main')} onDragOver={handleDragOver} />
            <DropZone title="Secondary Focus (1 pillar)" pillars={secondaryFocus} id="secondary" onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, 'secondary')} onDragOver={handleDragOver} />
            <DropZone title="Maintenance Mode (2 pillars)" pillars={maintenance} id="maintenance" onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, 'maintenance')} onDragOver={handleDragOver} />
        </div>
      </div>
      <div className="mt-12 flex justify-end">
        <Button 
          size="lg" 
          disabled={!isComplete} 
          onClick={() => onComplete({ mainFocus: mainFocus!.id, secondaryFocus: secondaryFocus!.id, maintenance: maintenance.map(p => p.id) })}
        >
          Next <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
