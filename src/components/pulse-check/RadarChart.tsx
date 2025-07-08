
import React from 'react';

interface RadarChartProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
  insights?: {
    Career: string;
    Finances: string;
    Health: string;
    Connections: string;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ data, insights }) => {
  console.log('[RadarChart] Rendering with data:', data);
  
  const categories = ['Career', 'Finances', 'Health', 'Connections'] as const;
  
  // SVG dimensions and layout
  const svgSize = 600;
  const center = svgSize / 2;
  const chartRadius = 140;
  const labelRadius = 180;
  
  // Calculate positions for each category (starting from top, going clockwise)
  const getAngleRadians = (index: number) => {
    // Start from top (-90 degrees) and go clockwise
    const degrees = (index * 90) - 90;
    return (degrees * Math.PI) / 180;
  };
  
  // Convert polar to cartesian coordinates
  const polarToCartesian = (angle: number, radius: number) => {
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };
  
  // Generate data points for the polygon
  const dataPoints = categories.map((category, index) => {
    const value = data[category];
    const normalizedValue = Math.max(0, Math.min(100, value)); // Ensure 0-100 range
    const radius = (normalizedValue / 100) * chartRadius;
    const angle = getAngleRadians(index);
    const point = polarToCartesian(angle, radius);
    
    console.log(`[RadarChart] ${category}: value=${value}, radius=${radius}, angle=${angle}, point=`, point);
    
    return point;
  });
  
  // Generate label positions
  const labelPositions = categories.map((category, index) => {
    const angle = getAngleRadians(index);
    const position = polarToCartesian(angle, labelRadius);
    const value = data[category];
    
    console.log(`[RadarChart] Label ${category}: angle=${angle}, position=`, position, `value=${value}`);
    
    return {
      category,
      value,
      x: position.x,
      y: position.y,
      angle
    };
  });
  
  // Grid levels
  const gridLevels = [20, 40, 60, 80, 100];
  
  // Axis lines from center to edge
  const axisLines = categories.map((_, index) => {
    const angle = getAngleRadians(index);
    const endPoint = polarToCartesian(angle, chartRadius);
    return {
      x1: center,
      y1: center,
      x2: endPoint.x,
      y2: endPoint.y
    };
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="w-full flex justify-center">
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full h-auto max-w-lg md:max-w-2xl"
          style={{ background: 'transparent' }}
        >
          {/* Gradients and definitions */}
          <defs>
            <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.1)" />
              <stop offset="100%" stopColor="rgba(147, 51, 234, 0.03)" />
            </radialGradient>
            <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.8)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
              <stop offset="100%" stopColor="rgba(196, 181, 253, 0.4)" />
            </linearGradient>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" />
              <stop offset="100%" stopColor="rgb(236, 72, 153)" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={chartRadius}
            fill="url(#backgroundGradient)"
            stroke="rgba(147, 51, 234, 0.2)"
            strokeWidth="1"
          />
          
          {/* Grid circles */}
          {gridLevels.map((level, index) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 100) * chartRadius}
              fill="none"
              stroke="rgba(147, 51, 234, 0.15)"
              strokeWidth="1"
              strokeDasharray={index === gridLevels.length - 1 ? "none" : "2,2"}
            />
          ))}
          
          {/* Axis lines */}
          {axisLines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(147, 51, 234, 0.3)"
              strokeWidth="1"
            />
          ))}
          
          {/* Data polygon */}
          <polygon
            points={dataPoints.map(point => `${point.x},${point.y}`).join(' ')}
            fill="url(#dataGradient)"
            stroke="rgb(147, 51, 234)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={`data-point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(147, 51, 234)"
              stroke="white"
              strokeWidth="2"
            />
          ))}
          
          {/* Center point */}
          <circle
            cx={center}
            cy={center}
            r="3"
            fill="rgb(147, 51, 234)"
          />
          
          {/* Category labels */}
          {labelPositions.map((label) => (
            <text
              key={`label-${label.category}`}
              x={label.x}
              y={label.y - 25}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="16"
              fontWeight="bold"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                userSelect: 'none'
              }}
            >
              {label.category}
            </text>
          ))}
          
          {/* Score numbers - these should always be visible */}
          {labelPositions.map((label) => (
            <text
              key={`score-${label.category}`}
              x={label.x}
              y={label.y + 25}
              textAnchor="middle"
              dominantBaseline="central"
              fill="url(#scoreGradient)"
              fontSize="28"
              fontWeight="bold"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                userSelect: 'none'
              }}
            >
              {label.value}
            </text>
          ))}
          
          {/* Debug markers to verify positions */}
          {process.env.NODE_ENV === 'development' && labelPositions.map((label) => (
            <g key={`debug-${label.category}`}>
              <circle cx={label.x} cy={label.y} r="2" fill="red" opacity="0.5" />
              <circle cx={label.x} cy={label.y - 25} r="1" fill="blue" opacity="0.5" />
              <circle cx={label.x} cy={label.y + 25} r="1" fill="green" opacity="0.5" />
            </g>
          ))}
        </svg>
      </div>
      
      {/* AI Insights */}
      {insights && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                <h4 className="font-semibold text-white">{category}</h4>
                <span className="ml-auto text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {data[category]}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {insights[category]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RadarChart;
