
import React from 'react';
import { categoryColors, categoryIconPaths } from '@/data/pulseCheckCards';

interface CategoryProgressProps {
  categories: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
}

const CategoryProgress: React.FC<CategoryProgressProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mb-8">
      {categories.map((category) => {
        const categoryColor = categoryColors[category.name as keyof typeof categoryColors];
        const iconPath = categoryIconPaths[category.name as keyof typeof categoryIconPaths];
        const percentage = category.total > 0 ? (category.completed / category.total) * 100 : 0;
        const circumference = 2 * Math.PI * 45; // radius of 45
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
          <div key={category.name} className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              {/* Background circle */}
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="8"
                  fill="none"
                  className="drop-shadow-sm"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient-" + category.name + ")"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out drop-shadow-lg"
                />
                <defs>
                  <linearGradient id={`gradient-${category.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={categoryColor.text.replace('text-', '').includes('purple') ? '#8B5CF6' : 
                                                   categoryColor.text.replace('text-', '').includes('blue') ? '#3B82F6' :
                                                   categoryColor.text.replace('text-', '').includes('emerald') ? '#10B981' : '#F59E0B'} />
                    <stop offset="100%" stopColor={categoryColor.text.replace('text-', '').includes('purple') ? '#EC4899' : 
                                                   categoryColor.text.replace('text-', '').includes('blue') ? '#06B6D4' :
                                                   categoryColor.text.replace('text-', '').includes('emerald') ? '#14B8A6' : '#F97316'} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${categoryColor.bg} p-2 rounded-full shadow-lg border border-white/20`}>
                  <img src={iconPath} alt={category.name} className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            {/* Category name and progress */}
            <div className="text-center">
              <h3 className={`font-bold text-sm ${categoryColor.text} mb-1`}>{category.name}</h3>
              <p className="text-xs text-gray-400">
                {category.completed}/{category.total}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryProgress;
