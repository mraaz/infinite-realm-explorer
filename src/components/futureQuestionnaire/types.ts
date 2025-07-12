export type Pillar = "Career" | "Financials" | "Health" | "Connections";

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