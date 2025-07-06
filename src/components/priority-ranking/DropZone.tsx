/*
================================================================================
File: /components/priority-ranking/DropZone.tsx (Child Component) - CORRECTED
================================================================================
*/
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import PillarCard from "./PillarCard";
import { PillarInfo } from "./types";
import { cn } from "@/lib/utils";

// The props are simplified, removing `recommendedPillars`.
interface DropZoneProps {
  title: string;
  droppableId: string;
  pillars: PillarInfo[];
}

const DropZone = ({ title, droppableId, pillars }: DropZoneProps) => {
  return (
    <div>
      <h3 className="font-semibold text-gray-300 mb-2">{title}</h3>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "p-4 rounded-lg min-h-[8rem] border-2 border-dashed transition-colors",
              snapshot.isDraggingOver
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 bg-black/20"
            )}
          >
            {pillars.length > 0 ? (
              pillars.map((pillar, index) => (
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
                      // The `recommendedPillars` prop is no longer passed.
                    />
                  )}
                </Draggable>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center text-gray-500 text-sm py-8">
                Drag pillar here
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DropZone;
