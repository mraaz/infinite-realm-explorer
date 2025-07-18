
import { 
  AlertTriangle, 
  Lightbulb, 
  SquareCode, 
  Users, 
  TrendingUp,
  Target,
  Heart,
  PiggyBank,
  type LucideIcon 
} from 'lucide-react';

export const ICON_MAP = {
  AlertTriangle,
  Lightbulb,
  SquareCode,
  Users,
  TrendingUp,
  Target,
  Heart,
  PiggyBank,
} as const;

export type IconKey = keyof typeof ICON_MAP;

export const getIcon = (iconKey: IconKey): LucideIcon => {
  const icon = ICON_MAP[iconKey];
  if (!icon) {
    console.warn(`Icon "${iconKey}" not found in ICON_MAP, falling back to AlertTriangle`);
    return ICON_MAP.AlertTriangle;
  }
  return icon;
};

export const isValidIconKey = (key: string): key is IconKey => {
  return key in ICON_MAP;
};
