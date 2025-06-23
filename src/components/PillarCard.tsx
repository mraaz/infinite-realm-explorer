/*
================================================================================
File: /components/PillarCard.tsx
================================================================================
- This is the updated PillarCard component for the homepage.
- Styles have been updated to match the dark theme and add interactive
  hover effects for a more modern feel.
*/
import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

// --- TYPE DEFINITION ---
interface PillarCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  hoverBorderColor: string;
  iconBgColor: string;
}

// --- MAIN COMPONENT ---
const PillarCard: FC<PillarCardProps> = ({
  icon,
  title,
  description,
  hoverBorderColor,
  iconBgColor,
}) => (
  <div
    className={cn(
      "bg-[#1e1e24] p-6 rounded-2xl border-2 border-transparent h-full flex flex-col",
      "transition-all duration-300 ease-in-out transform hover:-translate-y-2",
      hoverBorderColor // Expects a full class like "hover:border-purple-500"
    )}
  >
    <div
      className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto",
        iconBgColor // Expects a full class like "bg-purple-500/10"
      )}
    >
      {icon}
    </div>
    <div className="text-center">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default PillarCard;
