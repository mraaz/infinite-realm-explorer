
import { PillarProgress } from '@/components/NewQuadrantChart';

export type Pillar = 'Career' | 'Financials' | 'Health' | 'Connections';

export type PillarInfo = {
  id: Pillar;
  name: Pillar;
  score: number;
  icon: React.ReactNode;
};

export interface PriorityRankingProps {
  progress: PillarProgress;
  onComplete: (priorities: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] }) => void;
  value?: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] } | null;
}
