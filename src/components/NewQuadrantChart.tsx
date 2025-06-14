import { useEffect, useState, useRef, memo } from "react"
import type React from "react"

import { Target, Heart, Users, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export interface PillarProgress {
  basics: number
  career: number
  financials: number
  health: number
  connections: number
}

interface QuadrantData {
  key: string
  name: string
  score: number
  color: string
  hoverColor: string
  icon: React.ReactNode
  startAngle: number
  endAngle: number
  textPosition: { x: number; y: number }
  iconPosition: { x: number; y: number }
  description: string
}

export interface NewQuadrantChartProps {
  progress: PillarProgress
  answers: Record<string, any>
  onPillarClick?: (pillar: string) => void
  activePillar?: string
  isFuture?: boolean
  className?: string
}

// Memoized component to prevent unnecessary re-renders
export const NewQuadrantChart = memo(function NewQuadrantChart({
  progress,
  answers,
  onPillarClick,
  activePillar,
  isFuture = false,
  className,
}: NewQuadrantChartProps) {
  // State for animations and hover effects
  const [animatedProgress, setAnimatedProgress] = useState<PillarProgress>({
    basics: 0,
    career: 0,
    financials: 0,
    health: 0,
    connections: 0,
  })
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)
  const isMobile = useIsMobile()

  // Calculate size based on viewport
  const baseSize = 400
  const size = isMobile ? 320 : baseSize
  const center = size / 2
  const radius = size * 0.4
  const innerRadius = radius * 0.375

  // Calculate overall score
  const overallScore = Math.round((progress.career + progress.financials + progress.health + progress.connections) / 4)
  const [animatedOverallScore, setAnimatedOverallScore] = useState(0)

  // Animate progress changes
  useEffect(() => {
    const duration = 1000 // Animation duration in ms
    const steps = 20 // Number of animation steps
    const stepDuration = duration / steps
    let currentStep = 0

    // Calculate step size for each pillar
    const stepSizes = {
      basics: (progress.basics - animatedProgress.basics) / steps,
      career: (progress.career - animatedProgress.career) / steps,
      financials: (progress.financials - animatedProgress.financials) / steps,
      health: (progress.health - animatedProgress.health) / steps,
      connections: (progress.connections - animatedProgress.connections) / steps,
    }

    // Calculate step size for overall score
    const overallStepSize = (overallScore - animatedOverallScore) / steps

    // Animation interval
    const interval = setInterval(() => {
      currentStep++

      if (currentStep >= steps) {
        // Final step - set exact values
        setAnimatedProgress({ ...progress })
        setAnimatedOverallScore(overallScore)
        clearInterval(interval)
      } else {
        // Intermediate step - calculate interpolated values
        setAnimatedProgress((prev) => ({
          basics: prev.basics + stepSizes.basics,
          career: prev.career + stepSizes.career,
          financials: prev.financials + stepSizes.financials,
          health: prev.health + stepSizes.health,
          connections: prev.connections + stepSizes.connections,
        }))
        setAnimatedOverallScore((prev) => prev + overallStepSize)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [progress, overallScore])

  // Define quadrants with all necessary data
  const getQuadrants = (): QuadrantData[] => {
    const scores = isFuture ? { career: 0, financials: 0, health: 0, connections: 0 } : animatedProgress

    return [
      {
        key: "career",
        name: "Career",
        score: Math.round(scores.career),
        color: "#9333ea", // Purple
        hoverColor: "#a855f7", // Lighter purple
        icon: <Target className="w-6 h-6" />,
        startAngle: 270,
        endAngle: 360,
        textPosition: { x: center + center * 0.45, y: center - center * 0.45 },
        iconPosition: { x: center + center * 0.7, y: center - center * 0.7 },
        description: "Your professional growth and goals",
      },
      {
        key: "financials",
        name: "Finances",
        score: Math.round(scores.financials),
        color: "#2563eb", // Blue
        hoverColor: "#3b82f6", // Lighter blue
        icon: <PiggyBank className="w-6 h-6" />,
        startAngle: 0,
        endAngle: 90,
        textPosition: { x: center + center * 0.45, y: center + center * 0.45 },
        iconPosition: { x: center + center * 0.7, y: center + center * 0.7 },
        description: "Your financial security and wealth",
      },
      {
        key: "health",
        name: "Health",
        score: Math.round(scores.health),
        color: "#16a34a", // Green
        hoverColor: "#22c55e", // Lighter green
        icon: <Heart className="w-6 h-6" />,
        startAngle: 90,
        endAngle: 180,
        textPosition: { x: center - center * 0.45, y: center + center * 0.45 },
        iconPosition: { x: center - center * 0.7, y: center + center * 0.7 },
        description: "Your physical and mental wellbeing",
      },
      {
        key: "connections",
        name: "Connections",
        score: Math.round(scores.connections),
        color: "#ea580c", // Orange
        hoverColor: "#f97316", // Lighter orange
        icon: <Users className="w-6 h-6" />,
        startAngle: 180,
        endAngle: 270,
        textPosition: { x: center - center * 0.45, y: center - center * 0.45 },
        iconPosition: { x: center - center * 0.7, y: center - center * 0.7 },
        description: "Your relationships and community",
      },
    ]
  }

  const quadrants = getQuadrants()

  // Helper function to create SVG path for a quadrant
  const createQuadrantPath = (quadrant: QuadrantData) => {
    const startAngleRad = (quadrant.startAngle * Math.PI) / 180
    const endAngleRad = (quadrant.endAngle * Math.PI) / 180

    // Calculate the radius based on the score
    const scoreRadius = innerRadius + ((radius - innerRadius) * quadrant.score) / 100

    // Calculate points for the path
    const x1 = center + innerRadius * Math.cos(startAngleRad)
    const y1 = center + innerRadius * Math.sin(startAngleRad)
    const x2 = center + scoreRadius * Math.cos(startAngleRad)
    const y2 = center + scoreRadius * Math.sin(startAngleRad)

    // Create the arc
    const largeArcFlag = quadrant.endAngle - quadrant.startAngle > 180 ? 1 : 0
    const xEnd = center + scoreRadius * Math.cos(endAngleRad)
    const yEnd = center + scoreRadius * Math.sin(endAngleRad)
    const x4 = center + innerRadius * Math.cos(endAngleRad)
    const y4 = center + innerRadius * Math.sin(endAngleRad)

    // Use SVG arc command
    return `
    M ${x1} ${y1}
    L ${x2} ${y2}
    A ${scoreRadius} ${scoreRadius} 0 ${largeArcFlag} 1 ${xEnd} ${yEnd}
    L ${x4} ${y4}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
    Z
  `
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, quadrant: QuadrantData) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      !isFuture && onPillarClick?.(quadrant.key)
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" role="group" aria-label="Life pillars quadrant chart">
        <svg
          ref={chartRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={cn("drop-shadow-lg transition-opacity duration-300", isFuture ? "opacity-50" : "")}
          aria-hidden="true"
        >
          {quadrants.map((quadrant) => (
            <title
              key={quadrant.key}
            >{`${quadrant.name} (${quadrant.score >= 50 ? "Creative" : "Reactive"}): ${quadrant.score}`}</title>
          ))}
          {/* Background circle */}
          <circle cx={center} cy={center} r={radius} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

          {/* Quadrant dividing lines */}
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#e2e8f0" strokeWidth="2" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#e2e8f0" strokeWidth="2" />

          {/* Circular guides */}
          {[25, 50, 75, 100].map((percent) => {
            const guideRadius = innerRadius + ((radius - innerRadius) * percent) / 100
            return (
              <g key={percent}>
                <circle
                  cx={center}
                  cy={center}
                  r={guideRadius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={center} y={center - guideRadius - 5} textAnchor="middle" className="text-xs fill-gray-400">
                  {percent}
                </text>
              </g>
            )
          })}

          {/* Render each quadrant */}
          {quadrants.map((quadrant) => (
            <g key={quadrant.key}>
              <path
                d={createQuadrantPath(quadrant)}
                fill={
                  hoveredPillar === quadrant.key || activePillar === quadrant.key ? quadrant.hoverColor : quadrant.color
                }
                fillOpacity={quadrant.score >= 50 ? 0.8 : 0.4} // Creative (>=50) gets more vibrant color, Reactive (<50) gets lighter shade
                stroke="white"
                strokeWidth="3"
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  activePillar === quadrant.key ? "opacity-100 filter drop-shadow-lg" : "opacity-90 hover:opacity-100",
                )}
                onClick={() => !isFuture && onPillarClick?.(quadrant.key)}
                onMouseEnter={() => setHoveredPillar(quadrant.key)}
                onMouseLeave={() => setHoveredPillar(null)}
              />

              {/* Score text */}
              <text
                x={quadrant.textPosition.x}
                y={quadrant.textPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-gray-900"
              >
                {quadrant.score}
              </text>

              {/* Pillar name */}
              <text
                x={quadrant.textPosition.x}
                y={quadrant.textPosition.y + 25}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-medium ${isFuture ? "fill-gray-400" : "fill-gray-700"}`}
              >
                {quadrant.name}
              </text>
            </g>
          ))}

          {/* Center circle with overall score */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 5}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="3"
            className="drop-shadow-md"
          />

          {/* Overall score text */}
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-4xl font-bold ${isFuture ? "fill-gray-400" : "fill-gray-900"}`}
          >
            {isFuture ? "?" : Math.round(animatedOverallScore)}
          </text>
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-medium ${isFuture ? "fill-gray-400" : "fill-gray-600"}`}
          >
            Overall Score
          </text>
        </svg>

        {/* Icons - positioned absolutely over the SVG */}
        {quadrants.map((quadrant) => (
          <div
            key={quadrant.key}
            className={cn(
              "absolute w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-300",
              isFuture ? "opacity-50" : "",
              (hoveredPillar === quadrant.key || activePillar === quadrant.key) && "scale-125 shadow-lg",
            )}
            style={{
              left: quadrant.iconPosition.x - 15,
              top: quadrant.iconPosition.y - 15,
            }}
            onClick={() => !isFuture && onPillarClick?.(quadrant.key)}
            onMouseEnter={() => setHoveredPillar(quadrant.key)}
            onMouseLeave={() => setHoveredPillar(null)}
            role="button"
            tabIndex={isFuture ? -1 : 0}
            aria-label={`${quadrant.name}: ${quadrant.score}%. ${quadrant.description}`}
            aria-pressed={activePillar === quadrant.key}
            onKeyDown={(e) => handleKeyDown(e, quadrant)}
          >
            <div
              style={{
                color: isFuture
                  ? "#9ca3af"
                  : hoveredPillar === quadrant.key || activePillar === quadrant.key
                    ? quadrant.hoverColor
                    : quadrant.color,
              }}
            >
              {quadrant.icon}
            </div>
          </div>
        ))}

        {/* Screen reader only description */}
        <div className="sr-only">
          <p>Quadrant chart showing your life pillars:</p>
          <ul>
            {quadrants.map((q) => (
              <li key={q.key}>
                {q.name}: {q.score}%
              </li>
            ))}
            <li>Overall score: {Math.round(animatedOverallScore)}%</li>
          </ul>
        </div>
      </div>
    </div>
  )
})
