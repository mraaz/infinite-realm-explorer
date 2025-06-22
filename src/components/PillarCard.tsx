
import React from 'react';

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverBorderColor: string;
  iconBgColor: string;
}

const PillarCard: React.FC<PillarCardProps> = ({ 
  icon, 
  title, 
  description, 
  hoverBorderColor, 
  iconBgColor 
}) => {
  return (
    <div className={`bg-[#1e1e24] p-6 rounded-2xl border-2 border-transparent ${hoverBorderColor} transition-all duration-300 ease-in-out transform hover:-translate-y-2 shadow-lg hover:shadow-2xl`}>
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

export default PillarCard;
