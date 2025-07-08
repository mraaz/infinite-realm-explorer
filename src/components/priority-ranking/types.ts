// /src/components/priority-ranking/types.ts (Corrected)

export type Pillar = "Career" | "Financials" | "Health" | "Connections";

// The Priorities type now allows for null values, representing an incomplete state.
export interface Priorities {
  mainFocus: Pillar | null;
  secondaryFocus: Pillar | null;
  maintenance: Pillar[];
}

export interface PillarInfo {
  id: Pillar;
  name: Pillar;
  icon: React.ReactNode;
}

export interface PriorityRankingProps {
  // onComplete now receives the current state, whether partial or complete.
  onComplete: (priorities: Priorities | null) => void;
  value?: Priorities | null;
}

// Define answers types for Future Self Chat
export type PillarAnswers = Record<string, string>;
export type Answers = { [key in Pillar]?: PillarAnswers };
