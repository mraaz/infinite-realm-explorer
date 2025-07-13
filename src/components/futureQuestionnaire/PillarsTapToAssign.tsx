// /src/components/priority-ranking/PillarsTapToAssign.tsx (With Auto-Assignment Feature)

import React, { useState, useMemo } from "react";
import { Target, PiggyBank, Heart, Users, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pillar, PillarInfo, Priorities } from "@/components/priority-ranking/types";

interface PillarsTapToAssignProps {
  value?: Priorities | null;
  onUpdate: (priorities: Priorities | null) => void;
}

const pillarDetails: Record<Pillar, { icon: React.ReactNode }> = {
  Career: { icon: <Target className="h-5 w-5 text-purple-400" /> },
  Financials: { icon: <PiggyBank className="h-5 w-5 text-blue-400" /> },
  Health: { icon: <Heart className="h-5 w-5 text-emerald-400" /> },
  Connections: { icon: <Users className="h-5 w-5 text-amber-400" /> },
};

export const PillarsTapToAssign: React.FC<PillarsTapToAssignProps> = ({
  value,
  onUpdate,
}) => {
  const initialPillars = useMemo(() => {
    return (["Career", "Financials", "Health", "Connections"] as Pillar[]).map(
      (p) => ({ id: p, name: p, icon: pillarDetails[p].icon })
    );
  }, []);

  const [selectedPillar, setSelectedPillar] = useState<PillarInfo | null>(null);

  const assignedIds = useMemo(() => {
    if (!value) return new Set<Pillar>();
    const ids = new Set<Pillar>(value.maintenance);
    if (value.mainFocus) ids.add(value.mainFocus);
    if (value.secondaryFocus) ids.add(value.secondaryFocus);
    return ids;
  }, [value]);

  const unassigned = useMemo(
    () => initialPillars.filter((p) => !assignedIds.has(p.id)),
    [initialPillars, assignedIds]
  );
  const mainFocus = useMemo(
    () =>
      value?.mainFocus
        ? initialPillars.filter((p) => p.id === value.mainFocus)
        : [],
    [value, initialPillars]
  );
  const secondaryFocus = useMemo(
    () =>
      value?.secondaryFocus
        ? initialPillars.filter((p) => p.id === value.secondaryFocus)
        : [],
    [value, initialPillars]
  );
  const maintenance = useMemo(
    () =>
      value?.maintenance
        ? initialPillars.filter((p) => value.maintenance.includes(p.id))
        : [],
    [value, initialPillars]
  );

  const handleSelectPillar = (pillar: PillarInfo) => {
    setSelectedPillar((prev) => (prev?.id === pillar.id ? null : pillar));
  };

  const handleAssignPillar = (zone: "main" | "secondary" | "maintenance") => {
    if (!selectedPillar) return;

    const newState: Priorities = {
      mainFocus: value?.mainFocus || null,
      secondaryFocus: value?.secondaryFocus || null,
      maintenance: value?.maintenance || [],
    };

    if (zone === "main") newState.mainFocus = selectedPillar.id;
    if (zone === "secondary") newState.secondaryFocus = selectedPillar.id;
    if (zone === "maintenance") newState.maintenance.push(selectedPillar.id);

    // --- NEW: Auto-assignment logic ---
    // Check if the two main focus areas are now filled.
    if (newState.mainFocus && newState.secondaryFocus) {
      // Find which pillars are still unassigned after the current move.
      const remainingUnassigned = unassigned.filter(
        (p) => p.id !== selectedPillar.id
      );

      // If there are exactly 2 left, they get assigned to maintenance.
      if (remainingUnassigned.length === 2) {
        const remainingIds = remainingUnassigned.map((p) => p.id);
        // We combine the existing maintenance pillars (if any) with the new ones.
        newState.maintenance = [...newState.maintenance, ...remainingIds];
      }
    }

    onUpdate(newState);
    setSelectedPillar(null);
  };

  const handleUnassignPillar = (pillarToUnassign: PillarInfo) => {
    if (!value) return;

    const newState: Priorities = { ...value };

    if (newState.mainFocus === pillarToUnassign.id) newState.mainFocus = null;
    else if (newState.secondaryFocus === pillarToUnassign.id)
      newState.secondaryFocus = null;
    else
      newState.maintenance = newState.maintenance.filter(
        (pId) => pId !== pillarToUnassign.id
      );

    onUpdate(newState);
  };

  return (
    <div className="w-full space-y-6 p-2">
      <div>
        <h3 className="font-semibold text-gray-300 mb-2">
          1. Tap a Pillar to Select
        </h3>
        <div className="p-4 rounded-lg bg-black/20 space-y-3">
          {unassigned.length > 0 ? (
            unassigned.map((pillar) => (
              <PillarButton
                key={pillar.id}
                pillar={pillar}
                isSelected={selectedPillar?.id === pillar.id}
                onClick={() => handleSelectPillar(pillar)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <p className="font-bold">All pillars assigned.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-300 mb-2">
          2. Tap a Zone to Assign
        </h3>
        <div className="space-y-3">
          <AssignmentZone
            title="Main Focus (1 pillar)"
            pillars={mainFocus}
            onAssign={() => handleAssignPillar("main")}
            onUnassign={handleUnassignPillar}
            canAssign={selectedPillar != null && mainFocus.length < 1}
          />
          <AssignmentZone
            title="Secondary Focus (1 pillar)"
            pillars={secondaryFocus}
            onAssign={() => handleAssignPillar("secondary")}
            onUnassign={handleUnassignPillar}
            canAssign={selectedPillar != null && secondaryFocus.length < 1}
          />
          <AssignmentZone
            title="Maintenance Mode (2 pillars)"
            pillars={maintenance}
            onAssign={() => handleAssignPillar("maintenance")}
            onUnassign={handleUnassignPillar}
            canAssign={selectedPillar != null && maintenance.length < 2}
          />
        </div>
      </div>
    </div>
  );
};

// --- Child Components (No changes needed here) ---

interface PillarButtonProps {
  pillar: PillarInfo;
  isSelected: boolean;
  onClick: () => void;
}

const PillarButton: React.FC<PillarButtonProps> = ({
  pillar,
  isSelected,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-3 rounded-lg flex items-center gap-4 text-left transition-all",
      "bg-gray-800 ring-1 ring-gray-700 hover:ring-purple-500",
      isSelected && "ring-2 ring-purple-500 scale-105 shadow-lg"
    )}
  >
    {pillar.icon}
    <p className="font-semibold text-white">{pillar.name}</p>
  </button>
);

interface AssignmentZoneProps {
  title: string;
  pillars: PillarInfo[];
  onAssign: () => void;
  onUnassign: (pillar: PillarInfo) => void;
  canAssign: boolean;
}

const AssignmentZone: React.FC<AssignmentZoneProps> = ({
  title,
  pillars,
  onAssign,
  onUnassign,
  canAssign,
}) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-400 mb-1">{title}</h4>
    <div className="p-2 rounded-lg min-h-[4.5rem] border-2 border-dashed border-gray-700 bg-black/20 flex flex-col justify-center items-center space-y-2">
      {pillars.length > 0 &&
        pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="w-full p-2.5 rounded-lg flex items-center justify-between bg-gray-700"
          >
            <div className="flex items-center gap-3">
              {pillar.icon}
              <p className="font-semibold text-white text-sm">{pillar.name}</p>
            </div>
            <button
              onClick={() => onUnassign(pillar)}
              className="text-gray-400 hover:text-white"
            >
              <XCircle size={20} />
            </button>
          </div>
        ))}

      {canAssign && (
        <button
          onClick={onAssign}
          className="w-full text-center p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/50"
        >
          Assign Here
        </button>
      )}
    </div>
  </div>
);
