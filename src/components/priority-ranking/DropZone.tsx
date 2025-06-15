import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { PillarInfo, Pillar } from './types';
import PillarCard from './PillarCard';

const DropZone = ({ title, droppableId, pillars, recommendedPillars }: { title: string; droppableId: string; pillars: PillarInfo[]; recommendedPillars: Pillar[] }) => (
  <div>
    <h3 className="font-semibold text-gray-700">{title}</h3>
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`p-4 w-full min-h-[110px] bg-gray-50/50 border-2 border-dashed rounded-lg flex flex-col justify-center items-center gap-2 ${snapshot.isDraggingOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
        >
          {pillars.length === 0 ? (
            <p className="text-gray-400">Drag pillar here</p>
          ) : (
            pillars.map((pillar, index) => (
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
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export default DropZone;
