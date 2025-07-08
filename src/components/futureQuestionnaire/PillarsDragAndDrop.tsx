// /src/components/priority-ranking/PillarsDragAndDrop.tsx

import { useState, useMemo, useEffect } from "react";
import { Target, PiggyBank, Heart, Users } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
// CORRECTED: Using the file paths you provided
import DropZone from "../priority-ranking/DropZone";
import PillarCard from "../priority-ranking/PillarCard";
import { Pillar, PillarInfo, Priorities } from "../priority-ranking/types";

// The props for this component. It receives the current state (`value`)
// and a function to call when the state changes (`onUpdate`).
interface PillarsDragAndDropProps {
  value?: Priorities | null;
  onUpdate: (priorities: Priorities | null) => void;
}

const pillarDetails: Record<Pillar, { icon: React.ReactNode }> = {
  Career: { icon: <Target className="h-6 w-6 text-purple-400" /> },
  Financials: { icon: <PiggyBank className="h-6 w-6 text-blue-400" /> },
  Health: { icon: <Heart className="h-6 w-6 text-emerald-400" /> },
  Connections: { icon: <Users className="h-6 w-6 text-amber-400" /> },
};

export const PillarsDragAndDrop: React.FC<PillarsDragAndDropProps> = ({
  onUpdate,
  value,
}) => {
  const initialPillars = useMemo(() => {
    // This now matches the updated PillarInfo type in types.ts
    return (["Career", "Financials", "Health", "Connections"] as Pillar[]).map(
      (p) => ({ id: p, name: p, icon: pillarDetails[p].icon })
    );
  }, []);

  const [unassigned, setUnassigned] = useState<PillarInfo[]>(initialPillars);
  const [mainFocus, setMainFocus] = useState<PillarInfo[]>([]);
  const [secondaryFocus, setSecondaryFocus] = useState<PillarInfo[]>([]);
  const [maintenance, setMaintenance] = useState<PillarInfo[]>([]);

  useEffect(() => {
    if (value) {
      const main = initialPillars.filter((p) => p.id === value.mainFocus);
      const secondary = initialPillars.filter(
        (p) => p.id === value.secondaryFocus
      );
      const maint = initialPillars.filter((p) =>
        value.maintenance.includes(p.id)
      );
      const assignedIds = new Set([
        value.mainFocus,
        value.secondaryFocus,
        ...value.maintenance,
      ]);

      setMainFocus(main);
      setSecondaryFocus(secondary);
      setMaintenance(maint);
      setUnassigned(initialPillars.filter((p) => !assignedIds.has(p.id)));
    } else {
      setUnassigned(initialPillars);
      setMainFocus([]);
      setSecondaryFocus([]);
      setMaintenance([]);
    }
  }, [value, initialPillars]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const lists: Record<string, PillarInfo[]> = {
      unassigned,
      main: mainFocus,
      secondary: secondaryFocus,
      maintenance,
    };
    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    const sourceList = [...lists[sourceId]!];
    const destList = sourceId === destId ? sourceList : [...lists[destId]!];
    const [draggedItem] = sourceList.splice(source.index, 1);

    if (
      (destId === "main" && destList.length >= 1) ||
      (destId === "secondary" && destList.length >= 1) ||
      (destId === "maintenance" && destList.length >= 2)
    ) {
      return;
    }

    destList.splice(destination.index, 0, draggedItem!);

    const newListsState = {
      ...lists,
      [sourceId]: sourceList,
      [destId]: destList,
    };
    setUnassigned(newListsState.unassigned);
    setMainFocus(newListsState.main);
    setSecondaryFocus(newListsState.secondary);
    setMaintenance(newListsState.maintenance);

    if (
      newListsState.main.length === 1 &&
      newListsState.secondary.length === 1 &&
      newListsState.maintenance.length === 2
    ) {
      onUpdate({
        mainFocus: newListsState.main[0]!.id,
        secondaryFocus: newListsState.secondary[0]!.id,
        maintenance: newListsState.maintenance.map((p) => p.id),
      });
    } else {
      onUpdate(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <h3 className="font-semibold text-gray-300 mb-2">
            Your Life Pillars
          </h3>
          <Droppable droppableId="unassigned">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-4 rounded-lg min-h-[24rem] flex flex-col items-center gap-3 transition-colors bg-black/20 ring-1 ring-white/10"
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
          />
          <DropZone
            title="Secondary Focus (1 pillar)"
            droppableId="secondary"
            pillars={secondaryFocus}
          />
          <DropZone
            title="Maintenance Mode (2 pillars)"
            droppableId="maintenance"
            pillars={maintenance}
          />
        </div>
      </div>
    </DragDropContext>
  );
};
