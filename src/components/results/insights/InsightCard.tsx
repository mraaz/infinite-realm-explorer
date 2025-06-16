
import React from 'react';
import { Insight } from '@/types/insights';
import { getInsightColor } from '@/utils/colorTheme';
import { getIcon } from '@/utils/iconMapper';

interface InsightCardProps {
  insight: Insight;
  isFlipped: boolean;
  onClick: () => void;
  showPeekAnimation?: boolean;
}

const InsightCard = ({ insight, isFlipped, onClick, showPeekAnimation = false }: InsightCardProps) => {
  const Icon = getIcon(insight.icon);
  const colorTheme = getInsightColor(insight.color);

  return (
    <div 
      className="flip-card cursor-pointer h-48"
      onClick={onClick}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''} ${showPeekAnimation ? 'animate-peek' : ''}`}>
        {/* Front of card */}
        <div className="flip-card-front bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
          <h3 className="font-bold text-gray-800 mb-2 text-lg flex items-center">
            <Icon className={`mr-2 h-5 w-5 ${colorTheme.stroke}`} aria-hidden="true" />
            <span>Observation: {insight.title}</span>
          </h3>
          <p className="text-gray-600 mb-4">{insight.description}</p>
        </div>
        
        {/* Back of card */}
        <div className="flip-card-back bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-purple-200/80">
          <h3 className="font-bold text-purple-800 mb-3 text-lg flex items-center">
            <Icon className="mr-2 h-5 w-5 text-purple-600" aria-hidden="true" />
            <span>{insight.backContent.title}</span>
          </h3>
          <p className="text-purple-700 text-sm leading-relaxed mb-4">{insight.backContent.content}</p>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
