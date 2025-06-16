
import React, { useState } from 'react';
// Step 1: Import the 'LucideIcon' type from the library
import { AlertTriangle, Lightbulb, SquareCode, Users, RotateCcw, type LucideIcon } from 'lucide-react';

export interface Insight {
  title: string;
  description: string;
  icon: keyof typeof iconComponents;
  color: string;
}

interface InsightSynthesisProps {
  insights: Insight[];
}

// Step 2: Explicitly type the object as a Record mapping strings to LucideIcon components.
const iconComponents: Record<string, LucideIcon> = {
  AlertTriangle,
  Lightbulb,
  SquareCode,
  Users,
};

const backContent = [
  {
    title: "Action Steps",
    content: "Consider setting boundaries around work hours. Try the 'Two-Minute Rule' - if something takes less than 2 minutes, do it now. For bigger tasks, time-block your calendar to protect deep work time."
  },
  {
    title: "Money Mindset",
    content: "Your saving habits are already stellar! Consider creating a 'Financial Vision Board' - visualize your goals and celebrate small wins. Sometimes anxiety comes from not having a clear picture of 'enough'."
  },
  {
    title: "Social Recharge",
    content: "Quality over quantity in relationships. Try the 'Energy Audit' - after social events, note how you feel. Seek out connections that energize rather than drain you. It's okay to be selective."
  },
  {
    title: "Support Network",
    content: "Your connections are a superpower! Consider creating a 'Support Map' - identify who you can turn to for different types of help. Don't forget to offer support back - it strengthens the network."
  }
];

const InsightSynthesis = ({ insights }: InsightSynthesisProps) => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>(new Array(insights.length).fill(false));

  const handleCardClick = (index: number) => {
    setFlippedCards(prev => prev.map((flipped, i) => i === index ? !flipped : flipped));
  };

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
      <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          // With the fix above, TypeScript now correctly infers 'Icon' as a renderable component.
          const Icon = iconComponents[insight.icon];
          const isFlipped = flippedCards[index];
          const back = backContent[index];
          
          console.log(`Insight ${index}: icon=${insight.icon}, color=${insight.color}`);
          
          return (
            <div 
              key={index} 
              className="flip-card cursor-pointer h-48"
              onClick={() => handleCardClick(index)}
            >
              <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Front of card */}
                <div className="flip-card-front bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
                  <h3 className="font-bold text-gray-800 mb-2 text-lg flex items-center">
                    {/* Apply the color class directly to the icon */}
                    {Icon && <Icon className={`mr-2 h-5 w-5 ${insight.color}`} aria-hidden="true" />}
                    <span>Observation: {insight.title}</span>
                  </h3>
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  <div className="flex items-center justify-end text-sm text-gray-400">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    <span>Click to flip</span>
                  </div>
                </div>
                
                {/* Back of card */}
                <div className="flip-card-back bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-purple-200/80">
                  <h3 className="font-bold text-purple-800 mb-3 text-lg flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-purple-600" aria-hidden="true" />
                    <span>{back.title}</span>
                  </h3>
                  <p className="text-purple-700 text-sm leading-relaxed mb-4">{back.content}</p>
                  <div className="flex items-center justify-end text-sm text-purple-400">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    <span>Click to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InsightSynthesis;
