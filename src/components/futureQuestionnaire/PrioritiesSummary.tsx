import React from "react";
import { Pillar } from "@/components/priority-ranking/types";
import { Target, PiggyBank, Heart, Users } from "lucide-react";

// --- Type Definitions ---
type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};

interface PrioritiesSummaryProps {
  priorities: Priorities;
}

const pillarIcons: Record<Pillar, React.ReactNode> = {
  Career: <Target className="h-5 w-5 text-purple-400" />,
  Financials: <PiggyBank className="h-5 w-5 text-blue-400" />,
  Health: <Heart className="h-5 w-5 text-emerald-400" />,
  Connections: <Users className="h-5 w-5 text-amber-400" />,
};

const SummaryItem: React.FC<{ label: string; pillar: Pillar }> = ({
  label,
  pillar,
}) => (
  <div className="flex flex-col items-center text-center">
    <p className="text-sm text-gray-400 mb-2">{label}</p>
    <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-gray-700">
      {pillarIcons[pillar]}
      <span className="font-semibold text-white">{pillar}</span>
    </div>
  </div>
);

export const PrioritiesSummary: React.FC<PrioritiesSummaryProps> = ({
  priorities,
}) => {
  if (!priorities) return null;

  return (
    <div className="w-full bg-black/20 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        <SummaryItem label="Main Focus" pillar={priorities.mainFocus} />
        <SummaryItem
          label="Secondary Focus"
          pillar={priorities.secondaryFocus}
        />

        {/* Maintenance Pillars */}
        <div className="flex flex-col items-center md:col-span-2">
          <p className="text-sm text-gray-400 mb-2">Maintenance</p>
          <div className="flex items-center gap-4">
            {priorities.maintenance.map((pillar) => (
              <div
                key={pillar}
                className="flex items-center gap-2 p-2 px-4 rounded-full bg-gray-700"
              >
                {pillarIcons[pillar]}
                <span className="font-semibold text-white">{pillar}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
