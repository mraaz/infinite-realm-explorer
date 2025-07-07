
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mx-auto mb-10">
      {categories.map((category) => {
        const categoryColor = categoryColors[category.name as keyof typeof categoryColors];
        const iconPath = categoryIconPaths[category.name as keyof typeof categoryIconPaths];
        const percentage = category.total > 0 ? (category.completed / category.total) * 100 : 0;
        const circumference = 2 * Math.PI * 50; // radius of 50 for larger circles
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        // Get gradient colors based on category
        const getGradientColors = (categoryName: string) => {
          switch (categoryName) {
            case 'Career':
              return { start: '#8B5CF6', end: '#EC4899' };
            case 'Finances':
              return { start: '#3B82F6', end: '#06B6D4' };
            case 'Health':
              return { start: '#10B981', end: '#14B8A6' };
            case 'Connections':
              return { start: '#F59E0B', end: '#F97316' };
            default:
              return { start: '#8B5CF6', end: '#EC4899' };
          }
        };

        const gradientColors = getGradientColors(category.name);

        return (
          <div key={category.name} className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {/* Background circle */}
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="8"
                  fill="none"
                  className="drop-shadow-sm"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={`url(#gradient-${category.name})`}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out drop-shadow-lg"
                />
                <defs>
                  <linearGradient id={`gradient-${category.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradientColors.start} />
                    <stop offset="100%" stopColor={gradientColors.end} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${categoryColor.bg} p-3 rounded-full shadow-xl border-2 border-white/30`}>
                  <img src={iconPath} alt={category.name} className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            {/* Category name and progress */}
            <div className="text-center">
              <h3 className={`font-bold text-lg ${categoryColor.text} mb-2`}>{category.name}</h3>
              <p className="text-sm text-gray-400 font-medium">
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
