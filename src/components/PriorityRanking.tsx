import { useState, useMemo, useEffect } from 'react';
import { Target, PiggyBank, Heart, Users } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { Pillar, PillarInfo, PriorityRankingProps } from './priority-ranking/types';
import PillarCard from './priority-ranking/PillarCard';
import DropZone from './priority-ranking/DropZone';
import { PillarProgress } from './NewQuadrantChart';

const pillarDetails: Record<Pillar, { icon: JSX.Element }> = {
  Career: { icon: <Target className="h-6 w-6 text-purple-600" /> },
  Financials: { icon: <PiggyBank className="h-6 w-6 text-blue-600" /> },
  Health: { icon: <Heart className="h-6 w-6 text-green-600" /> },
  Connections: { icon: <Users className="h-6 w-6 text-orange-600" /> },
};

export const PriorityRanking = ({ progress, onComplete, value }: PriorityRankingProps) => {
  const initialPillars = useMemo(() => {
    return (['Career', 'Financials', 'Health', 'Connections'] as Pillar[]).map(p => {
      const progressKey = (p === 'Financials' ? 'finances' : p.toLowerCase()) as keyof PillarProgress;
      return {
        id: p,
        name: p,
        score: progress[progressKey] ?? 0,
        icon: pillarDetails[p].icon,
      }
    });
  }, [progress]);

  const [unassigned, setUnassigned] = useState<PillarInfo[]>(initialPillars);
  const [mainFocus, setMainFocus] = useState<PillarInfo[]>([]);
  const [secondaryFocus, setSecondaryFocus] = useState<PillarInfo[]>([]);
  const [maintenance, setMaintenance] = useState<PillarInfo[]>([]);

  useEffect(() => {
    if (value) {
      const main = initialPillars.find(p => p.id === value.mainFocus);
      const secondary = initialPillars.find(p => p.id === value.secondaryFocus);
      const maint = value.maintenance.map(id => initialPillars.find(p => p.id === id)).filter(Boolean) as PillarInfo[];
      
      setMainFocus(main ? [main] : []);
      setSecondaryFocus(secondary ? [secondary] : []);
      setMaintenance(maint);

      const assignedIds = new Set([
        value.mainFocus, 
        value.secondaryFocus, 
        ...value.maintenance
      ]);
      setUnassigned(initialPillars.filter(p => !assignedIds.has(p.id)));
    } else {
        setUnassigned(initialPillars);
        setMainFocus([]);
        setSecondaryFocus([]);
        setMaintenance([]);
    }
  }, [initialPillars, value]);

  const recommendedPillars = useMemo(() => {
    const sorted = [...initialPillars].sort((a, b) => a.score - b.score);
    return sorted.slice(0, 2).map(p => p.id);
  }, [initialPillars]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    if (sourceId === destId) return; // No change

    const listMap: { [key: string]: PillarInfo[] } = {
      unassigned,
      main: mainFocus,
      secondary: secondaryFocus,
      maintenance,
    };
    
    const setterMap: { [key: string]: React.Dispatch<React.SetStateAction<PillarInfo[]>> } = {
        unassigned: setUnassigned,
        main: setMainFocus,
        secondary: setSecondaryFocus,
        maintenance: setMaintenance,
    };

    const sourceList = Array.from(listMap[sourceId]);
    const destList = Array.from(listMap[destId]);
    const [removed] = sourceList.splice(source.index, 1);

    // Enforce constraints on destination lists
    if (destId === 'main' && destList.length >= 1) {
        const [evicted] = destList.splice(0,1);
        sourceList.push(evicted);
    }
    if (destId === 'secondary' && destList.length >= 1) {
        const [evicted] = destList.splice(0,1);
        sourceList.push(evicted);
    }
    if (destId === 'maintenance' && destList.length >= 2) {
        return; // Abort drop, destination is full
    }
    
    destList.splice(destination.index, 0, removed);

    // Update all lists that might have changed
    setterMap[sourceId](sourceList);
    setterMap[destId](destList);

    // If an item was evicted, it goes to the source list, but if the source list was not unassigned,
    // the evicted item should go to unassigned list
    if ( (destId === 'main' || destId === 'secondary') && listMap[destId].length > 0 && sourceId !== 'unassigned') {
        const evicted = listMap[destId][0]; // The item that was there before drop
        const newUnassigned = [...unassigned, evicted];
        setUnassigned(newUnassigned);
        
        const newSourceList = listMap[sourceId].filter(p => p.id !== evicted.id);
        setterMap[sourceId](newSourceList);
    }

    // Check if task is complete after drag and notify parent
    const newMainFocus = destId === 'main' ? destList : (sourceId === 'main' ? sourceList : mainFocus);
    const newSecondaryFocus = destId === 'secondary' ? destList : (sourceId === 'secondary' ? sourceList : secondaryFocus);
    const newMaintenance = destId === 'maintenance' ? destList : (sourceId === 'maintenance' ? sourceList : maintenance);
    
    const isNowComplete = newMainFocus.length === 1 && newSecondaryFocus.length === 1 && newMaintenance.length === 2;
    
    if (isNowComplete) {
      onComplete({
        mainFocus: newMainFocus[0]!.id,
        secondaryFocus: newSecondaryFocus[0]!.id,
        maintenance: newMaintenance.map(p => p.id),
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Setting Your Priorities</h2>
                <p className="text-gray-600 mt-2">To build your ideal 5-year future, where do you want to focus your energy? Drag the four pillars to set your priorities.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Your Life Pillars</h3>
                    <Droppable droppableId="unassigned">
                        {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`p-2 rounded-lg min-h-[100px] flex flex-col items-center gap-3 ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50/50'}`}
                        >
                            {unassigned.map((pillar, index) => (
                            <Draggable key={pillar.id} draggableId={pillar.id} index={index}>
                                {(providedDraggable) => (
                                <PillarCard
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                    pillar={pillar}
                                    recommendedPillars={recommendedPillars}
                                />
                                )}
                            </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                        )}
                    </Droppable>
                </div>
                <div className="space-y-4">
                    <DropZone title="Main Focus (1 pillar)" droppableId="main" pillars={mainFocus} recommendedPillars={recommendedPillars}/>
                    <DropZone title="Secondary Focus (1 pillar)" droppableId="secondary" pillars={secondaryFocus} recommendedPillars={recommendedPillars}/>
                    <DropZone title="Maintenance Mode (2 pillars)" droppableId="maintenance" pillars={maintenance} recommendedPillars={recommendedPillars}/>
                </div>
            </div>
        </div>
    </DragDropContext>
  );
};
