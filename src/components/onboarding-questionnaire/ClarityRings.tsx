"use client";
import type React from "react";
import { Target, TrendingUp, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarProgress {
  career: number;
  financials: number;
  health: number;
  connections: number;
}

interface ClarityRingsProps {
  progress: PillarProgress;
  threshold: number;
}

interface RingProps {
  progress: number;
  threshold: number;
  color: string;
  textColor: string;
  icon: React.ReactNode;
  label: string;
  size?: number;
}

function ClarityRing({
  progress,
  threshold,
  color,
  textColor,
  icon,
  label,
  size = 120,
}: RingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isAboveThreshold = progress >= threshold;

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              isAboveThreshold ? "bg-white/10" : "bg-white/5"
            )}
          >
            <div
              className={cn(
                "transition-colors",
                isAboveThreshold ? textColor : "text-gray-400"
              )}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h3
          className={cn(
            "font-semibold transition-colors",
            isAboveThreshold ? "text-white" : "text-gray-400"
          )}
        >
          {label}
        </h3>
        {isAboveThreshold && (
          <div className="text-xs text-emerald-400 font-medium mt-1">
            ✓ Clarity achieved
          </div>
        )}
      </div>
    </div>
  );
}

export function ClarityRings({ progress, threshold }: ClarityRingsProps) {
  const rings = [
    {
      key: "career",
      progress: progress.career,
      color: "#a855f7",
      textColor: "text-purple-400",
      icon: <Target className="w-6 h-6" />,
      label: "Career",
    },
    {
      key: "financials",
      progress: progress.financials,
      color: "#3b82f6",
      textColor: "text-blue-400",
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Financials",
    },
    {
      key: "health",
      progress: progress.health,
      color: "#22c55e",
      textColor: "text-green-400",
      icon: <Heart className="w-6 h-6" />,
      label: "Health",
    },
    {
      key: "connections",
      progress: progress.connections,
      color: "#f97316",
      textColor: "text-orange-400",
      icon: <Users className="w-6 h-6" />,
      label: "Connections",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
      {rings.map((ring) => (
        <ClarityRing
          key={ring.key}
          progress={ring.progress}
          threshold={threshold}
          color={ring.color}
          textColor={ring.textColor}
          icon={ring.icon}
          label={ring.label}
        />
      ))}
    </div>
  );
}

export default ClarityRings;
