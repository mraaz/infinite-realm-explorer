
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
  const categories = ['Career', 'Finances', 'Health', 'Connections'] as const;
  const size = 400; // Increased base size
  const center = size / 2;
  const maxRadius = 140; // Increased radius
  const labelOffset = 50; // Increased label offset
  
  // Calculate angles for each category (starting from top, going clockwise)
  const getAngle = (index: number) => {
    return (index * 90 - 90) * (Math.PI / 180); // Start from top (-90 degrees)
  };
  
  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };
  
  // Generate points for the data polygon
  const dataPoints = categories.map((category, index) => {
    const value = data[category];
    const radius = (value / 100) * maxRadius;
    const angle = getAngle(index);
    return polarToCartesian(angle, radius);
  });
  
  // Generate grid circles
  const gridLevels = [20, 40, 60, 80, 100];
  
  // Generate axis lines
  const axisLines = categories.map((_, index) => {
    const angle = getAngle(index);
    const endPoint = polarToCartesian(angle, maxRadius);
    return {
      x1: center,
      y1: center,
      x2: endPoint.x,
      y2: endPoint.y
    };
  });
  
  // Generate labels positions with better spacing
  const labelPositions = categories.map((category, index) => {
    const angle = getAngle(index);
    const labelRadius = maxRadius + labelOffset;
    const position = polarToCartesian(angle, labelRadius);
    return {
      category,
      x: position.x,
      y: position.y,
      value: data[category]
    };
  });

  const svgSize = size + (labelOffset * 2) + 40; // Extra padding for labels

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="w-full flex justify-center">
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full h-auto max-w-lg md:max-w-2xl"
        >
          {/* Background gradient */}
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
          
          <g transform={`translate(${labelOffset + 20}, ${labelOffset + 20})`}>
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
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
                r={(level / 100) * maxRadius}
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
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(147, 51, 234)"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            
            {/* Category labels and scores with better positioning */}
            {labelPositions.map((label, index) => {
              const isTop = index === 0;
              const isBottom = index === 2;
              const isLeft = index === 3;
              const isRight = index === 1;
              
              return (
                <g key={label.category}>
                  {/* Category name */}
                  <text
                    x={label.x}
                    y={label.y - 15}
                    textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
                    className="text-base font-bold fill-white"
                    style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                    }}
                  >
                    {label.category}
                  </text>
                  {/* Score */}
                  <text
                    x={label.x}
                    y={label.y + 5}
                    textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
                    className="text-xl font-bold"
                    style={{ 
                      fontSize: '20px',
                      fontWeight: 'bold',
                      fill: 'url(#scoreGradient)',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                    }}
                  >
                    {label.value}
                  </text>
                </g>
              );
            })}
            
            {/* Center point */}
            <circle
              cx={center}
              cy={center}
              r="3"
              fill="rgb(147, 51, 234)"
            />
          </g>
        </svg>
      </div>
      
      {/* Insights */}
      {insights && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <h4 className="font-semibold text-card-foreground">{category}</h4>
                <span className="ml-auto text-2xl font-bold text-primary">{data[category]}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
