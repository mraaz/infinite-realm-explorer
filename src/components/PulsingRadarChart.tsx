import { useEffect, useState, useMemo, memo } from "react";
import type React from "react";
import { cn } from "@/lib/utils"; // Assuming you have a `cn` utility for classnames

// --- Prop and Data Type Definitions ---

// This interface should match the one used in your project.
// Note: The 'basics' property is not used in this visualization.
export interface PillarProgress {
  basics?: number;
  career: number;
  finances: number;
  health: number;
  connections: number;
}

export interface PulsingRadarChartProps {
  progress: PillarProgress;
  onPillarClick?: (pillar: string) => void;
  activePillar?: string;
  className?: string;
  title: string;
}

// Configuration for each pillar's static properties
const pillarConfig = {
  career: { angle: -90, name: "Career", color: "#a855f7" },
  finances: { angle: 0, name: "Finances", color: "#2563eb" },
  health: { angle: 90, name: "Health", color: "#16a34a" },
  connections: { angle: 180, name: "Connections", color: "#ea580c" },
};

// --- Main Component ---

export const PulsingRadarChart = memo(function PulsingRadarChart({
  progress,
  onPillarClick,
  activePillar,
  className,
  title,
}: PulsingRadarChartProps) {
  // Animate the scores from 0 to their final value on initial render
  const [animatedScores, setAnimatedScores] = useState({
    career: 0,
    finances: 0,
    health: 0,
    connections: 0,
  });

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameRate = 60; // 60fps
    const totalFrames = animationDuration / (1000 / frameRate);
    let currentFrame = 0;

    const initialScores = { ...animatedScores };
    const finalScores = {
      career: progress.career || 0,
      finances: progress.finances || 0,
      health: progress.health || 0,
      connections: progress.connections || 0,
    };

    const interval = setInterval(() => {
      currentFrame++;
      const progressFraction = currentFrame / totalFrames;

      if (currentFrame >= totalFrames) {
        setAnimatedScores(finalScores);
        clearInterval(interval);
      } else {
        const newScores = {
          career:
            initialScores.career +
            (finalScores.career - initialScores.career) * progressFraction,
          finances:
            initialScores.finances +
            (finalScores.finances - initialScores.finances) * progressFraction,
          health:
            initialScores.health +
            (finalScores.health - initialScores.health) * progressFraction,
          connections:
            initialScores.connections +
            (finalScores.connections - initialScores.connections) *
              progressFraction,
        };
        setAnimatedScores(newScores);
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // --- SVG Calculation and Rendering ---

  const svgSize = 400;
  const center = svgSize / 2;
  const maxRadius = svgSize / 2 - 60; // Leave space for labels

  // Memoize point calculations to prevent re-running on every render
  const chartData = useMemo(() => {
    return (Object.keys(pillarConfig) as Array<keyof typeof pillarConfig>).map(
      (key) => {
        const config = pillarConfig[key];
        const score = animatedScores[key];
        const radius = maxRadius * (score / 100);
        const angleRad = (config.angle * Math.PI) / 180;

        // Coordinates for the data point on the chart
        const pointCoords = {
          x: center + radius * Math.cos(angleRad),
          y: center + radius * Math.sin(angleRad),
        };

        // Coordinates for the labels outside the chart
        const labelRadius = maxRadius + 35;
        const labelAngleRad = (config.angle * Math.PI) / 180;
        const labelCoords = {
          x: center + labelRadius * Math.cos(labelAngleRad),
          y: center + labelRadius * Math.sin(labelAngleRad),
        };

        return {
          id: key,
          score: Math.round(progress[key] || 0), // Display final score, not animated one
          ...config,
          pointCoords,
          labelCoords,
        };
      }
    );
  }, [animatedScores, progress, maxRadius, center]);

  const shapePoints = useMemo(() => {
    return chartData
      .map((p) => `${p.pointCoords.x},${p.pointCoords.y}`)
      .join(" ");
  }, [chartData]);

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-[#18181B] p-4 sm:p-6 rounded-lg border border-[#333]",
        className
      )}
    >
      {/* We add the key to the style tag to force a re-render in some environments if it doesn't pick up changes */}
      <style key="pulsing-chart-styles">{`
            .data-point-dot {
                stroke-width: 3;
                fill: white;
                transition: r 0.3s ease;
            }
            .data-point-pulse {
                stroke-width: 8; 
                fill: none;
                transform-origin: center;
                animation: subtle-glow-animation 3s infinite ease-in-out;
                filter: blur(4px); 
            }
            @keyframes subtle-glow-animation {
                0% { opacity: 0; }
                50% { opacity: 0.6; }
                100% { opacity: 0; }
            }
        `}</style>

      <h2 className="text-xl font-bold text-white mb-6">{title}</h2>

      <div
        className="relative w-full max-w-[400px]"
        style={{ aspectRatio: "1 / 1" }}
      >
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          overflow="visible"
        >
          {/* 1. Grid and Axis Lines */}
          <g key="grid-and-axis">
            {/* Grid Circles */}
            {[1, 2, 3, 4].map((i) => (
              <circle
                key={`grid-circle-${i}`}
                cx={center}
                cy={center}
                r={(maxRadius / 4) * i}
                className="stroke-[#3a3a40] stroke-1 fill-none"
              />
            ))}
            {/* Axis Lines */}
            <line
              x1={center}
              y1={center - maxRadius}
              x2={center}
              y2={center + maxRadius}
              className="stroke-[#3a3a40] stroke-1"
            />
            <line
              x1={center - maxRadius}
              y1={center}
              x2={center + maxRadius}
              y2={center}
              className="stroke-[#3a3a40] stroke-1"
            />
          </g>

          {/* 2. Solid Data Shape */}
          <polygon
            key="data-shape"
            points={shapePoints}
            className="fill-[#111] opacity-80"
          />

          {/* 3. Data Points and Labels */}
          {chartData.map(
            ({ id, score, name, color, pointCoords, labelCoords }) => (
              <g key={id}>
                {/* Clickable Group for each data point */}
                <g
                  className="cursor-pointer"
                  onClick={() => onPillarClick?.(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onPillarClick?.(id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${name}: ${score}`}
                >
                  <circle
                    cx={pointCoords.x}
                    cy={pointCoords.y}
                    r={9}
                    className="data-point-pulse"
                    style={{ stroke: color }}
                  />
                  <circle
                    cx={pointCoords.x}
                    cy={pointCoords.y}
                    r={activePillar === id ? 8 : 6} // Make active pillar's dot larger
                    className="data-point-dot"
                    style={{ stroke: color }}
                  />
                </g>

                {/* Labels */}
                <g className="text-center pointer-events-none">
                  <text
                    x={labelCoords.x}
                    y={labelCoords.y - 5}
                    className="fill-white text-[28px] font-bold"
                    textAnchor="middle"
                  >
                    {score}
                  </text>
                  <text
                    x={labelCoords.x}
                    y={labelCoords.y + 15}
                    className="fill-[#aaa] text-sm font-medium"
                    textAnchor="middle"
                  >
                    {name}
                  </text>
                </g>
              </g>
            )
          )}
        </svg>
      </div>
    </div>
  );
});

export default PulsingRadarChart;
