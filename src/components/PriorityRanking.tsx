// /src/components/PriorityRanking.tsx (Corrected)

import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PillarsDragAndDrop } from "./futureQuestionnaire/PillarsDragAndDrop";
import { PillarsTapToAssign } from "./futureQuestionnaire/PillarsTapToAssign";
import { PriorityRankingProps, Priorities } from "./priority-ranking/types";

export const PriorityRanking: React.FC<PriorityRankingProps> = ({
  onComplete,
  value,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentPriorities, setCurrentPriorities] = useState<Priorities | null>(
    value || null
  );

  // FIXED: Wrap the handleUpdate function in useCallback
  // This memoizes the function, preventing it from being recreated on every render.
  // This will break the infinite loop in the child component.
  const handleUpdate = useCallback(
    (newPriorities: Priorities | null) => {
      setCurrentPriorities(newPriorities);
      onComplete(newPriorities);
    },
    [onComplete]
  ); // The function will only be recreated if onComplete changes.

  useEffect(() => {
    setCurrentPriorities(value || null);
  }, [value]);

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          Setting Your Priorities
        </h2>
        <p className="text-gray-400 mt-2">
          To build your ideal 5-year future, where do you want to focus your
          energy?
        </p>
      </div>

      {isMobile ? (
        <PillarsTapToAssign value={currentPriorities} onUpdate={handleUpdate} />
      ) : (
        <PillarsDragAndDrop value={currentPriorities} onUpdate={handleUpdate} />
      )}
    </div>
  );
};
