import React from "react";

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
  confidenceLevel?: number; // Added optional confidenceLevel prop
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  insights,
  confidenceLevel,
}) => {
  console.log("[RadarChart] Rendering with data:", data);
  console.log("[RadarChart] Category positions being calculated...");

  const categories = ["Career", "Finances", "Health", "Connections"] as const;
  const svgSize = 400;
  const center = svgSize / 2;
  const chartRadius = 120;
  const labelRadius = 160;

  // Calculate positions for each category (starting from top, going clockwise)
  const getAngleRadians = (index: number) => {
    const degrees = index * 90 - 90; // Start at top (-90°), then go clockwise
    return (degrees * Math.PI) / 180;
  };

  // Convert polar to cartesian coordinates
  const polarToCartesian = (angle: number, radius: number) => {
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    console.log(
      `[RadarChart] Position calculated - angle: ${angle}, radius: ${radius}, x: ${x}, y: ${y}`
    );
    return { x, y };
  };

  // Generate data points for the polygon
  const dataPoints = categories.map((category, index) => {
    const value = data[category];
    const normalizedValue = Math.max(0, Math.min(100, value));
    const radius = (normalizedValue / 100) * chartRadius;
    const angle = getAngleRadians(index);
    return polarToCartesian(angle, radius);
  });

  // Generate label positions with validation
  const labelPositions = categories.map((category, index) => {
    const angle = getAngleRadians(index);
    const position = polarToCartesian(angle, labelRadius);
    const value = data[category];

    console.log(
      `[RadarChart] Label for ${category}: value=${value}, position=(${position.x}, ${position.y})`
    );

    return {
      category,
      value,
      x: position.x,
      y: position.y,
      angle,
    };
  });

  // Grid levels and axis lines
  const gridLevels = [20, 40, 60, 80, 100];
  const axisLines = categories.map((_, index) => {
    const angle = getAngleRadians(index);
    const endPoint = polarToCartesian(angle, chartRadius);
    return {
      x1: center,
      y1: center,
      x2: endPoint.x,
      y2: endPoint.y,
    };
  });

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {" "}
      {/* Added relative for absolute positioning of confidence */}
      {confidenceLevel !== undefined && ( // Conditionally render if confidenceLevel is provided
        <div className="absolute top-0 right-0 text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Confidence level: {Math.round(confidenceLevel)}%
        </div>
      )}
      <div className="w-full flex justify-center mb-2">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full h-auto max-w-md md:max-w-lg"
        >
          {/* Gradients */}
          <defs>
            <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.1)" />
              <stop offset="100%" stopColor="rgba(147, 51, 234, 0.03)" />
            </radialGradient>
            <linearGradient
              id="dataGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.8)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
              <stop offset="100%" stopColor="rgba(196, 181, 253, 0.4)" />
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
              key={`grid-${level}`}
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
              key={`axis-${index}`}
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
            points={dataPoints
              .map((point) => `${point.x},${point.y}`)
              .join(" ")}
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
          <circle cx={center} cy={center} r="3" fill="rgb(147, 51, 234)" />

          {/* Category labels and scores */}
          {labelPositions.map((label) => (
            <g key={`label-group-${label.category}`}>
              {/* Category name with reduced font size */}
              <text
                x={label.x}
                y={label.y - 15}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="12"
                fontWeight="600"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                }}
              >
                {label.category}
              </text>

              {/* Score number */}
              <text
                x={label.x}
                y={label.y + 15}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgb(168, 85, 247)"
                fontSize="24"
                fontWeight="bold"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                }}
              >
                {label.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {/* AI Insights */}
      {insights && (
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700"
            >
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
