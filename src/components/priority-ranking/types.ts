
import { PillarProgress } from '@/components/NewQuadrantChart';

export type Pillar = 'Career' | 'Finances' | 'Health' | 'Connections';

export type PillarInfo = {
  id: Pillar;
  name: Pillar;
  score: number;
  icon: JSX.Element;
};

export interface PriorityRankingProps {
  progress: PillarProgress;
  onComplete: (priorities: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] }) => void;
  value?: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] } | null;
}
