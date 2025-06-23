/*
================================================================================
File: /components/PriorityRanking.tsx (The main component)
================================================================================
- This is the updated main component.
- The import paths for PillarCard and DropZone have been corrected.
- The onDragEnd logic has been rewritten to be more robust and fix dragging.
*/
import { useState, useMemo, useEffect } from "react";
import { Target, PiggyBank, Heart, Users } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import {
  Pillar,
  PillarInfo,
  PriorityRankingProps,
} from "./priority-ranking/types";
import PillarCard from "./priority-ranking/PillarCard";
import DropZone from "./priority-ranking/DropZone";
import { PillarProgress } from "./NewQuadrantChart";

const pillarDetails: Record<Pillar, { icon: React.ReactNode }> = {
  Career: { icon: <Target className="h-6 w-6 text-purple-400" /> },
  Financials: { icon: <PiggyBank className="h-6 w-6 text-blue-400" /> },
  Health: { icon: <Heart className="h-6 w-6 text-emerald-400" /> },
  Connections: { icon: <Users className="h-6 w-6 text-amber-400" /> },
};

export const PriorityRanking = ({
  progress,
  onComplete,
  value,
}: PriorityRankingProps) => {
  const initialPillars = useMemo(() => {
    return (["Career", "Financials", "Health", "Connections"] as Pillar[]).map(
      (p) => {
        const progressKey = (
          p === "Financials" ? "finances" : p.toLowerCase()
        ) as keyof PillarProgress;
        return {
          id: p,
          name: p,
          score: progress[progressKey] ?? 0,
          icon: pillarDetails[p].icon,
        };
      }
    );
  }, [progress]);

  const [unassigned, setUnassigned] = useState<PillarInfo[]>(initialPillars);
  const [mainFocus, setMainFocus] = useState<PillarInfo[]>([]);
  const [secondaryFocus, setSecondaryFocus] = useState<PillarInfo[]>([]);
  const [maintenance, setMaintenance] = useState<PillarInfo[]>([]);

  useEffect(() => {
    if (value) {
      const main = initialPillars.find((p) => p.id === value.mainFocus);
      const secondary = initialPillars.find(
        (p) => p.id === value.secondaryFocus
      );
      const maint = value.maintenance
        .map((id) => initialPillars.find((p) => p.id === id))
        .filter(Boolean) as PillarInfo[];

      setMainFocus(main ? [main] : []);
      setSecondaryFocus(secondary ? [secondary] : []);
      setMaintenance(maint);

      const assignedIds = new Set([
        value.mainFocus,
        value.secondaryFocus,
        ...value.maintenance,
      ]);
      setUnassigned(initialPillars.filter((p) => !assignedIds.has(p.id)));
    } else {
      setUnassigned(initialPillars);
      setMainFocus([]);
      setSecondaryFocus([]);
      setMaintenance([]);
    }
  }, [initialPillars, value]);

  const recommendedPillars = useMemo(() => {
    const sorted = [...initialPillars].sort((a, b) => a.score - b.score);
    return sorted.slice(0, 2).map((p) => p.id);
  }, [initialPillars]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceId = source.droppableId as keyof typeof lists;
    const destId = destination.droppableId as keyof typeof lists;

    const lists = {
      unassigned: unassigned,
      main: mainFocus,
      secondary: secondaryFocus,
      maintenance: maintenance,
    };

    const sourceList = [...lists[sourceId]];
    const destList = sourceId === destId ? sourceList : [...lists[destId]];
    const [draggedItem] = sourceList.splice(source.index, 1);

    // Enforce destination list limits
    if (destId === "main" && destList.length >= 1) {
      sourceList.splice(source.index, 0, draggedItem); // Put it back if drop is invalid
      return;
    }
    if (destId === "secondary" && destList.length >= 1) {
      sourceList.splice(source.index, 0, draggedItem);
      return;
    }
    if (destId === "maintenance" && destList.length >= 2) {
      sourceList.splice(source.index, 0, draggedItem);
      return;
    }

    destList.splice(destination.index, 0, draggedItem);

    const newLists = {
      ...lists,
      [sourceId]: sourceList,
      [destId]: destList,
    };

    setUnassigned(newLists.unassigned);
    setMainFocus(newLists.main);
    setSecondaryFocus(newLists.secondary);
    setMaintenance(newLists.maintenance);

    if (
      newLists.main.length === 1 &&
      newLists.secondary.length === 1 &&
      newLists.maintenance.length === 2
    ) {
      onComplete({
        mainFocus: newLists.main[0]!.id,
        secondaryFocus: newLists.secondary[0]!.id,
        maintenance: newLists.maintenance.map((p) => p.id),
      });
    } else {
      onComplete(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            Setting Your Priorities
          </h2>
          <p className="text-gray-400 mt-2">
            To build your ideal 5-year future, where do you want to focus your
            energy? Drag the four pillars to set your priorities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h3 className="font-semibold text-gray-300 mb-2">
              Your Life Pillars
            </h3>
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-4 rounded-lg min-h-[24rem] flex flex-col items-center gap-3 transition-colors bg-black/20 ring-1 ring-white/10 ${
                    snapshot.isDraggingOver ? "ring-purple-500" : ""
                  }`}
                >
                  {unassigned.map((pillar, index) => (
                    <Draggable
                      key={pillar.id}
                      draggableId={pillar.id}
                      index={index}
                    >
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
            <DropZone
              title="Main Focus (1 pillar)"
              droppableId="main"
              pillars={mainFocus}
              recommendedPillars={recommendedPillars}
            />
            <DropZone
              title="Secondary Focus (1 pillar)"
              droppableId="secondary"
              pillars={secondaryFocus}
              recommendedPillars={recommendedPillars}
            />
            <DropZone
              title="Maintenance Mode (2 pillars)"
              droppableId="maintenance"
              pillars={maintenance}
              recommendedPillars={recommendedPillars}
            />
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
