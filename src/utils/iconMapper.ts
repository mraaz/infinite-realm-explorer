
import { AlertTriangle, Lightbulb, SquareCode, Users, type LucideIcon } from 'lucide-react';

export const ICON_MAP = {
  AlertTriangle,
  Lightbulb,
  SquareCode,
  Users,
} as const;

export type IconKey = keyof typeof ICON_MAP;

export const getIcon = (iconKey: IconKey): LucideIcon => {
  return ICON_MAP[iconKey];
};

export const isValidIconKey = (key: string): key is IconKey => {
  return key in ICON_MAP;
};
