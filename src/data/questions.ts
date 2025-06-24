
import { Target, PiggyBank, Heart, Users } from "lucide-react";

export type Pillar = "Career" | "Finances" | "Health" | "Connections";

export const pillarsInfo = {
  Career: {
    icon: Target,
    color: "purple",
  },
  Finances: {
    icon: PiggyBank,
    color: "blue",
  },
  Health: {
    icon: Heart,
    color: "emerald",
  },
  Connections: {
    icon: Users,
    color: "amber",
  },
};

export interface Question {
  id: string;
  question: string;
  type: "text" | "multiple-choice" | "slider" | "date" | "number";
  pillar: Pillar | "Basics";
  options?: string[];
  suggestions?: string[];
  sliderLabels?: { min: string; max: string };
  isOptional?: boolean;
}
