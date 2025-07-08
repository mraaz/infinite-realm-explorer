
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full max-w-5xl mx-auto mb-6 md:mb-10">
      {categories.map((category) => {
        const categoryColor = categoryColors[category.name as keyof typeof categoryColors];
        const iconPath = categoryIconPaths[category.name as keyof typeof categoryIconPaths];
        const percentage = category.total > 0 ? (category.completed / category.total) * 100 : 0;
        const circumference = 2 * Math.PI * 35; // Smaller radius for mobile (35 instead of 50)
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
            <div className="relative w-20 h-20 md:w-32 md:h-32 mb-2 md:mb-4">
              {/* Background circle */}
              <svg className="w-20 h-20 md:w-32 md:h-32 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="6"
                  fill="none"
                  className="drop-shadow-sm"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke={`url(#gradient-${category.name})`}
                  strokeWidth="6"
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
                <div className={`${categoryColor.bg} p-2 md:p-3 rounded-full shadow-xl border-2 border-white/30`}>
                  <img src={iconPath} alt={category.name} className="w-5 h-5 md:w-8 md:h-8" />
                </div>
              </div>
            </div>
            
            {/* Category name and progress */}
            <div className="text-center">
              <h3 className={`font-bold text-sm md:text-lg ${categoryColor.text} mb-1 md:mb-2`}>{category.name}</h3>
              <p className="text-xs md:text-sm text-gray-400 font-medium">
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
