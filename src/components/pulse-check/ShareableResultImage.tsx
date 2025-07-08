import React, { forwardRef } from 'react';

interface ShareableResultImageProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const ShareableResultImage = forwardRef<HTMLDivElement, ShareableResultImageProps>(
  ({ data }, ref) => {
    const categories = ['Career', 'Finances', 'Health', 'Connections'] as const;
    const size = 320;
    const center = size / 2;
    const maxRadius = 120;
    const labelOffset = 40;
    
    // Calculate angles for each category (starting from top, going clockwise)
    const getAngle = (index: number) => {
      return (index * 90 - 90) * (Math.PI / 180);
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
    
    // Generate labels positions
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

    const svgSize = size + (labelOffset * 2) + 40;

    return (
      <div
        ref={ref}
        className="w-[600px] h-[800px] bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 p-8 text-white"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Life Path Pulse Check</h1>
          <p className="text-lg opacity-90 leading-relaxed px-4">
            Share your insights from your pulse check across the four key areas of your life with a friend for their feedback. 
            See their pulse check result and compare with your own.
          </p>
        </div>

        {/* Chart Container */}
        <div className="flex justify-center mb-8">
          <svg 
            width={svgSize} 
            height={svgSize} 
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="w-80 h-80"
          >
            <defs>
              <radialGradient id="shareBackgroundGradient" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.2)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.05)" />
              </radialGradient>
              <linearGradient id="shareDataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.9)" />
                <stop offset="50%" stopColor="rgba(168, 85, 247, 0.7)" />
                <stop offset="100%" stopColor="rgba(196, 181, 253, 0.5)" />
              </linearGradient>
              <linearGradient id="shareScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                fill="url(#shareBackgroundGradient)"
                stroke="rgba(147, 51, 234, 0.3)"
                strokeWidth="2"
              />
              
              {/* Grid circles */}
              {gridLevels.map((level, index) => (
                <circle
                  key={level}
                  cx={center}
                  cy={center}
                  r={(level / 100) * maxRadius}
                  fill="none"
                  stroke="rgba(147, 51, 234, 0.2)"
                  strokeWidth="1"
                  strokeDasharray={index === gridLevels.length - 1 ? "none" : "3,3"}
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
                  stroke="rgba(147, 51, 234, 0.4)"
                  strokeWidth="2"
                />
              ))}
              
              {/* Data polygon */}
              <polygon
                points={dataPoints.map(point => `${point.x},${point.y}`).join(' ')}
                fill="url(#shareDataGradient)"
                stroke="rgb(147, 51, 234)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {dataPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="rgb(147, 51, 234)"
                  stroke="white"
                  strokeWidth="3"
                />
              ))}
              
              {/* Category labels and scores */}
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
                      y={label.y - 10}
                      textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
                      className="font-bold"
                      style={{ 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fill: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                      }}
                    >
                      {label.category}
                    </text>
                    {/* Score */}
                    <text
                      x={label.x}
                      y={label.y + 8}
                      textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
                      className="font-bold"
                      style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        fill: 'url(#shareScoreGradient)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
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
                r="4"
                fill="rgb(147, 51, 234)"
              />
            </g>
          </svg>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="text-sm opacity-80 mb-2">infinitegame.life</div>
          <div className="text-xs opacity-60">Take your own pulse check and discover your life path</div>
        </div>
      </div>
    );
  }
);

ShareableResultImage.displayName = 'ShareableResultImage';

export default ShareableResultImage;