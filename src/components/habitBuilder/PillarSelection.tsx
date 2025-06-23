import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/Icon";
import { cn } from "@/lib/utils";

interface PillarSelectionProps {
  onNext: (data: { pillar: string }) => void;
}

const pillars = [
  {
    id: "career",
    name: "Career",
    icon: "career",
    color: "text-purple-400",
    hoverBorder: "hover:border-purple-500",
    iconBg: "bg-purple-500/10",
  },
  {
    id: "financials",
    name: "Financials",
    icon: "financials",
    color: "text-blue-400",
    hoverBorder: "hover:border-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    id: "health",
    name: "Health",
    icon: "health",
    color: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    id: "connections",
    name: "Connections",
    icon: "connections",
    color: "text-amber-400",
    hoverBorder: "hover:border-amber-500",
    iconBg: "bg-amber-500/10",
  },
] as const;

const PillarSelection = ({ onNext }: PillarSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Choose Your Focus Pillar
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Which area of your life do you want to build a new system for?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Card
              key={pillar.id}
              className={cn(
                "cursor-pointer bg-[#1e1e24] border-2 border-transparent text-white ring-1 ring-white/10",
                "transition-all duration-300 ease-in-out transform hover:-translate-y-2",
                pillar.hoverBorder
              )}
              onClick={() => onNext({ pillar: pillar.name })}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    pillar.iconBg
                  )}
                >
                  <Icon
                    name={pillar.icon}
                    className={cn("h-8 w-8", pillar.color)}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {pillar.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillarSelection;
