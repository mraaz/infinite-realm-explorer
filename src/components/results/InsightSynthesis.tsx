
import React from 'react';
import { AlertTriangle, Lightbulb, SquareCode, Users } from 'lucide-react';

export interface Insight {
  title: string;
  description: string;
  icon: keyof typeof iconComponents;
  color: string;
}

interface InsightSynthesisProps {
  insights: Insight[];
}

const iconComponents = {
  AlertTriangle,
  Lightbulb,
  SquareCode,
  Users,
};

const InsightSynthesis = ({ insights }: InsightSynthesisProps) => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
      <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = iconComponents[insight.icon];
          return (
            <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
                <h3 className="font-bold text-gray-800 mb-2 text-lg flex items-center">
                  {Icon && <Icon className={`mr-2 h-5 w-5 ${insight.color}`} aria-hidden="true" />}
                  <span>Observation: {insight.title}</span>
                </h3>
                <p className="text-gray-600">{insight.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  );
};

export default InsightSynthesis;
