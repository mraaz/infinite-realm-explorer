
import React from 'react';

interface Insight {
  title: string;
  description: string;
}

interface InsightSynthesisProps {
  insights: Insight[];
}

const InsightSynthesis = ({ insights }: InsightSynthesisProps) => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
      <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
              <h3 className="font-bold text-gray-800 mb-2 text-lg">Observation: {insight.title}</h3>
              <p className="text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InsightSynthesis;
