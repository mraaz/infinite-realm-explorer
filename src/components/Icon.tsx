import React from 'react';
import { 
  Briefcase, 
  DollarSign, 
  Heart, 
  Users, 
  Settings,
  Target,
  PiggyBank,
  type LucideIcon 
} from 'lucide-react';

// Icon mapping for consistent usage across the app
const ICON_MAP = {
  // Pillar icons - consistent with the rest of the app
  career: Target,
  financials: PiggyBank, 
  health: Heart,
  connections: Users,
  
  // Other app icons
  settings: Settings,
  briefcase: Briefcase,
  dollarSign: DollarSign,
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className, size }) => {
  const IconComponent = ICON_MAP[name] as LucideIcon;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default Icon;
