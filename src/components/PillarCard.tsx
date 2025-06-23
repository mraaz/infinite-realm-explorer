// src/components/PillarCard.tsx
import { FC, ReactNode } from "react";

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
  // The h-full class ensures the card takes up the full height of its grid container
  <div
    className={`bg-[#2a2a30] p-6 rounded-2xl border border-transparent ${hoverBorderColor} transition-colors duration-300 h-full flex flex-col`}
  >
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor} mb-4 mx-auto`}
    >
      {icon}
    </div>
    {/* The text-center class has been added to center the title and description */}
    <div className="text-center">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default PillarCard;
