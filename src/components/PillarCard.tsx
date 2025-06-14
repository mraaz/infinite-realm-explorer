
import React from 'react';
import { LucideProps } from 'lucide-react';

interface PillarCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
  borderColorClass: string;
  iconColorClass: string;
}

const PillarCard: React.FC<PillarCardProps> = ({ icon: Icon, title, description, borderColorClass, iconColorClass }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg border-t-4 ${borderColorClass} flex flex-col items-center text-center transition-transform hover:scale-105`}>
      <div className={`p-3 rounded-full bg-opacity-10 mb-4 ${iconColorClass.replace('text-', 'bg-').replace('600', '100')}`}>
        <Icon className={`h-8 w-8 ${iconColorClass}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default PillarCard;
