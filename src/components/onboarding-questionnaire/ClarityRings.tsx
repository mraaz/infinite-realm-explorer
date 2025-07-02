
"use client";
import type React from "react";
import { Target, TrendingUp, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileRings } from "@/hooks/use-mobile-rings";

interface PillarProgress {
  career: number;
  finances: number;
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
            "font-semibold transition-colors text-sm md:text-base",
            isAboveThreshold ? "text-white" : "text-gray-400"
          )}
        >
          {label}
        </h3>
      </div>
    </div>
  );
}

function CompactProgressBar({ progress, onClick }: { progress: PillarProgress; onClick: () => void }) {
  const rings = [
    { key: "career", progress: progress.career, color: "#a855f7", label: "Career" },
    { key: "finances", progress: progress.finances, color: "#3b82f6", label: "Financials" },
    { key: "health", progress: progress.health, color: "#22c55e", label: "Health" },
    { key: "connections", progress: progress.connections, color: "#f97316", label: "Connections" },
  ];

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between space-x-2 bg-gray-900/50 rounded-lg p-3 cursor-pointer hover:bg-gray-900/70 transition-colors"
    >
      {rings.map((ring, index) => (
        <div key={ring.key} className="flex-1">
          <div className="flex items-center justify-center mb-1">
            <span className="text-xs text-gray-400 truncate">{ring.label}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${ring.progress}%`,
                backgroundColor: ring.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClarityRings({ progress, threshold }: ClarityRingsProps) {
  const { isMobile, isExpanded, toggleExpanded, shouldShowRings } = useMobileRings();

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
      key: "finances",
      progress: progress.finances,
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
    <div className="w-full">
      {/* Mobile Compact Progress Bar */}
      {isMobile && (
        <div className="mb-4">
          {!isExpanded && (
            <CompactProgressBar progress={progress} onClick={toggleExpanded} />
          )}
        </div>
      )}

      {/* Rings Display */}
      <div
        className={cn(
          "transition-all duration-300 ease-out overflow-hidden",
          shouldShowRings ? "opacity-100 max-h-none" : "opacity-0 max-h-0"
        )}
        onClick={isMobile && isExpanded ? toggleExpanded : undefined}
        style={{
          cursor: isMobile && isExpanded ? 'pointer' : 'default'
        }}
      >
        <div 
          className={cn(
            "grid gap-6 justify-items-center",
            isMobile ? "grid-cols-2 gap-4" : "grid-cols-2 md:grid-cols-4 gap-8",
            isMobile && isExpanded && "hover:bg-gray-900/20 rounded-lg p-2 transition-colors"
          )}
        >
          {rings.map((ring) => (
            <ClarityRing
              key={ring.key}
              progress={ring.progress}
              threshold={threshold}
              color={ring.color}
              textColor={ring.textColor}
              icon={ring.icon}
              label={ring.label}
              size={isMobile ? 80 : 120}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClarityRings;
